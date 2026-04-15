from fastapi import APIRouter, HTTPException
from app.models.schemas import DetectRequest, DetectResponse, ActionStep
from app.services.llm_agent import analyze_message_agentic

router = APIRouter()

@router.post("/detect", response_model=DetectResponse)
async def detect_scam(request: DetectRequest):
    try:
        # Full Agentic Loop execution handling Tool orchestration and Sub-processing internally
        agent_payload = await analyze_message_agentic(request.message, request.user_id)
        
        actions = agent_payload["actions_taken"]
        final = agent_payload["final_result"]
        
        # Pydantic schema validation mapping safely to output target
        return DetectResponse(
            is_scam=final.get("is_scam", False),
            scam_type=final.get("scam_type", "Unknown"),
            confidence=float(final.get("confidence", 0.0)),
            guidance=final.get("guidance", "Stay vigilant and avoid sharing sensitive data."),
            actions_taken=[ActionStep(**action) for action in actions]
        )
    except Exception as e:
        print(f"Error in /detect autonomous agent route: {e}")
        raise HTTPException(status_code=500, detail="Internal AI Agent Orchestration Error")
