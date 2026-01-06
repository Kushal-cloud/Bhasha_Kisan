# Use python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system tools
RUN apt-get update && apt-get install -y \
    gcc \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Critical Packages DIRECTLY (Added google-genai for safety)
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

# Set Port to 8080 (Matches Render's expectation)
ENV PORT=8080

# Expose Port 8080
EXPOSE 8080

# Start Command - Uses port 8080
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]