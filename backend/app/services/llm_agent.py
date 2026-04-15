import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory

from app.services.tools import (
    keyword_scanner,
    gemini_deep_analyzer,
    supabase_pattern_matcher,
    save_to_database,
    send_alert,
    generate_guidance
)

# Global memory storage mapped dynamically by user_id
memory_store = {}

def get_memory(user_id: str) -> ConversationBufferMemory:
    if user_id not in memory_store:
        memory_store[user_id] = ConversationBufferMemory(
            memory_key="chat_history", 
            return_messages=True
        )
    return memory_store[user_id]

# Initialize LLM & Toolsets
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", 
    temperature=0.1, 
    google_api_key=os.getenv("GEMINI_API_KEY")
)

tools = [
    keyword_scanner, 
    gemini_deep_analyzer, 
    supabase_pattern_matcher, 
    save_to_database, 
    send_alert, 
    generate_guidance
]

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a highly advanced Cyber Safety and Fraud Detection Agent. 
You must autonomously use your tools in a ReAct loop to investigate the user's message.
Follow this workflow logic mentally:
1. Use `keyword_scanner` to find high-risk keywords immediately.
2. Use `gemini_deep_analyzer` for definitive NLP extraction.
3. Use `supabase_pattern_matcher` to see if we've flagged this in the past.
4. Use `generate_guidance` to build a recovery plan.
5. Use `save_to_database` and `send_alert` passively to finalize the process.

When you finish investigating, ALWAYS emit your Final Answer exactly in this JSON format layout:
{{
  "is_scam": true/false,
  "scam_type": "The detected category",
  "confidence": 0.95,
  "guidance": "Safety instructions"
}}
Do NOT output markdown (e.g. ```json). Output raw parsable JSON only."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "Analyze this message safely, user_id is {user_id}. Message: {input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# Using tool-calling agent to guarantee reliable structural execution on Gemini 1.5
agent = create_tool_calling_agent(llm, tools, prompt)

async def analyze_message_agentic(message: str, user_id: str) -> dict:
    memory = get_memory(user_id)
    
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        memory=memory, 
        verbose=True,
        return_intermediate_steps=True
    )
    
    try:
        response = await agent_executor.ainvoke({"input": message, "user_id": user_id})
        
        # Parse reasoning traces (Thought -> Action -> Observation)
        actions_taken = []
        for action, observation in response.get("intermediate_steps", []):
            actions_taken.append({
                "tool": str(action.tool),
                "observation": str(observation).strip()[:500] # Cap observation length for cleanliness
            })
            
        # Parse final result node safely
        raw_final = str(response.get("output", "")).replace('```json', '').replace('```', '').strip()
        try:
            final_json = json.loads(raw_final)
        except json.JSONDecodeError:
            final_json = {
                "is_scam": True,
                "scam_type": "Parsing Error",
                "confidence": 0.0,
                "guidance": "Failed to serialize the agent's ultimate findings. Output was: " + raw_final[:50]
            }
            
        return {
            "actions_taken": actions_taken,
            "final_result": final_json
        }
        
    except Exception as e:
        print(f"Agentic Execution Error: {e}")
        return {
            "actions_taken": [{"tool": "System", "observation": f"Fatal loop fault: {e}"}],
            "final_result": {
                "is_scam": True, 
                "scam_type": "System Error", 
                "confidence": 0.0, 
                "guidance": "The LangChain agent pipeline failed destructively."
            }
        }
