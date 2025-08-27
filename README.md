# 🎵 Spotify Clone - Web Music Player

A fully functional Spotify-inspired music streaming web application built with vanilla HTML, CSS, and JavaScript. Features dynamic playlist management, audio controls, and a responsive design that mimics the premium Spotify experience.

## ✨ Features

- **🎧 Full Audio Player Controls** - Play, pause, next, previous, seek, and volume control
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Dynamic Theme** - Dark theme with green accents matching Spotify's aesthetic
- **🔄 Auto-Play Queue** - Automatic next song playback when current song ends
- **🎼 ID3 Tag Reading** - Displays song metadata (title, artist) when available
- **📋 Interactive Playlist** - Click to play any song from the playlist
- **🔊 Volume Control** - Mouse and touch-supported volume adjustment
- **⏯️ Seek Control** - Click or drag to seek through songs
- **📚 Collapsible Library** - Mobile-friendly hamburger menu for playlist navigation

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone git@github.com:Kartik-MRK/Spotify-Clone.git
cd Spotify-Clone
```

### 2. Start the Application
Since this application fetches songs from a local directory structure, you need to run it using a local server:

**Using VS Code Live Preview**
1. Open the project in VS Code
2. Install the "Live Preview" extension
3. Right-click on `index.html` and select "Show Preview"
4. The app will start on `http://127.0.0.1:3000`


## 📁 Project Structure

```
Spotify-Clone/
├── index.html              # Main HTML file
├── script.js               # Core JavaScript functionality
├── style.css               # Main stylesheet
├── utility.css             # Utility classes
├── LICENSE                 # Project license
├── assets/
│   ├── img/                # Album covers and UI images
│   │   ├── cover.jpeg      # Default album cover
│   │   └── img1-7.jpeg     # UI background images
│   ├── songs/              # Music library organized by albums
│   │   ├── [Album-Name]-[Language]/
│   │   │   ├── song1.mp3
│   │   │   ├── song2.mp3
│   │   │   └── cover.jpeg  # Album cover
│   └── svg/                # SVG icons for UI elements
│       ├── play.svg
│       ├── pause.svg
│       ├── next.svg
│       └── ...
```

## 🎵 Adding Your Own Music Library

### Step 1: Organize Your Music
Create folders in the `assets/songs/` directory following this naming convention:
```
[Album-Name]-[Language]/
```

**Supported Languages:**
- `hindi` - For Hindi songs
- `kannada` - For Kannada songs  
- `mixed` - For English or other languages

### Step 2: Add Your Songs
```
assets/songs/
└── Your-Album-Name-hindi/
    ├── song1.mp3
    ├── song2.mp3
    ├── song3.mp3
    └── cover.jpeg          # Optional: Album cover image
```

### Step 3: Album Cover (Optional)
Add a `cover.jpeg` file in each album folder for custom album artwork. If not provided, the default cover will be used.

### Example Structure:
```
assets/songs/
├── Bollywood-Hits-hindi/
│   ├── Tum Hi Ho.mp3
│   ├── Raabta.mp3
│   ├── Jeene Laga Hoon.mp3
│   └── cover.jpeg
├── Sandalwood-Classics-kannada/
│   ├── Mungaru Male.mp3
│   ├── Googly.mp3
│   └── cover.jpeg
└── International-Hits-mixed/
    ├── Shape of You.mp3
    ├── Blinding Lights.mp3
    └── cover.jpeg
```

## 🔧 How It Works

### Dynamic Album Loading
The application automatically scans the [`assets/songs/`](assets/songs/) directory and creates album cards based on folder names. The [`getsongs()`](script.js) function fetches the directory listing from the local server running on port 3000.

### Audio Playback
- Uses HTML5 Audio API for music playback
- The [`playMusic()`](script.js) function handles track loading and metadata reading
- Supports ID3 tag reading for displaying proper song titles and artists

### Responsive Controls
- **Seek Bar**: Click or drag to navigate through songs
- **Volume Control**: Mouse and touch-supported volume adjustment  
- **Playlist Navigation**: Click any song in the playlist to play it
- **Auto-advance**: Automatically plays next song when current song ends

### Mobile Support
- Hamburger menu for playlist access on mobile devices
- Touch-friendly controls for seek and volume
- Responsive design adapts to different screen sizes

## 🎮 Usage Instructions

1. **Browse Albums**: Scroll through the album cards on the home page
2. **Select Album**: Click on any album card to load its songs into the playlist
3. **Play Music**: Click on any song in the playlist to start playback
4. **Control Playback**: Use the bottom control bar for play/pause, next/previous, seek, and volume
5. **Mobile Navigation**: Use the hamburger menu (☰) to access the playlist on mobile devices

## 🛠️ Technical Requirements

- **Web Server**: Must run on a local server (port 3000 recommended)
- **Browser**: Modern web browser with HTML5 Audio support
- **File Format**: MP3 audio files
- **Dependencies**: No external dependencies required

## 🌟 Key Features Explained

### Smart Playlist Management
The [`library_function()`](script.js) dynamically updates the playlist based on selected albums and handles song name parsing for proper display.

### Audio Control System
Advanced seek and volume controls with visual feedback, supporting both mouse and touch interactions.

### Responsive Album Grid
Albums are automatically categorized by language and displayed in responsive card layouts with scroll indicators.

### Metadata Integration
Automatic ID3 tag reading for displaying proper song information when available.

## 📱 Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- **Local Server Required**: The application must be served from a local web server due to CORS restrictions when accessing local files
- **Port 3000**: The application expects to run on port 3000 as hardcoded in the [`getsongs()`](script.js) function
- **File Naming**: Song files should be in MP3 format with proper naming for best display results
- **Album Organization**: Follow the `[Album-Name]-[Language]` naming convention for proper categorization

## 🎯 Future Enhancements

- Shuffle and repeat modes
- Search functionality
- Playlist creation and saving
- Audio visualization
- Lyrics display integration
- Social sharing features

---

**Enjoy your music! 🎵**
