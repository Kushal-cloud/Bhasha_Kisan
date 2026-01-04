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
    print("❌ CRITICAL: GOOGLE_API_KEY not found in Environment!")
else:
    genai.configure(api_key=GOOGLE_API_KEY)
    print("✅ Gemini AI Configured")

# 3. Setup Firebase
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
        else:
            print("⚠️ Warning: FIREBASE_CREDENTIALS missing. History won't be saved.")
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
    return {"message": "Bhasha-Kisan Backend is Live & Connected! 🟢"}

@app.post("/analyze")
async def analyze_crop(
    text: str = Form(None), 
    image: UploadFile = File(None),
    user_id: str = Form("guest")
):
    print("\n--- 🚀 NEW REQUEST RECEIVED ---")
    print(f"👤 User: {user_id}")
    
    try:
        # Use the Flash model
        model = genai.GenerativeModel("gemini-pro")
        
        prompt_parts = []
        
        # 1. Handle Text
        if text:
            print(f"📝 Text detected: {text}")
            prompt_parts.append(text)
        else:
            # Default prompt if only image is sent
            prompt_parts.append("Analyze this crop image. Identify disease, pests, or health status. Provide remedies if needed.")

        # 2. Handle Image (CRITICAL FIX: Send Bytes, not PIL Object)
        if image:
            print(f"📸 Image detected: {image.filename}")
            content = await image.read()
            
            # Create the specific blob format Gemini Flash expects
            image_blob = {
                "mime_type": image.content_type,
                "data": content
            }
            prompt_parts.append(image_blob)
            print("✅ Image processed into Bytes")

        if not prompt_parts:
            return {"answer": "Please provide text or an image."}

        # 3. Send to Gemini
        print("📡 Sending to Gemini API...")
        response = model.generate_content(prompt_parts)
        print("✅ Gemini Response Received!")
        
        answer_text = response.text
        
        # 4. Save to Firebase (Async-safe)
        if db:
            try:
                db.collection("users").document(user_id).collection("history").add({
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "transcript": text or "Image Upload",
                    "analysis": answer_text[:100] + "...", 
                    "response": {"answer": answer_text}
                })
                print("💾 Saved to History")
            except Exception as db_err:
                print(f"⚠️ Database Save Failed: {db_err}")

        return {"answer": answer_text}

    except Exception as e:
        print(f"🔥 CRITICAL SERVER ERROR: {str(e)}")
        traceback.print_exc() # Prints the exact line number of the crash
        return {"answer": f"Server Error: {str(e)}. Check Render Logs."}

@app.get("/history/{user_id}")
def get_history(user_id: str):
    if not db:
        return {"history": []}
    try:
        # Fixed query to properly stream docs
        history_ref = db.collection("users").document(user_id).collection("history")
        docs = history_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()
        
        history_list = []
        for doc in docs:
            data = doc.to_dict()
            if "timestamp" in data and data["timestamp"]:
                data["timestamp"] = str(data["timestamp"])
            history_list.append(data)
            
        return {"history": history_list}
    except Exception as e:
        print(f"History Error: {e}")
        return {"history": []}

# 6. Run Server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)