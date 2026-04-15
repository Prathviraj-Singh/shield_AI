import json
from langchain.tools import tool
from app.db.supabase import supabase
import os
from langchain_google_genai import ChatGoogleGenerativeAI

@tool
def keyword_scanner(message: str) -> str:
    """Scans the message text for Indian scam keywords using a weighted heuristic algorithm. Returns a string with risk_level and matched_keywords."""
    message_lower = message.lower()
    
    # Weighted Indian Scam Dictionary
    high_risk = ['upi', 'otp', 'kyc', 'pan', 'aadhar', 'password', 'cvv']
    med_risk = ['lottery', 'prize', 'urgent', 'suspended', 'winner', 'blocked', 'kbc', 'jio']
    low_risk = ['click', 'link', 'offer', 'job', 'salary', 'earn', 'paise', 'bhejo', 'jeet']
    
    score = 0
    matches = []
    
    for kw in high_risk:
        if kw in message_lower:
            score += 3
            matches.append(kw)
    for kw in med_risk:
        if kw in message_lower:
            score += 2
            matches.append(kw)
    for kw in low_risk:
        if kw in message_lower:
            score += 1
            matches.append(kw)
            
    risk_level = "low"
    if score >= 5:
        risk_level = "high"
    elif score >= 2:
        risk_level = "medium"
        
    return json.dumps({
        "risk_level": risk_level,
        "score": score,
        "matched_keywords": matches
    })

@tool
def gemini_deep_analyzer(message: str) -> str:
    """Sends the message text to Gemini API for deep NLP analysis to determine authenticity.
       Returns JSON string containing is_scam (bool), scam_type (str), confidence (float), and explanation (str).
    """
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.0, google_api_key=os.getenv("GEMINI_API_KEY"))
        
        prompt = f"""You are an elite Cyber Threat Analyst. Your job is to dissect the semantic intent of the provided text.
Identify if it employs Social Engineering, Authority Impersonation, urgency triggers, or malicious payloads.
Return ONLY valid JSON matching this schema exactly: {{"is_scam": bool, "scam_type": "string", "confidence": float, "explanation": "string"}}

Examples of Scams:
"Your SBI Account is SUSPENDED. Click link to update PAN" -> Social Engineering (Bank)
"Earn rs 5000 daily from home just by liking youtube videos" -> Task Fraud

Message to Analyze: {message}"""
        
        res = llm.invoke(prompt)
        content = res.content.replace('```json', '').replace('```', '').strip()
        json.loads(content) 
        return content
    except Exception as e:
        return json.dumps({"is_scam": True, "scam_type": "Unknown Error", "confidence": 0.5, "explanation": f"Deep analysis failure: {str(e)}"})

@tool
def supabase_pattern_matcher(message: str) -> str:
    """Searches the Supabase scam_reports table for similar known historical patterns.
       Returns JSON string {matched: bool, similar_pattern: str, severity: str}
    """
    try:
        search_term = message[:25] # Fuzzy-ish match on preamble
        data = supabase.table("scam_reports").select("*").ilike("message_text", f"%{search_term}%").limit(1).execute()
        
        if data.data and len(data.data) > 0:
            return json.dumps({
                "matched": True,
                "similar_pattern": data.data[0].get("message_text"),
                "severity": "high" if float(data.data[0].get("confidence_score", 0)) > 0.8 else "medium"
            })
        return json.dumps({"matched": False, "similar_pattern": "None", "severity": "low"})
    except Exception as e:
        return json.dumps({"matched": False, "similar_pattern": str(e), "severity": "unknown"})

@tool
def save_to_database(detection_result_json: str) -> str:
    """Takes a full JSON detection result containing message_text, user_id, scam_type, confidence_score, and guidance.
       Saves the scam report to the Supabase scam_reports table.
       Returns JSON {saved: bool, report_id: str}
    """
    try:
        data = json.loads(detection_result_json)
        db_data = {
            "user_id": data.get("user_id", "demo_user"),
            "message_text": data.get("message_text", "Analyzed Content"),
            "scam_type": data.get("scam_type", "Unknown"),
            "confidence_score": float(data.get("confidence_score", 0.0)),
            "guidance": data.get("guidance", "")
        }
        res = supabase.table("scam_reports").insert(db_data).execute()
        report_id = res.data[0]['id'] if res.data else "mock-id-generated"
        return json.dumps({"saved": True, "report_id": report_id})
    except Exception as e:
        return json.dumps({"saved": False, "report_id": str(e)})

@tool
def send_alert(alert_params_json: str) -> str:
    """Receives JSON string with keys user_id, scam_type, confidence.
       If confidence > 0.8, triggers simulated Twilio SMS alert automatically.
       Returns JSON {alert_sent: bool, method: str}
    """
    try:
        params = json.loads(alert_params_json)
        if float(params.get("confidence", 0.0)) > 0.8:
            return json.dumps({"alert_sent": True, "method": "twilio_sms_simulator"})
        return json.dumps({"alert_sent": False, "method": "none"})
    except Exception as e:
        return json.dumps({"alert_sent": False, "method": "error"})

@tool
def generate_guidance(scam_type: str) -> str:
    """Generates specific step-by-step safety guidance mapped tightly to modern scam vectors.
       Returns JSON {guidance: str, steps: list, report_url: str}
    """
    scam = scam_type.lower()
    if 'upi' in scam or 'bank' in scam or 'phishing' in scam:
        return json.dumps({"guidance": "Never enter your UPI pin or password. Financial institutions will never send unverified links.", "steps": ["Block sender instantly", "Contact your bank's official toll-free number", "Do not open any attached links"], "report_url": "cybercrime.gov.in"})
    elif 'otp' in scam:
        return json.dumps({"guidance": "Your OTP is the final key to your account. Do not share it.", "steps": ["Do not share OTP", "Change related account password"], "report_url": "cybercrime.gov.in"})
    elif 'kyc' in scam:
         return json.dumps({"guidance": "KYC updates are never conducted via random SMS links.", "steps": ["Visit your home bank branch", "Ignore the link", "Delete the message"], "report_url": "cybercrime.gov.in"})
    elif 'job' in scam or 'task' in scam or 'youtube' in scam:
         return json.dumps({"guidance": "This is a classic 'Task Fraud'. Scammers will pay you small amounts initially to hook you, then steal thousands.", "steps": ["Do not pay any 'registration' fees", "Block the WhatsApp/Telegram number"], "report_url": "cybercrime.gov.in"})
    elif 'lottery' in scam or 'kbc' in scam:
         return json.dumps({"guidance": "You cannot win a lottery you didn't enter. This is an advance-fee fraud.", "steps": ["Do not pay any 'tax' or 'processing fee'", "Report the number"], "report_url": "cybercrime.gov.in"})
    elif 'safe' in scam or 'none' in scam:
         return json.dumps({"guidance": "Message appears structurally safe.", "steps": ["Exercise normal caution"], "report_url": ""})
    else:
        return json.dumps({"guidance": "Exercise extreme caution. This message exhibits strong hallmarks of social engineering.", "steps": ["Do not click links", "Do not reply", "Verify the sender independently"], "report_url": "cybercrime.gov.in"})
