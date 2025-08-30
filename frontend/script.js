// Configuration for backend API
const API_CONFIG = {
    // Replace with your actual Render backend URL once deployed
    // BASE_URL: 'https://your-app-name.onrender.com', // Change this after deployment
    // For local development, uncomment the line below and comment the line above:
    BASE_URL: 'https://spotify-backend-cfrp.onrender.com',
};

var currentTrack=new Audio()
var currentPlayingElement = null; // Track which playlist item is currently playing
var songs

function resetAllPlaylistIcons() {
    // Reset all playlist items to show play icon and remove highlighting
    Array.from(document.querySelectorAll(".playlist ul li")).forEach(item => {
        const playIcon = item.getElementsByTagName("img")[1];
        if (playIcon) {
            playIcon.src = "../assets/svg/play.svg";
        }
        // Remove playing class
        item.classList.remove("playing");
    });
}

function updatePlaylistIcon(element, isPlaying) {
    const playIcon = element.getElementsByTagName("img")[1];
    if (playIcon) {
        playIcon.src = isPlaying ? "../assets/svg/pause.svg" : "../assets/svg/play.svg";
    }
    
    // Add or remove highlighting
    if (isPlaying) {
        element.classList.add("playing");
    } else {
        element.classList.remove("playing");
    }
}

