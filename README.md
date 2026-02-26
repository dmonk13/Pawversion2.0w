# PawPal - AI Pet Care Companion

Complete pet care management with AI-powered advice, health tracking, and veterinary connections.

## Features

- AI Pet Advisor powered by Google Gemini
- Health tracking and vaccination records
- Veterinary clinic finder
- Breed identification from photos
- Email/Password authentication
- Google OAuth Sign-In
- Pet profiles management

## Prerequisites

- Node.js 18+
- PostgreSQL database (or use Render's PostgreSQL add-on)
- Google Gemini API key
- Google OAuth 2.0 Client ID (optional, for Google Sign-In)

## Environment Setup

### Frontend (.env)

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=your_supabase_url
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### Backend (server/.env)

```env
DATABASE_URL=postgresql://user:password@host:port/database
API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=3000
```

## Local Development

### 1. Install Dependencies

Frontend:
```bash
npm install
```

Backend:
```bash
cd server
npm install
```

### 2. Start Backend Server

```bash
cd server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Start Frontend

In a new terminal:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Deployment on Render

### Backend Deployment

1. Create a new Web Service on Render
2. Connect your repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables:
   - `DATABASE_URL` (from Render PostgreSQL add-on)
   - `API_KEY` (your Gemini API key)
   - `JWT_SECRET` (random secure string)
   - `NODE_ENV=production`

### Frontend Deployment

1. Create a new Static Site on Render
2. Set build command: `npm install && npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_API_URL` (your backend URL from Render)
   - `VITE_GOOGLE_CLIENT_ID` (optional)

## Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized JavaScript origins:
   - `http://localhost:5173` (for local dev)
   - `https://your-app-url.com` (for production)
4. Copy the Client ID
5. Add to `.env` as `VITE_GOOGLE_CLIENT_ID`

Note: The app will work without Google OAuth - users can still use email/password authentication and demo mode.

## Database Schema

The backend automatically creates these tables on startup:

- **users**: User accounts with email/password
- **login_logs**: Login history and audit trail

## API Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/chat` - AI advisor chat
- `POST /api/find-vets` - Find veterinary clinics
- `POST /api/identify-breed` - Identify dog breed from image

## Troubleshooting

### Backend connection errors
- Ensure backend server is running
- Check `VITE_API_URL` matches your backend URL
- Verify CORS is enabled in backend

### Google OAuth errors
- Check authorized JavaScript origins in Google Console
- Ensure Client ID is correctly set in environment
- Wait 5 minutes after making changes in Google Console

### Database errors
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- Ensure database allows external connections

## License

MIT
