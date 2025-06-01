# YouTube Subscription Manager

Organize your YouTube subscriptions into custom categories for better content management.

## Features
- Categorize your YouTube subscriptions
- Timeline view of recent videos by category
- Google OAuth authentication
- Responsive UI

## Prerequisites
- Node.js (v18+)
- npm
- Docker (optional)
- Google OAuth credentials
- YouTube Data API key

## Setup

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your credentials:
   ```env
   PORT=5001
   MONGODB_uri=mongodb://localhost:27017/youtube_manager
   GOOGLE_CLIENT_ID=your_actual_client_id
   GOOGLE_CLIENT_SECRET=your_actual_client_secret
   SESSION_SECRET=your_session_secret
   YOUTUBE_API_KEY=your_youtube_api_key
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the backend:
   ```bash
   npm start
   ```

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` if your backend is running on a different URL
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the frontend:
   ```bash
   npm start
   ```

### Docker Setup
1. Start MongoDB and backend services:
   ```bash
   docker-compose up -d
   ```
2. The frontend needs to be started separately as above

## Configuration
- Google OAuth: Create credentials at [Google Cloud Console](https://console.cloud.google.com/)
- YouTube Data API: Enable at [Google API Console](https://console.developers.google.com/)

## Environment Variables
- Backend: See `backend/.env.example` for required environment variables
- Frontend: See `frontend/.env.example` for configuration options

## Project Structure
```
├── backend/         # Node.js backend
├── frontend/        # React frontend
├── docker-compose.yml # Docker configuration
└── .gitignore       # Git ignore rules
```

## License
MIT