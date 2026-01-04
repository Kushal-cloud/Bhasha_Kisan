import os
import json
import uvicorn
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore

# 1. Load Environment Variables
load_dotenv()

# 2. Setup Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("❌ CRITICAL: GOOGLE_API_KEY not found!")
else:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("✅ Gemini AI Configured")

# 3. Setup Firebase (Standard)
db = None
try:
    if not firebase_admin._apps:
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if firebase_creds_json:
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase Connected")
except Exception as e:
    print(f"⚠️ Firebase Error: {e}")

# 4. Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5. Routes

@app.get("/")
def home():
    return {"message": "Bhasha-Kisan Backend is Live (Powered by Gemini 2.0) 🟢"}

@app.post("/analyze")
async def analyze_crop(
    text: str = Form(None), 
    image: UploadFile = File(None),
    user_id: str = Form("guest")
):
    print("\n--- 🚀 REQUEST START ---")
    
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt_parts = []
        
        # 1. Add Text to Prompt
        if text:
            print(f"📝 Text: {text}")
            prompt_parts.append(text)
        else:
            prompt_parts.append("Analyze this crop image. Identify disease, pests, or health status. Provide remedies.")

        # 2. Add Image to Prompt
        if image:
            print(f"📸 Image: {image.filename}")
            content = await image.read()
            image_blob = {"mime_type": image.content_type, "data": content}
            prompt_parts.append(image_blob)

        if not prompt_parts:
            return {"answer": "Please provide text or an image."}

        # 3. Generate
        print("📡 Sending to Gemini 2.0 Flash...")
        response = model.generate_content(prompt_parts)
        print("✅ Success!")
        
        answer_text = response.text
        
        # 4. Save to History
        if db:
            try:
                db.collection("users").document(user_id).collection("history").add({
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "transcript": text or "Image Upload",
                    "analysis": answer_text[:100] + "...", 
                    "response": {"answer": answer_text}
                })
            except:
                pass

        return {"answer": answer_text}

    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")
        traceback.print_exc()
        # Return the error to the UI so we can see it
        return {"answer": f"Error: {str(e)}"}

@app.get("/history/{user_id}")
def get_history(user_id: str):
    if not db: return {"history": []}
    try:
        docs = db.collection("users").document(user_id).collection("history")\
                 .order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()
        return {"history": [d.to_dict() for d in docs]}
    except:
        return {"history": []}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)