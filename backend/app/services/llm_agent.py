import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

def get_llm():
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        temperature=0.1,
        google_api_key=os.getenv("GEMINI_API_KEY")
    )

async def analyze_message(message: str) -> dict:
    try:
        llm = get_llm()
        
        prompt = PromptTemplate(
            template="""You are an advanced Cyber Safety and Fraud Detection AI specializing in the Indian context.
Your task is to analyze the following message and determine whether it is a scam.
Specifically, watch out for these common Indian scam patterns:
- UPI fraud (payment requests, QR code scanning, "receive money" tricks)
- OTP scams (bank, delivery, KYC verification)
- Fake KYC updates (PAN, Aadhar, Bank account suspension)
- Lottery and prize scams (KBC lottery, WhatsApp lottery)
- Fake job offers (part-time work, YouTube like/subscribe jobs, work from home)
- Sextortion or loan app harassment

You MUST return a valid JSON object with EXACTLY the following format, and no other text:
{{
    "is_scam": boolean,
    "scam_type": string (categorize the scam, e.g., "UPI Fraud", "OTP Scam", or "None" if safe),
    "confidence": float (between 0.0 and 1.0),
    "guidance": string (concise advice on what the user should do, e.g., "Do not share OTP" or "Message appears safe")
}}

Message to analyze:
{message}
""",
            input_variables=["message"]
        )

        chain = prompt | llm | JsonOutputParser()
        result = await chain.ainvoke({"message": message})
        
        return {
            "is_scam": bool(result.get("is_scam", False)),
            "scam_type": str(result.get("scam_type", "Unknown")),
            "confidence": float(result.get("confidence", 0.0)),
            "guidance": str(result.get("guidance", "Stay vigilant and avoid sharing sensitive data."))
        }
    except Exception as e:
        print(f"Error in llm_agent analyze_message: {e}")
        return {
            "is_scam": True,
            "scam_type": "Analysis Error",
            "confidence": 0.0,
            "guidance": "An error occurred during AI analysis. Please exercise caution with this message."
        }
