# Use python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system tools (ffmpeg, sound libraries)
RUN apt-get update && apt-get install -y \
    gcc \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# --- NUCLEAR FIX: Install Critical Packages DIRECTLY ---
# We do not rely on requirements.txt for these key libraries anymore.
RUN pip install --no-cache-dir \
    uvicorn \
    fastapi \
    python-multipart \
    python-dotenv \
    firebase-admin \
    "google-generativeai>=0.7.2" \
    pillow \
    requests \
    httpx \
    pydantic

# Copy the rest of the code
COPY . .

# Set Port
ENV PORT=10000

# Expose Port
EXPOSE 10000

# Start Command (Explicit Python Call)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]