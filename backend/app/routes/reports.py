from fastapi import APIRouter, HTTPException
from app.db.supabase import supabase

router = APIRouter()

@router.get("/reports/{user_id}")
async def get_user_reports(user_id: str):
    try:
        # Fetch reports descending by creation time
        res = supabase.table("scam_reports") \
                     .select("*") \
                     .eq("user_id", user_id) \
                     .order("created_at", desc=True) \
                     .execute()
        return {"reports": res.data}
    except Exception as e:
        print(f"Error fetching reports from Supabase: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user reports.")
