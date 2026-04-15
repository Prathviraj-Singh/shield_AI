from fastapi import APIRouter, HTTPException
from app.models.schemas import DetectRequest, DetectResponse
from app.services.classifier import classify_message_risk
from app.services.llm_agent import analyze_message
from app.db.supabase import supabase

router = APIRouter()

@router.post("/detect", response_model=DetectResponse)
async def detect_scam(request: DetectRequest):
    try:
        # Pre-screening (Can be used for fast routing/tagging in the future)
        risk_level = classify_message_risk(request.message)
        
        # Deep analysis with LLM
        llm_result = await analyze_message(request.message)
        
        response_data = DetectResponse(
            is_scam=llm_result["is_scam"],
            scam_type=llm_result["scam_type"],
            confidence=llm_result["confidence"],
            guidance=llm_result["guidance"]
        )
        
        # Save to Supabase (only if user_id is provided)
        if request.user_id:
            try:
                db_data = {
                    "user_id": request.user_id,
                    "message_text": request.message,
                    "scam_type": response_data.scam_type,
                    "confidence_score": response_data.confidence,
                    "guidance": response_data.guidance
                }
                supabase.table("scam_reports").insert(db_data).execute()
            except Exception as db_err:
                print(f"Failed to log report to DB: {db_err}")
                # We don't fail the API request if DB logging fails

        return response_data
    except Exception as e:
        print(f"Error in /detect route: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error during detection")