async function getsongs(albumName) {
    console.log("Fetching songs from album:", albumName);
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/albums/${encodeURIComponent(albumName)}/songs`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const songData = await response.json();
        console.log("Song data received:", songData);
        
        // Convert API response to full URLs
        const songs = songData.map(song => `${API_CONFIG.BASE_URL}${song.url}`);
        console.log("Final songs array:", songs);
        
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00"; // If duration isn't loaded yet
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs; // leading zero for seconds
    return `${mins}:${secs}`;
}

function addtime(currentTrack) {
    let spans = document.querySelectorAll(".seekbar .time");

    if (spans.length >= 2) {
        spans[0].innerHTML = formatTime(currentTrack.currentTime);
        spans[1].innerHTML = formatTime(currentTrack.duration);
    }
}

function playMusic(track,playlistElement){
    console.log("playMusic called with track:", track);
    
    // Reset all playlist icons first
    resetAllPlaylistIcons();
    
    // Update the current playing element
    currentPlayingElement = playlistElement;
    
    // Set the current song's icon to pause
    if (currentPlayingElement) {
        updatePlaylistIcon(currentPlayingElement, true);
    }

    // console.log("Setting currentTrack.src to:", track);
    currentTrack.src=track
    
    // Add error handling
    currentTrack.addEventListener('error', (e) => {
        console.error("Audio error:", e);
        console.error("Failed to load:", track);
    });
    
    currentTrack.addEventListener('loadstart', () => {
        console.log("Started loading:", track);
    });
    
    currentTrack.addEventListener('canplay', () => {
        console.log("Can play:", track);
    });
    
    console.log("Attempting to play...");
    currentTrack.play().then(() => {
        console.log("Play successful");
    }).catch((error) => {
        console.error("Play failed:", error);
    });
    
    // Add event listener to update time continuously
    currentTrack.addEventListener('timeupdate', () => {
        addtime(currentTrack);
        // Update progress bar during playback (avoid conflict with seeking)
        if (!isNaN(currentTrack.duration) && isFinite(currentTrack.duration)) {
            const pct = (currentTrack.currentTime / currentTrack.duration) * 100;
            const progressBar = document.querySelector(".progress-bar");
            const progressContainer = document.querySelector(".progress-container");
            
            // Only update if not actively dragging/seeking
            if (progressBar && (!progressContainer || !progressContainer.classList.contains("dragging"))) {
                progressBar.style.width = `${pct}%`;
            }
        }
    });
    // Update Now Playing UI (cover, title, artist)
    const leftInfo = document.querySelector(".controls .left-info");
    const coverImg = leftInfo.querySelector(".sng-img");
    const titleEl = leftInfo.querySelector(".song-info .song-name");
    const artistEl = leftInfo.querySelector(".song-info .artist-name");

    // Derive album folder and cover path from the new API structure
    let songPath = track.split("/assets/songs/")[1];
    if (songPath) {
        let decodedSongPath = decodeURIComponent(songPath);
        let pathParts = decodedSongPath.split("/");
        let fileName = pathParts.pop();
        let albumFolder = pathParts.join("/");
        let displayName = fileName.replace(/\.mp3$/i, "");

        // Set cover image from album folder using API backend
        if (albumFolder) {
            const coverUrl = `${API_CONFIG.BASE_URL}/assets/songs/${encodeURIComponent(albumFolder)}/cover.jpeg`;
            
            // Fallback to default if not found
            coverImg.onerror = function(){
                coverImg.onerror = null;
                coverImg.src = "../assets/img/cover.jpeg";
            };
            coverImg.src = coverUrl;
        }

        // Default UI updates
        titleEl.textContent = displayName;
        artistEl.textContent = "Unknown Artist";
    }

    // Try to read ID3 tags (artist, title) from the remote file
    if (window.jsmediatags) {
        try {
            new window.jsmediatags.Reader(track)
                .setTagsToRead(["artist", "title"]) // minimal
                .read({
                    onSuccess: function(result){
                        const tags = result.tags || {};
                        if (tags.title && typeof tags.title === "string") {
                            titleEl.textContent = tags.title;
                        }
                        if (tags.artist && typeof tags.artist === "string") {
                            artistEl.textContent = tags.artist;
                        }
                    },
                    onError: function(error){
                        console.warn("jsmediatags error:", error);
                    }
                });
        } catch(err) {
            console.warn("Failed to invoke jsmediatags:", err);
        }
    }

    // Add event listener for when metadata loads (to get duration)
    currentTrack.addEventListener('loadedmetadata', () => {
        addtime(currentTrack);
    });

    // Remove any existing 'ended' event listeners to prevent multiple triggers
    currentTrack.removeEventListener('ended', handleSongEnd);
    
    // Auto-play next song when current song ends
    currentTrack.addEventListener('ended', handleSongEnd);
}

// Define the song end handler function outside to avoid multiple listeners
function handleSongEnd() {
    console.log("Song ended, playing next...");
    if (songs && songs.length > 0) {
        let currentIndex = songs.indexOf(currentTrack.src);
        let nextIndex = (currentIndex + 1) % songs.length; // Loop to beginning if at end
        
        // Find the corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        // Extract the song name from the URL for comparison
        let songPath = songs[nextIndex].split("/assets/songs/")[1];
        let targetSongName;
        if (songPath && songPath.includes("/")) {
            targetSongName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        } else if (songPath) {
            targetSongName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
        } else {
            // Fallback: extract from full URL
            targetSongName = songs[nextIndex].split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        }
        
        // Find matching playlist element
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        // Play next song
        playMusic(songs[nextIndex], targetElement);
        
        // Update play button to pause state
        let play = document.getElementById("play");
        if (play) {
            play.src = "../assets/svg/pause.svg";
        }
    }
}


async function main(){
    //making dynamic albums
    async function dynamicalbums(){
        const lang_plist = {
            'mixed': 'mixed',
            'hindi': 'hindi-songs', 
            'kannada': 'kannada-hits'
        };
        
        try {
            // Fetch albums from the new API
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/albums`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const albums = await response.json();
            console.log("Albums received:", albums);
            
            for (const albumName of albums) {
                // Extract language from album name (assuming format: "Album Name-language")
                const separator = albumName.lastIndexOf("-");
                const language = separator !== -1 ? albumName.slice(separator + 1) : 'mixed';
                const displayName = separator !== -1 ? albumName.slice(0, separator) : albumName;
                
                const listContainer = document.querySelector(`#${lang_plist[language] || 'mixed'}`);
                
                if (listContainer) {
                    const card = document.createElement("div");
                    card.classList.add("plistcard");
                    card.innerHTML = `
                        <img src="${API_CONFIG.BASE_URL}/assets/songs/${encodeURIComponent(albumName)}/cover.jpeg" 
                             alt="${displayName}" 
                             onerror="this.src='../assets/img/cover.jpeg'">
                        <p>${displayName}</p>
                        <span class="play-btn"><img src="../assets/svg/play.svg" alt=""></span>
                    `;

                    listContainer.appendChild(card);
                    
                    card.addEventListener("click", async () => {
                        console.log("Loading album:", albumName);
                        songs = await getsongs(albumName);
                        library_function();
                    });
                }
            }
            
            // Re-initialize scroll indicators after content is loaded
            initScrollIndicators();
            
        } catch (error) {
            console.error("Error fetching albums:", error);
            // You might want to show an error message to the user here
        }
    }
    await dynamicalbums()

    function library_function(){
        // Clear existing playlist first
        let songUL = document.querySelector(".playlist").getElementsByTagName("ul")[0];
        songUL.innerHTML = "";
        
        // Add new songs to the playlist
        for (const song of songs) {
            // More robust song name extraction for API URLs
            let songPath = song.split("/assets/songs/")[1]; // Get everything after /assets/songs/
            let songName;
            
            // Check if the path contains a folder structure (has /)
            if (songPath && songPath.includes("/")) {
                // Extract just the filename from the nested structure
                songName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
            } else if (songPath) {
                // Direct file in songs folder
                songName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
            } else {
                // Fallback: extract from full URL
                songName = song.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
            }

            songUL.innerHTML += `<li><img src="../assets/svg/music.svg" alt=""><span>${songName}</span><img src="../assets/svg/play.svg" alt=""></li>`;
        }
        
        // Remove existing event listeners and add new ones
        Array.from(document.querySelectorAll(".playlist>ul>li")).forEach(e => {
            // Clone the element to remove all existing event listeners
            let newElement = e.cloneNode(true);
            e.parentNode.replaceChild(newElement, e);
            
            // Add click event listener to the new element
            newElement.addEventListener("click", (event) => {
                let songName = newElement.querySelector("span").innerHTML;
                console.log("Clicked song name:", songName);
                
                // Debug: Log all songs and their parsed names
                console.log("All songs in array:");
                songs.forEach((song, index) => {
                    let songPath = song.split("/songs/")[1];
                    let cleanSongName;
                    
                    if (songPath.includes("/")) {
                        cleanSongName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
                    } else {
                        cleanSongName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
                    }
                    
                    console.log(`${index}: Original: ${song}`);
                    console.log(`${index}: Parsed: ${cleanSongName}`);
                    console.log(`${index}: Match: ${cleanSongName === songName}`);
                });
                
                // Construct the correct path
                let songPath = songs.find(song => {
                    let songPathPart = song.split("/songs/")[1];
                    let cleanSongName;
                    
                    if (songPathPart.includes("/")) {
                        cleanSongName = songPathPart.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
                    } else {
                        cleanSongName = songPathPart.replaceAll("%20", " ").replaceAll(".mp3", "");
                    }
                    
                    return cleanSongName === songName;
                });
                
                console.log("Found song path:", songPath);
                
                if (songPath) {
                    playMusic(songPath, newElement);
                    let play = document.getElementById("play");
                    play.src = "../assets/svg/pause.svg";
                } else {
                    console.error("Song not found for:", songName);
                }
            });
        });
    }
    
    // var songs=await getsongs()
    
    // Define UI elements once at the top
    let playbtn = document.getElementById("play-btn");
    let play = document.getElementById("play");
    let prev = document.getElementById("prev");
    let next = document.getElementById("next");
    
    // audio.play();

    
    
    
    playbtn.addEventListener("click",(e)=>{
        if(currentTrack.paused){
            currentTrack.play()
            play.src="../assets/svg/pause.svg"
            // Update playlist icon to pause
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, true);
            }
        }
        else{
            currentTrack.pause()
            play.src="../assets/svg/play.svg"
            // Update playlist icon to play
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, false);
            }
        }
    })


    // Seekbar: click and drag support (mouse + touch)
    const progressContainer = document.querySelector(".progress-container");
    const progressBar = document.querySelector(".progress-bar");
    let isSeeking = false;
    let seekPercent = 0;
    let seekRafPending = false;

    function applySeekVisual() {
        progressBar.style.width = `${seekPercent * 100}%`;
        if (!isNaN(currentTrack.duration) && isFinite(currentTrack.duration)) {
            currentTrack.currentTime = seekPercent * currentTrack.duration;
        }
        seekRafPending = false;
    }
    function updateSeekFromClientX(clientX) {
        const rect = progressContainer.getBoundingClientRect();
        let percent = (clientX - rect.left) / rect.width;
        seekPercent = Math.min(Math.max(percent, 0), 1);
        if (!seekRafPending) {
            seekRafPending = true;
            requestAnimationFrame(applySeekVisual);
        }
    }

    // Click to seek
    progressContainer.addEventListener("click", (e) => {
        updateSeekFromClientX(e.clientX);
    });

    // Drag start
    const onSeekStart = (clientX) => {
        isSeeking = true;
        progressContainer.classList.add("dragging");
        updateSeekFromClientX(clientX);
    };
    const onSeekMove = (clientX) => {
        if (!isSeeking) return;
        updateSeekFromClientX(clientX);
    };
    const onSeekEnd = () => {
        if (!isSeeking) return;
        isSeeking = false;
        progressContainer.classList.remove("dragging");
    };

    // Mouse events
    progressContainer.addEventListener("mousedown", (e) => {
        onSeekStart(e.clientX);
        window.addEventListener("mousemove", mouseMoveSeek);
        window.addEventListener("mouseup", mouseUpSeek, { once: true });
    });
    function mouseMoveSeek(e){ onSeekMove(e.clientX); }
    function mouseUpSeek(){
        window.removeEventListener("mousemove", mouseMoveSeek);
        onSeekEnd();
    }

    // Touch events
    progressContainer.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length) {
            onSeekStart(e.touches[0].clientX);
        }
    }, { passive: true });
    progressContainer.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches.length) {
            onSeekMove(e.touches[0].clientX);
        }
    }, { passive: true });
    progressContainer.addEventListener("touchend", () => {
        onSeekEnd();
    });

    //adding previous and next button functionality
    prev.addEventListener("click", e => {
        if (!songs || songs.length === 0) return; // Check if songs array exists and has content
        
        let index = songs.indexOf(currentTrack.src);
        let prevIndex = (index - 1 + songs.length) % songs.length;
        // Find the corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        // Extract the song name from the URL for comparison
        let songPath = songs[prevIndex].split("/songs/")[1];
        let targetSongName;
        if (songPath.includes("/")) {
            targetSongName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        } else {
            targetSongName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
        }
        
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        playMusic(songs[prevIndex], targetElement);
        play.src="../assets/svg/pause.svg";
    });

    next.addEventListener("click", e => {
        if (!songs || songs.length === 0) return; // Check if songs array exists and has content
        
        let index = songs.indexOf(currentTrack.src);
        let nextIndex = (index + 1) % songs.length;
        // Find the corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        // Extract the song name from the URL for comparison
        let songPath = songs[nextIndex].split("/songs/")[1];
        let targetSongName;
        if (songPath.includes("/")) {
            targetSongName = songPath.split("/").pop().replaceAll("%20", " ").replaceAll(".mp3", "");
        } else {
            targetSongName = songPath.replaceAll("%20", " ").replaceAll(".mp3", "");
        }
        
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        playMusic(songs[nextIndex], targetElement);
        play.src="../assets/svg/pause.svg";
    });

    // Volume: click and drag support (mouse + touch)
    const volumeContainer = document.querySelector(".controls>.right-controls>.volume-container");
    const volumeBar = document.querySelector(".controls>.right-controls>.volume-container>.volume");
    volumeBar.style.width = "100%";
    var percent = 1;
    let isAdjustingVolume = false;
    let volRafPending = false;
    let volPercent = 1;

    function applyVolumeVisual(){
        volumeBar.style.width = `${volPercent * 100}%`;
        currentTrack.volume = volPercent;
        volRafPending = false;
    }
    function updateVolumeFromClientX(clientX){
        const rect = volumeContainer.getBoundingClientRect();
        let p = (clientX - rect.left) / rect.width;
        p = Math.min(Math.max(p, 0), 1);
        percent = p;
        volPercent = p;
        if (!volRafPending) {
            volRafPending = true;
            requestAnimationFrame(applyVolumeVisual);
        }
    }

    // Click to set volume
    volumeContainer.addEventListener("click", (e) => {
        updateVolumeFromClientX(e.clientX);
    });

    // Drag start/move/end
    const onVolStart = (clientX) => {
        isAdjustingVolume = true;
        volumeContainer.classList.add("dragging");
        updateVolumeFromClientX(clientX);
    };
    const onVolMove = (clientX) => {
        if (!isAdjustingVolume) return;
        updateVolumeFromClientX(clientX);
    };
    const onVolEnd = () => {
        if (!isAdjustingVolume) return;
        isAdjustingVolume = false;
        volumeContainer.classList.remove("dragging");
    };

    // Mouse events
    volumeContainer.addEventListener("mousedown", (e) => {
        onVolStart(e.clientX);
        window.addEventListener("mousemove", mouseMoveVol);
        window.addEventListener("mouseup", mouseUpVol, { once: true });
    });
    function mouseMoveVol(e){ onVolMove(e.clientX); }
    function mouseUpVol(){
        window.removeEventListener("mousemove", mouseMoveVol);
        onVolEnd();
    }

    // Touch events
    volumeContainer.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length) {
            onVolStart(e.touches[0].clientX);
        }
    }, { passive: true });
    volumeContainer.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches.length) {
            onVolMove(e.touches[0].clientX);
        }
    }, { passive: true });
    volumeContainer.addEventListener("touchend", () => {
        onVolEnd();
    });
    
    // Volume button mute/unmute functionality
    document.querySelector(".right-controls>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "../assets/svg/mute.svg";
            currentTrack.volume = 0; // mute
            document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width = "0%";
        } else {
            e.target.src = "../assets/svg/volume.svg";
            currentTrack.volume = percent; // restore previous volume
            document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width = `${percent * 100}%`;
        }
    });

    // Hamburger menu functionality
    const hamburgerBtn = document.querySelector(".plist .right .sec span:first-child");
    const library = document.querySelector(".plist .left");
    const plistContainer = document.querySelector(".plist");
    const cancelBtn = document.querySelector(".plist .left h4 img");
    
    function toggleLibrary() {
        library.classList.toggle("show");
        plistContainer.classList.toggle("library-open");
    }
    
    function closeLibrary() {
        library.classList.remove("show");
        plistContainer.classList.remove("library-open");
    }
    
    // Hamburger button click
    hamburgerBtn.addEventListener("click", toggleLibrary);
    
    // Cancel/close button click
    if (cancelBtn) {
        cancelBtn.addEventListener("click", closeLibrary);
    }
    
    // Close library when clicking overlay (on mobile)
    plistContainer.addEventListener("click", (e) => {
        if (e.target === plistContainer && library.classList.contains("show")) {
            closeLibrary();
        }
    });
    
    // Close library when pressing Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && library.classList.contains("show")) {
            closeLibrary();
        }
    });

    // Scroll indicators functionality for all sections
    function initScrollIndicators() {
        const cardsContainers = document.querySelectorAll('.cards-container');
        
        cardsContainers.forEach(cardsContainer => {
            const plistcards = cardsContainer.querySelector('.plistcards');
            const leftIndicator = cardsContainer.querySelector('.left-indicator');
            const rightIndicator = cardsContainer.querySelector('.right-indicator');
            
            if (!plistcards || !leftIndicator || !rightIndicator) return;
            
            // Remove existing event listeners to prevent duplicates
            const newLeftIndicator = leftIndicator.cloneNode(true);
            const newRightIndicator = rightIndicator.cloneNode(true);
            leftIndicator.parentNode.replaceChild(newLeftIndicator, leftIndicator);
            rightIndicator.parentNode.replaceChild(newRightIndicator, rightIndicator);
            
            function updateIndicators() {
                const scrollLeft = plistcards.scrollLeft;
                const maxScroll = plistcards.scrollWidth - plistcards.clientWidth;
                
                // Show/hide left indicator
                if (scrollLeft <= 10) {
                    newLeftIndicator.classList.add('hidden');
                } else {
                    newLeftIndicator.classList.remove('hidden');
                }
                
                // Show/hide right indicator
                if (scrollLeft >= maxScroll - 10) {
                    newRightIndicator.classList.add('hidden');
                } else {
                    newRightIndicator.classList.remove('hidden');
                }
            }
            
            function scrollLeftFunc() {
                const cardWidth = 160; // approximate card width + gap
                plistcards.scrollBy({
                    left: -cardWidth * 2,
                    behavior: 'smooth'
                });
            }
            
            function scrollRightFunc() {
                const cardWidth = 160; // approximate card width + gap
                plistcards.scrollBy({
                    left: cardWidth * 2,
                    behavior: 'smooth'
                });
            }
            
            // Event listeners
            newLeftIndicator.addEventListener('click', scrollLeftFunc);
            newRightIndicator.addEventListener('click', scrollRightFunc);
            plistcards.addEventListener('scroll', updateIndicators);
            
            // Initial update
            updateIndicators();
        });
    }
    
    // Initialize scroll indicators
    initScrollIndicators();

}

main()