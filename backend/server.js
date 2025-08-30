const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for GitHub Pages (replace with your actual GitHub Pages URL)
app.use(cors({
  origin: [
    "https://kartik-mrk.github.io", // Your GitHub Pages domain
    "https://kartik-mrk.github.io/Spotify-Clone", // Your specific GitHub Pages project URL
    "http://localhost:3000",
    "https://spotify-backend-cfrp.onrender.com", // For Live Server during development
    "http://127.0.0.1:5500", // Alternative Live Server port
    "http://localhost:8080", // Another common dev server port
    "http://127.0.0.1:3000",
    // Allow any localhost port for development
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ],
  credentials: true
}));

// Serve static files (songs, images, etc.)
app.use("/assets", express.static(path.join(__dirname, "assets")));

// API to get all album folders
app.get("/api/albums", (req, res) => {
  const songsDir = path.join(__dirname, "assets/songs");
  
  fs.readdir(songsDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load albums" });
    }
    
    // Filter only directories (album folders)
    const albums = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
    
    res.json(albums);
  });
});

// API to get songs from a specific album
app.get("/api/albums/:albumName/songs", (req, res) => {
  const albumName = decodeURIComponent(req.params.albumName);
  const albumDir = path.join(__dirname, "assets/songs", albumName);
  
  fs.readdir(albumDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load songs from album" });
    }
    
    // Filter only mp3 files and create proper URLs
    const songs = files
      .filter(file => file.endsWith(".mp3"))
      .map(file => ({
        name: file,
        url: `/assets/songs/${encodeURIComponent(albumName)}/${encodeURIComponent(file)}`,
        album: albumName
      }));
    
    res.json(songs);
  });
});

// API to get all songs (for mixed playlists)
app.get("/api/songs", (req, res) => {
  const songsDir = path.join(__dirname, "assets/songs");
  let allSongs = [];
  
  fs.readdir(songsDir, { withFileTypes: true }, (err, entries) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load songs" });
    }
    
    const albumFolders = entries.filter(entry => entry.isDirectory());
    let processed = 0;
    
    if (albumFolders.length === 0) {
      return res.json([]);
    }
    
    albumFolders.forEach(albumEntry => {
      const albumPath = path.join(songsDir, albumEntry.name);
      
      fs.readdir(albumPath, (err, files) => {
        if (!err) {
          const songs = files
            .filter(file => file.endsWith(".mp3"))
            .map(file => ({
              name: file,
              url: `/assets/songs/${encodeURIComponent(albumEntry.name)}/${encodeURIComponent(file)}`,
              album: albumEntry.name
            }));
          
          allSongs = allSongs.concat(songs);
        }
        
        processed++;
        if (processed === albumFolders.length) {
          res.json(allSongs);
        }
      });
    });
  });
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
