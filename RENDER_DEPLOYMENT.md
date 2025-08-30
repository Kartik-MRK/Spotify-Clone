# Spotify Clone Backend Deployment Guide

## Overview
This is the backend API for your Spotify Clone that serves music files and metadata. The frontend is hosted separately on GitHub Pages.

## Architecture
- **Frontend**: GitHub Pages (static hosting)
- **Backend**: Render (Node.js hosting with file storage)

## Deployment Steps

### 1. Prepare Your Repository for Render

#### a) Update API Configuration
In your frontend `script.js`, update the `API_CONFIG.BASE_URL`:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-app-name.onrender.com', // Replace with your actual Render URL
};
```

#### b) Ensure all dependencies are installed:
```bash
npm install
```

### 2. Deploy Backend to Render

#### a) Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub

#### b) Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Use these settings:
   - **Name**: `spotify-clone-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (use repository root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### c) Configure Environment
- **Auto-Deploy**: Enable
- **Instance Type**: Free tier is fine for testing

### 3. Upload Your Music Files

#### Option 1: Include in Repository (Recommended for smaller collections)
1. Ensure your `.gitignore` doesn't exclude the `assets/` folder
2. Commit and push your songs:
```bash
git add assets/
git commit -m "Add music collection"
git push
```

#### Option 2: Upload via Render Dashboard (For large collections)
If your songs are too large for Git:
1. After deployment, use Render's shell access
2. Upload files via SFTP or other methods
3. Or use cloud storage integration

### 4. Update Frontend Configuration

After your Render service is deployed:

1. Copy your Render URL (e.g., `https://your-app-name.onrender.com`)
2. Update `script.js` in your frontend:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-actual-render-url.onrender.com',
};
```
3. Commit and push to GitHub Pages

### 5. Setup CORS

The backend is already configured for CORS. Update the allowed origins in `server.js`:
```javascript
app.use(cors({
  origin: [
    "https://your-github-username.github.io", // Your GitHub Pages URL
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  credentials: true
}));
```

## API Endpoints

- `GET /api/albums` - List all album folders
- `GET /api/albums/:albumName/songs` - Get songs from specific album
- `GET /api/songs` - Get all songs from all albums
- `GET /assets/songs/...` - Direct access to music files
- `GET /health` - Health check endpoint

## File Structure Expected

```
assets/
  songs/
    Album Name-language/
      song1.mp3
      song2.mp3
      cover.jpeg
    Another Album-hindi/
      song3.mp3
      cover.jpeg
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Update the allowed origins in `server.js`
2. **File Not Found**: Check file paths and encoding
3. **Large Files**: Consider using external storage for very large music collections
4. **Slow Loading**: Render free tier sleeps after 15 mins of inactivity

### Monitoring:
- Check Render logs for backend issues
- Use browser dev tools for frontend debugging
- Monitor the `/health` endpoint

## Development vs Production

### Local Development:
```javascript
BASE_URL: 'http://localhost:3000'
```

### Production:
```javascript
BASE_URL: 'https://your-app-name.onrender.com'
```

## Next Steps

1. Deploy backend to Render
2. Update frontend configuration
3. Test the complete application
4. Monitor usage and performance

## Security Notes

- Consider implementing rate limiting for production
- Add authentication if needed
- Monitor file access logs
- Consider CDN for better performance
