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
    print("❌ CRITICAL: GOOGLE_API_KEY not found! Check Render Environment.")
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
            print("⚠️ Warning: FIREBASE_CREDENTIALS missing. History won't save.")
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

# --- HELPER: Try multiple models until one works ---
def get_working_model(is_image=False):
    """
    Tries to return the best available model.
    """
    # List of models to try in order of preference
    if is_image:
        candidates = ["gemini-1.5-flash", "gemini-pro-vision", "gemini-1.5-pro"]
    else:
        candidates = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"]
    
    # Just return the first one for now, the try/catch in analyze will handle the fallback
    return candidates

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
        response_text = ""
        prompt_parts = []
        
        # 1. Prepare Data
        if text:
            print(f"📝 Text detected: {text}")
            prompt_parts.append(text)
        else:
            prompt_parts.append("Analyze this crop image. Identify disease, pests, or health status. Provide remedies.")

        if image:
            print(f"📸 Image detected: {image.filename}")
            content = await image.read()
            # Standard blob format for modern Gemini
            image_blob = {"mime_type": image.content_type, "data": content}
            prompt_parts.append(image_blob)

        if not prompt_parts:
            return {"answer": "Please provide text or an image."}

        # 2. INTELLIGENT MODEL TRY-CATCH SYSTEM
        # We try the best model first. If it crashes (404), we try the old one.
        
        # ATTEMPT 1: Try Gemini 1.5 Flash (The Best/Fastest)
        try:
            print("Attempting Model: gemini-1.5-flash")
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(prompt_parts)
            response_text = response.text
            
        except Exception as e_flash:
            print(f"⚠️ Flash Failed ({e_flash}). Switching to backup...")
            
            # ATTEMPT 2: Try Gemini Pro / Vision (The Old Reliable)
            try:
                model_name = "gemini-pro-vision" if image else "gemini-pro"
                print(f"Attempting Model: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt_parts)
                response_text = response.text
                
            except Exception as e_pro:
                print(f"❌ All models failed. Error: {e_pro}")
                
                # DIAGNOSTIC: Ask server what models it actually has
                available = []
                try:
                    for m in genai.list_models():
                        available.append(m.name)
                except:
                    available = ["Could not list models"]
                
                # Return the error TO THE FRONTEND so the user sees it
                return {
                    "answer": f"SYSTEM ERROR: Your server rejected all models.\n"
                              f"Server Error: {str(e_pro)}\n"
                              f"Available Models on Server: {available}"
                }

        # 3. Success! Send response.
        print("✅ Analysis Successful!")
        
        # Save to Firebase (Optional)
        if db:
            try:
                db.collection("users").document(user_id).collection("history").add({
                    "timestamp": firestore.SERVER_TIMESTAMP,
                    "transcript": text or "Image Upload",
                    "analysis": response_text[:100] + "...", 
                    "response": {"answer": response_text}
                })
            except:
                pass

        return {"answer": response_text}

    except Exception as e:
        print(f"🔥 CRITICAL SERVER ERROR: {str(e)}")
        traceback.print_exc()
        return {"answer": f"Critical Error: {str(e)}"}

# 6. Run Server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)