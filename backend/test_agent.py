import asyncio
import os
import json
import sys

# Inject app context
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.llm_agent import analyze_message_agentic
from app.services.tools import keyword_scanner, generate_guidance, supabase_pattern_matcher

DUMMY_SCAMS = [
    "Dear customer, your SBI account has been suspended due to pending KYC. Click here to verify and share OTP.",
    "Hey! Got your file, let's connect tomorrow safely at 3 PM.",
    "Urgent: You won the KBC ₹50,00,000 Lottery! Send ₹1000 processing fee to this UPI id to claim instantly."
]

async def test_pipeline():
    print("========== INITIALIZING SHIELDAI AGENT TEST PIPELINE ==========")
    
    for idx, message in enumerate(DUMMY_SCAMS):
        print(f"\n[Test Case {idx+1}] ------------------------------------------")
        print(f"Target String: '{message}'\n")
        
        # Test individual tools isolatedly first (to bypass Gemini API key blocks if none exist)
        print("=> Running Individual Tool Logic:")
        print(f"  + Keyword Scanner: {keyword_scanner.invoke({'message': message})}")
        print(f"  + Pattern Matcher: {supabase_pattern_matcher.invoke({'message': message})}")
        
        # Then let the Full Orchestrator Loop run
        print("\n=> Firing Autonomous Agentic ReAct Engine...")
        try:
            if not os.getenv("GEMINI_API_KEY"):
                print("  [Warning] GEMINI_API_KEY not found in env, the deep_analyzer tool may throw exceptions.")
            
            result = await analyze_message_agentic(message, user_id="demo_developer")
            
            print("  [Actions Taken Timeline]:")
            for action in result.get("actions_taken", []):
                print(f"    -> Tool: {action['tool']}")
                print(f"       Observation: {action['observation'][:150]}...")
            
            print("\n  [Final Classification Output]:")
            print(json.dumps(result.get("final_result", {}), indent=2))
        except Exception as e:
            print(f"  [Fatal] Engine Execution Failed synchronously: {e}")

if __name__ == "__main__":
    asyncio.run(test_pipeline())
