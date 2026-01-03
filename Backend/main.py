import os
import json
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- NEW IMPORT
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore, storage
from PIL import Image
import io

# 1. Load Environment Variables
load_dotenv()

# 2. Setup Gemini AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found!")
else:
    genai.configure(api_key=GOOGLE_API_KEY)

# 3. Setup Firebase
# We check if Firebase is already initialized to prevent errors on reload
if not firebase_admin._apps:
    firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
    storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")
    
    if firebase_creds_json:
        cred_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(cred_dict)
        # Initialize with storage bucket if available
        options = {"storageBucket": storage_bucket} if storage_bucket else {}
        firebase_admin.initialize_app(cred, options)
    else:
        print("Warning: FIREBASE_CREDENTIALS not found. Database features won't work.")

# Get Firestore Client
db = firestore.client() if firebase_admin._apps else None

# 4. Initialize FastAPI App
app = FastAPI()

# --- CRITICAL FIX: CORS MIDDLEWARE ---
# This allows your Netlify frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins (Safe for this stage, ensures it works)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
# -------------------------------------

# 5. Data Models
class QueryRequest(BaseModel):
    image: str = None
    text: str = None
    user_id: str = "guest"

# 6. Routes

@app.get("/")
def home():
    return {"message": "Bhasha-Kisan Backend is Live & Connected! 🟢"}

@app.post("/analyze")
async def analyze_crop(
    text: str = Form(None), 
    image: UploadFile = File(None),
    user_id: str = Form("guest")
):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response_text = "No analysis generated."

        # Case A: Image + Text (Crop Doctor)
        if image:
            content = await image.read()
            img = Image.open(io.BytesIO(content))
            prompt = text or "Analyze this crop image. Identify disease, pests, or health status. Provide remedies if needed."
            response = model.generate_content([prompt, img])
            response_text = response.text

        # Case B: Text Only (Voice Assistant)
        elif text:
            prompt = f"You are an expert Indian agriculture assistant named 'Bhasha-Kisan'. Answer this query for a farmer: {text}"
            response = model.generate_content(prompt)
            response_text = response.text

        else:
            raise HTTPException(status_code=400, detail="Please provide an image or text.")

        # Save to Firebase History (if DB is connected)
        if db:
            doc_ref = db.collection("users").document(user_id).collection("history").document()
            doc_ref.set({
                "timestamp": firestore.SERVER_TIMESTAMP,
                "transcript": text or "Image Upload",
                "analysis": "Image Analysis" if image else "Voice Query",
                "response": {"answer": response_text}
            })

        return {"answer": response_text}

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{user_id}")
def get_history(user_id: str):
    if not db:
        return {"history": []}
    try:
        history_ref = db.collection("users").document(user_id).collection("history")
        docs = history_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(10).stream()
        
        history_list = []
        for doc in docs:
            data = doc.to_dict()
            # Convert timestamp to string for JSON compatibility
            if "timestamp" in data and data["timestamp"]:
                data["timestamp"] = data["timestamp"].isoformat()
            history_list.append(data)
            
        return {"history": history_list}
    except Exception as e:
        print(f"History Error: {str(e)}")
        return {"history": []}

# 7. Run Server
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)