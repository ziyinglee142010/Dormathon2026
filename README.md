# Assisted Emotion Tagging System

> A comprehensive emotion tagging system for video content analysis, built as a Final Year Project (FYP).

[![Django](https://img.shields.io/badge/Django-Backend-green.svg)](https://www.djangoproject.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.0-646CFF.svg)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-ML_Service-009688.svg)](https://github.com/jordanpenguins/emotion-ml-service)

---
## 🧐 Who is this for?

**Target Users:** Mental health professionals and therapists

**The Problem:**
- Existing teletherapy platforms like BetterHelp focus on communication but lack emotion analysis tools
- Therapists must manually review hours of recorded sessions to identify key emotional moments
- This manual process is time-consuming and inefficient

**Our Solution:**
Our system **assists, not replaces** the therapist's workflow by automatically analyzing recorded sessions and highlighting emotional patterns, allowing therapists to focus on what matters most—their patients. 

---

## 📋 Table of Contents

- [Who is this for?](#-who-is-this-for)
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Screenshots & Features](#-screenshots--features)
- [Project Structure](#-project-structure)
- [Installation Guide](#️-installation-guide)
- [Usage](#-usage)
- [Environment Variables](#-environment-variables)
- [Notes](#-notes)
- [Contact](#-contact)
- [Related Resources](#-related-resources)

---

## 🔍 Overview

The Assisted Emotion Tagging System is an intelligent platform designed to analyze and tag emotional content in videos using deep learning.

**System Architecture:**
This repository contains the main Django backend and React frontend application.  The emotion detection is powered by a separate **ML inference service** built with FastAPI and deployed on Google Cloud Run. The backend makes API calls to this ML service to process videos and receive emotion predictions.

> 🧠 **For detailed information about the deep learning model, architecture, training process, and technical specifications**, please visit the **[Emotion ML Service Repository](https://github.com/jordanpenguins/emotion-ml-service)**.

**Key Capabilities:**
- 🎯 **Deep Learning-Powered Analysis**: Custom model trained for emotion recognition
- 🎥 **Video Processing**: Upload and process video content for frame-by-frame emotion analysis
- ⚡ **GPU-Accelerated Inference**: FastAPI service containerized with NVIDIA CUDA for parallel computation
- 🤖 **AI Integration**: Powered by Google Gemini API for intelligent content tagging and summarization
- 📹 **Zoom Integration**: Connect with Zoom meetings for real-time analysis
- 🔐 **Authentication**:  Secure user authentication with JWT tokens
- 📊 **Rich Analytics**: Emotion distribution, dominant emotions, and temporal analysis

---

## ✨ Features

- 🎥 **Video Upload & Processing**: Upload videos for automated emotion analysis across frames
- 🧠 **Custom ML Model**: VIT-Large based emotion classifier with GPU acceleration
- 🔄 **Microservice Architecture**:  Decoupled ML inference service for scalability
- 🤖 **AI-Powered Insights**: Google Gemini API integration for content understanding
- 📹 **Zoom Integration**: Live meeting analysis capabilities
- 🔐 **Secure Authentication**: JWT-based user authentication system
- 📝 **Rich Text Editor**: TipTap editor integration for notes and annotations
- 📈 **Data Visualization**: ApexCharts for emotion analytics and reporting
- ⚡ **Asynchronous Processing**: Celery workers for background video processing
- 🎨 **Modern UI**:  Responsive design with React, Tailwind CSS, and Flowbite components
- ☁️ **Cloud Integration**: Firebase storage and Google Cloud deployment

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.0.0
- **Styling**: Tailwind CSS, Flowbite, SASS
- **UI Components**: Flowbite React, Radix UI
- **Rich Text Editor**: TipTap
- **Charts**: ApexCharts, React ApexCharts
- **Video**:  React Player, Agora RTC
- **State Management**: React Router DOM
- **HTTP Client**: Axios
- **Authentication**: JWT Decode
- **Backend Services**:  Supabase, Firebase

### Backend
- **Framework**: Django (Python 3.8+)
- **Database**: PostgreSQL
- **Task Queue**: Celery
- **Message Broker**: Redis
- **Cloud Storage**: Firebase
- **API Integrations**: 
  - **[Emotion ML Service](https://github.com/jordanpenguins/emotion-ml-service)** (FastAPI)
  - Google Gemini API (AI/ML)
  - Zoom API (Video Conferencing)

### ML Inference Service
> **Maintained in separate repository**:  [jordanpenguins/emotion-ml-service](https://github.com/jordanpenguins/emotion-ml-service)
- **Framework**: FastAPI
- **Container**:  NVIDIA CUDA Docker image (GPU support)
- **Deployment**: Google Cloud Run
- **Languages**: Python, Jupyter Notebook (98. 2% notebook for model training)

---

## 📸 Screenshots & Features

### 1. Session Upload
Upload recorded therapy sessions for automated emotion analysis. 

![Session Upload](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_1.png)

**Features:**
- Add new sessions with patient details
- Upload existing video recordings
- Automatic background processing queue

---

### 2. Session Management
Edit and manage patient information while videos process in the background.

![Session Management](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_2.png)

**Features:**
- Real-time processing status
- Editable patient details
- Celery-powered asynchronous task queue

---

### 3. Dashboard Overview
Centralized view of all upcoming therapy sessions and recent activity.

![Dashboard](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_3.png)

**Features:**
- Upcoming session calendar
- Quick access to recent analyses
- Session status tracking

---

### 4. Patient Management
Comprehensive patient directory with session history.

![Patient List](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_4.png)

**Features:**
- View all patients and their profiles
- Access complete session history
- Quick navigation to patient details

---

### 5. System Architecture
End-to-end workflow from video upload to emotion analysis results.

![System Architecture](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_5.jpg)

**Data Flow:**
1. User uploads video through React frontend
2. Django backend stores video and creates processing task
3. Celery worker sends video to **[Emotion ML Service API](https://github.com/jordanpenguins/emotion-ml-service)**
4. ML Service performs GPU-accelerated inference
5. Predictions (emotion labels, confidence scores, timestamps) returned to backend
6. Results stored in PostgreSQL and displayed in frontend analytics

---

### 6. AI-Powered Emotion Summary
Google Gemini generates objective emotion summaries without clinical interpretation.

![Gemini Integration](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_5.png)

**Key Design Choice:**
- Gemini is prompted to provide **factual emotion summaries only**
- Does not generate clinical insights or recommendations
- Preserves therapist's professional judgment and expertise

---

### 7. Emotion Analysis & Visualization
Interactive charts and manual editing capabilities for emotion tags.

![Data Visualization](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_6.png)

**Features:**
- **Manual Override**: Edit emotion tags at specific timestamps if AI prediction is incorrect
- **Session Comparison**: Compare past sessions using radial graphs
- **Progress Tracking**:  Identify emotional improvements over time

---

### 8. Session Notes & Trend Analysis
Long-term emotional pattern tracking across multiple sessions.

![Trend Visualization](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_7.png)

**Features:**
- View emotion trends over time
- Cross-session pattern analysis
- Integrated session notes with rich text editor

---

### 9. ML Pipeline Architecture
Face-matching ensures accurate patient emotion detection in multi-person recordings.

![ML Pipeline 1](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_8.png)
![ML Pipeline 2](https://github.com/ziyinglee142010/FYP/blob/main/fyp_slide_9.png)

**Technical Implementation:**
- **Face Matching**: Identifies and isolates patient's face from therapist or other participants
- **Frame Processing**: Analyzes video at configurable intervals (default: 60 frames)
- **Confidence Scoring**: Each emotion prediction includes confidence level
- **Multi-Face Handling**: Ensures only patient emotions are analyzed in Zoom recordings

> 💡 For detailed ML architecture and model training process, see the **[Emotion ML Service Repository](https://github.com/jordanpenguins/emotion-ml-service)**. 

---

## 📁 Project Structure

```
FYP/
├── backend/                  # Django backend application
│   ├── backend/             # Core Django settings and configuration
│   ├── myapp/               # Main application module
│   ├── manage.py            # Django management script
│   ├── requirements. txt     # Python dependencies
│   └── firebase_key.json    # Firebase service account key
├── my-app/                  # React frontend application
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   ├── package. json         # Node.js dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
├── . gitignore
└── README.md
```

**Related Repository:**
- **[emotion-ml-service](https://github.com/jordanpenguins/emotion-ml-service)**: Standalone ML inference API (not included in this repo)

---

## 🛠️ Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed: 
- **Python** 3.8 or higher
- **Node.js** and npm
- **PostgreSQL** database
- **Redis** server (for Celery message broker)
- **Access to Emotion ML Service API** (deployed or local instance)

### 1. Clone the Repository

```bash
git clone https://github.com/ziyinglee142010/FYP. git
cd FYP
```

---

### 2. Backend Setup

#### Install Python Dependencies

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install required packages
pip install -r requirements. txt
```

#### Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
SECRET_KEY=your_development_secret_key
CELERY_BROKER_URL=redis://localhost:6379/0


# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Zoom Integration
ZOOM_ACCOUNT_ID=your_zoom_account_id_here
ZOOM_CLIENT_ID=your_zoom_client_id_here
ZOOM_CLIENT_SECRET=your_zoom_client_secret_here
ZOOM_FALLBACK_HOST_EMAIL=your_fallback_email_here

# PostgreSQL Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost  # or your_db_host
DB_PORT=5432
```

> **Note**: You'll need to set up your own PostgreSQL database, either locally (e.g., using pgAdmin) or through a cloud provider such as Supabase, Railway, or Render.


#### Run Database Migrations

```bash
python manage.py migrate
python manage.py createsuperuser  # Create an admin user
```

---

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd ../my-app

# Install npm packages
npm install
```

#### Frontend Environment Variables

Create a `.env` file in the `my-app` directory:

```bash
# my-app/.env
VITE_API_URL=http://localhost:8000  # Your backend URL
```

---

### 4. Redis Setup (Message Broker)

You need a running Redis instance for Celery.  Choose one of the following:

**Option A: Local Installation**
```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://redis.io/download or use WSL
```

**Option B: Cloud Provider**
- Google Cloud Memorystore
- Upstash
- Redis Cloud
- AWS ElastiCache

---

### 5. ML Service Setup (Optional - for local development)

If you want to run the ML service locally for testing: 

```bash
# Clone the ML service repository
git clone https://github.com/jordanpenguins/emotion-ml-service.git
cd emotion-ml-service

# Follow setup instructions in that repository's README
# The service will typically run on http://localhost:8001
```

For production use, the ML service is deployed on Google Cloud Run.  See the [emotion-ml-service README](https://github.com/jordanpenguins/emotion-ml-service) for deployment details.

---

## 🚀 Usage

### Running the Application

You'll need **three terminal windows** running simultaneously:

#### Terminal 1: Backend Server

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

#### Terminal 2:  Celery Worker

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# macOS/Linux: 
celery -A backend worker --loglevel=info

# Windows:
celery -A backend worker --loglevel=info --pool=solo
```

#### Terminal 3: Frontend Server

```bash
cd my-app
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in your terminal)

---

## 🔐 Environment Variables

### Backend (. env)

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Django secret key for cryptographic signing | ✅ Yes |
| `CELERY_BROKER_URL` | Redis connection URL for Celery | ✅ Yes |
| `EMOTION_ML_SERVICE_URL` | URL endpoint for the ML inference API | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |
| `ZOOM_ACCOUNT_ID` | Zoom account ID | ✅ Yes |
| `ZOOM_CLIENT_ID` | Zoom OAuth client ID | ✅ Yes |
| `ZOOM_CLIENT_SECRET` | Zoom OAuth client secret | ✅ Yes |
| `ZOOM_FALLBACK_HOST_EMAIL` | Default Zoom host email | ✅ Yes |
| `DB_NAME` | PostgreSQL database name | ✅ Yes |
| `DB_USER` | PostgreSQL username | ✅ Yes |
| `DB_PASSWORD` | PostgreSQL password | ✅ Yes |
| `DB_HOST` | PostgreSQL host | ✅ Yes |
| `DB_PORT` | PostgreSQL port (default: 5432) | ✅ Yes |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes |


## 📝 Notes

### ML Service Integration

The backend communicates with the emotion ML service via REST API calls: 

**Request Format:**
```json
{
  "video_url": "https://storage.googleapis.com/.. .",
  "patient_photo_url": "https://storage.googleapis.com/...",
  "frame_interval": 60
}
```

**Response Format:**
```json
{
  "success": true,
  "duration_seconds": 120. 5,
  "predictions": [
    {
      "start":  "00:00:02",
      "end": "00:00:04",
      "emotion": "happy",
      "confidence": 0.87
    }
  ],
  "summary": {
    "total_predictions": 60,
    "dominant_emotion": "neutral",
    "emotion_distribution": {... }
  }
}
```

For comprehensive details about the ML model architecture, training process, and inference optimization, visit **[jordanpenguins/emotion-ml-service](https://github.com/jordanpenguins/emotion-ml-service)**.

### Security Considerations

- **Never commit** `.env` files or sensitive credentials to version control
- Keep your `SECRET_KEY` secure and use a strong, random value in production
- Store `firebase_key.json` securely and add it to `.gitignore`
- Use environment-specific configurations for development, staging, and production
- Ensure ML service API endpoints are properly authenticated in production

### Database Setup

- For local development, install PostgreSQL using: 
  - **macOS**: `brew install postgresql`
  - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)
  - **Linux**: `sudo apt-get install postgresql`
- For cloud hosting, consider:  Supabase, Railway, Render, or AWS RDS

### Development Tips

- Use Django admin at `http://localhost:8000/admin` for backend management
- Monitor Celery tasks in the worker terminal for async job status and ML API calls
- Check browser console for frontend errors and network requests
- Use React DevTools for component debugging
- Test ML service connectivity using `/health` or `/docs` endpoints (if available)


---

## 📧 Contact

**Project Authors**:  
- **Main Repository**: [ziyinglee142010](https://github.com/ziyinglee142010), [jordanpenguins](https://github.com/jordanpenguins), Yeow Wei En, Zheng Zhi Rui
- **ML Service**:  [ziyinglee142010](https://github.com/ziyinglee142010), [jordanpenguins](https://github.com/jordanpenguins)

---

## 🔗 Related Resources

- **[Emotion ML Service Repository](https://github.com/jordanpenguins/emotion-ml-service)** - Deep learning model details, training notebooks, and inference API
- **[Model Architecture Slides](https://github.com/jordanpenguins/emotion-ml-service#deep-learning-model-details)** - Comprehensive technical documentation
- FastAPI Documentation - [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- Django Documentation - [https://docs.djangoproject.com/](https://docs.djangoproject.com/)
- React Documentation - [https://react.dev/](https://react.dev/)

---

*Built with ❤️ for emotion analysis and understanding*
