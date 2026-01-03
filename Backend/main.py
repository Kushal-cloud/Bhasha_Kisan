import os
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict

# CORRECTION: Import matches the filename 'firebase_backend.py'
from firebase_service import FirebaseService
from gemini_service import GeminiService

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bhasha-Kisan API")

# 1. Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Initialize Services
try:
    firebase = FirebaseService()
    gemini = GeminiService()
except Exception as e:
    logger.error(f"Service Initialization Failed: {e}")
    # We don't raise here to allow the app to start, but health checks will fail
    firebase = None
    gemini = None

# 3. Data Models
class UserProfileUpdate(BaseModel):
    language: Optional[str] = "hi-IN"
    location: Optional[dict] = {}
    crops: Optional[list] = []
    farm_size: Optional[float] = 0

class TextQuery(BaseModel):
    query: str
    language: str = "hi-IN"

# 4. API Endpoints

@app.get("/health")
async def health_check():
    if not firebase or not gemini:
         raise HTTPException(status_code=503, detail="Services not initialized")
    
    firebase_status = firebase.is_healthy()
    gemini_status = gemini.is_healthy()
    
    if firebase_status and gemini_status:
        return {"status": "healthy"}
    
    raise HTTPException(status_code=503, detail="One or more services are unhealthy")

@app.post("/analyze-crop/{user_id}")
async def analyze_crop(user_id: str, image: UploadFile = File(...)):
    if not gemini or not firebase:
        raise HTTPException(status_code=503, detail="Services unavailable")
        
    try:
        image_data = await image.read()
        
        # 1. Analyze with Gemini
        analysis = await gemini.analyze_crop_disease(image_data=image_data)
        
        # 2. Store in Firebase
        analysis_id = await firebase.store_crop_analysis(
            user_id=user_id,
            analysis=analysis,
            image_url=None, 
            audio_url=None
        )
        
        return {"analysis_id": analysis_id, "result": analysis}
    except Exception as e:
        logger.error(f"Analysis Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze crop image")

@app.post("/query/{user_id}")
async def process_query(user_id: str, data: TextQuery):
    if not gemini or not firebase:
        raise HTTPException(status_code=503, detail="Services unavailable")

    try:
        # 1. Get AI Response
        ai_response = await gemini.process_agricultural_query(
            query=data.query, 
            language=data.language
        )
        
        # 2. Store Query History
        query_id = await firebase.store_voice_query(
            user_id=user_id,
            transcript=data.query,
            language=data.language,
            confidence=ai_response.get("confidence", 1.0)
        )
        
        return {"query_id": query_id, "response": ai_response}
    except Exception as e:
        logger.error(f"Query Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process agricultural query")

@app.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 20):
    if not firebase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    history = await firebase.get_user_history(user_id, limit=limit)
    return {"history": history}

@app.post("/profile/{user_id}")
async def update_profile(user_id: str, profile: UserProfileUpdate):
    if not firebase:
        raise HTTPException(status_code=503, detail="Database unavailable")
    result = await firebase.create_user_profile(user_id, profile.dict())
    return {"status": "success", "profile": result}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
