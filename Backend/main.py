import os
import json
import uvicorn
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
    
    # --- DEBUG: PRINT AVAILABLE MODELS ---
    print("\n🔍 CHECKING AVAILABLE MODELS...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"   👉 {m.name}")
    except Exception as e:
        print(f"   ⚠️ Could not list models: {e}")
    print("--------------------------------\n")

# 3. Setup Firebase
db = None
try:
    if not firebase_admin._apps:
        # Check for Render's Environment Variable first
        firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if firebase_creds_json:
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase Connected (via Env Var)")
        # Fallback to local file (for your laptop)
        elif os.path.exists("serviceAccountKey.json"):
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase Connected (via File)")
        else:
            print("⚠️ No Firebase credentials found.")
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
    return {"message": "Bhasha-Kisan Backend is Live 🟢"}

@app.get("/check-models")
def check_models():
    """Helper route to see models in the browser"""
    try:
        model_list = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                model_list.append(m.name)
        return {"available_models": model_list}
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyze")
async def analyze_crop(
    text: str = Form(None), 
    image: UploadFile = File(None),
    user_id: str = Form("guest")
):
    print("\n--- 🚀 REQUEST START ---")
    
    try:
        # --- SAFE MODE: Using 'gemini-pro' first ---
        # Once we see the logs, we will switch back to Flash.
        # This model is older but extremely stable.
        # Use the specific, powerful model from your list
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt_parts = []
        
        # System Prompt
        prompt_parts.append(
            "You are Bhasha-Kisan, an expert AI agricultural assistant. "
            "Answer simply in the user's detected language."
        )

        if text:
            print(f"📝 Query: {text}")
            prompt_parts.append(f"User Question: {text}")
            
        if image:
            print(f"📸 Image received: {image.filename}")
            content = await image.read()
            image_blob = {"mime_type": image.content_type, "data": content}
            prompt_parts.append(image_blob)

        # Generate
        print("📡 Sending to Gemini...")
        response = model.generate_content(prompt_parts)
        print("✅ Success!")
        
        answer_text = response.text
        return {"answer": answer_text}

    except Exception as e:
        print(f"🔥 ERROR: {str(e)}")
        traceback.print_exc()
        return {"answer": f"Error: {str(e)}"}

if __name__ == "__main__":
    # Use PORT 8080 to match Render
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)