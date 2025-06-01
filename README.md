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

### Docker Setup (Complete)
1. Navigate to the project root directory
2. Update backend/.env.example with your credentials and copy to .env:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your actual credentials
   ```
3. Build and start all services:
   ```bash
   docker-compose up --build
   ```
4. Access the application at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## Configuration
- Google OAuth: Create credentials at [Google Cloud Console](https://console.cloud.google.com/)
- YouTube Data API: Enable at [Google API Console](https://console.developers.google.com/)

## Environment Variables
- Backend: See `backend/.env.example` for required environment variables
- Frontend: See `frontend/.env.example` for configuration options

## Project Structure
```
├── backend/         # Node.js backend (with Dockerfile)
├── frontend/        # React frontend (with Dockerfile)
├── docker-compose.yml # Docker configuration
├── .gitignore       # Git ignore rules
└── README.md        # Project documentation
```

## License
MIT