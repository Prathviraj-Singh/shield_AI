def classify_message_risk(message: str) -> str:
    msg_lower = message.lower()
    
    # Common Indian scam keywords
    high_risk_keywords = [
        "otp", "kyc", "upi", "pin", "pan card", "aadhar", "sbi", "hdfc", "icici", "yono",
        "lottery", "kbc", "prize", "reward", "win", 
        "block", "suspend", "urgent action", "verify your account", "electricity bill", "disconnect",
        "youtube video", "like and subscribe", "part time job", "work from home", "daily income"
    ]
    
    critical_matches = ["otp", "upi pin", "kyc suspended", "kbc lottery", "electricity disconnection"]
    
    hits = sum(1 for kw in high_risk_keywords if kw in msg_lower)
    
    if hits >= 2 or any(crit in msg_lower for crit in critical_matches):
        return "high"
    elif hits == 1:
        return "medium"
    else:
        return "low"
