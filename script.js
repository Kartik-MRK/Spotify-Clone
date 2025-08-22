var currentTrack=new Audio()
var currentPlayingElement = null; // Track which playlist item is currently playing

function resetAllPlaylistIcons() {
    // Reset all playlist items to show play icon and remove highlighting
    Array.from(document.querySelectorAll(".playlist ul li")).forEach(item => {
        const playIcon = item.getElementsByTagName("img")[1];
        if (playIcon) {
            playIcon.src = "assets/svg/play.svg";
        }
        // Remove playing class
        item.classList.remove("playing");
    });
}

function updatePlaylistIcon(element, isPlaying) {
    const playIcon = element.getElementsByTagName("img")[1];
    if (playIcon) {
        playIcon.src = isPlaying ? "assets/svg/pause.svg" : "assets/svg/play.svg";
    }
    
    // Add or remove highlighting
    if (isPlaying) {
        element.classList.add("playing");
    } else {
        element.classList.remove("playing");
    }
}

async function getsongs(){
    let a=await fetch('http://127.0.0.1:3000/Spotify%20Clone/assets/songs')
    let response=await a.text()
    let div=document.createElement("div")
    div.innerHTML=response
    let as=div.getElementsByTagName('a')
    let songs=[]
    for (const a of as) {
        if(a.href.endsWith('.mp3'))
        {
            songs.push(a.href)
        }
    }
    return songs
        
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
    // Reset all playlist icons first
    resetAllPlaylistIcons();
    
    // Update the current playing element
    currentPlayingElement = playlistElement;
    
    // Set the current song's icon to pause
    if (currentPlayingElement) {
        updatePlaylistIcon(currentPlayingElement, true);
    }

    currentTrack.src=track
    currentTrack.play()    
    // Add event listener to update time continuously
    currentTrack.addEventListener('timeupdate', () => {
        addtime(currentTrack);
        document.querySelector(".progress-bar").style.width=`${(currentTrack.currentTime/currentTrack.duration)*100}%`
    });
    let songname=document.querySelector(".controls>.left-info")
        songname.innerHTML=`${track.split("/songs/")[1].replaceAll("%20"," ").replaceAll(".mp3","")}`
    
    // Add event listener for when metadata loads (to get duration)
    currentTrack.addEventListener('loadedmetadata', () => {
        addtime(currentTrack);
    });
}


async function main(){
    
    var songs=await getsongs()
    console.log(songs);
    var audio=new Audio(songs[0]);
    
    // Define UI elements once at the top
    let playbtn = document.getElementById("play-btn");
    let play = document.getElementById("play");
    let prev = document.getElementById("prev");
    let next = document.getElementById("next");
    
    // audio.play();

    let songUL=document.querySelector(".playlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML+`<li><img src="assets/svg/music.svg" alt=""><span>${song.split("/songs/")[1].replaceAll("%20"," ").replaceAll(".mp3","")}</span><img src="assets/svg/play.svg" alt=""></li>`
    }
    Array.from(document.querySelectorAll(".playlist>ul>li")).forEach(e=>{
        console.log(e.querySelector("span").innerHTML);
        e.addEventListener("click",(cont)=>{
            playMusic("assets/songs/"+e.querySelector("span").innerHTML+".mp3",e);
            
            let play = document.getElementById("play");
            play.src="assets/svg/pause.svg"
        })
        
    })
    
    
    playbtn.addEventListener("click",(e)=>{
        if(currentTrack.paused){
            currentTrack.play()
            play.src="assets/svg/pause.svg"
            // Update playlist icon to pause
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, true);
            }
        }
        else{
            currentTrack.pause()
            play.src="assets/svg/play.svg"
            // Update playlist icon to play
            if (currentPlayingElement) {
                updatePlaylistIcon(currentPlayingElement, false);
            }
        }
    })


    //adding the seekbar functionality
    document.querySelector(".progress-container").addEventListener("click", e => {
        // Get the progress container element to ensure consistent calculations
        const progressContainer = document.querySelector(".progress-container");
        const rect = progressContainer.getBoundingClientRect();
        
        // Calculate the percentage clicked relative to the container
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.min(Math.max(percent, 0), 1); // Ensure percent is between 0 and 1
        
        // Update the visual progress bar
        document.querySelector(".progress-bar").style.width = `${percent * 100}%`;
        
        // Update the actual audio playback position
        currentTrack.currentTime = percent * currentTrack.duration;
    })

    //adding previous and next button functionality

    prev.addEventListener("click", e => {
        let index = songs.indexOf(currentTrack.src);
        let prevIndex = (index - 1 + songs.length) % songs.length;
        // Find the corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        // Extract the song name from the URL for comparison
        let targetSongName = songs[prevIndex].split("/songs/")[1].replaceAll("%20", " ").replaceAll(".mp3", "");
        
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        playMusic(songs[prevIndex], targetElement);
        play.src="assets/svg/pause.svg";
    });

    next.addEventListener("click", e => {
        let index = songs.indexOf(currentTrack.src);
        let nextIndex = (index + 1) % songs.length;
        // Find the corresponding playlist element
        let playlistElements = document.querySelectorAll(".playlist ul li");
        let targetElement = null;
        
        // Extract the song name from the URL for comparison
        let targetSongName = songs[nextIndex].split("/songs/")[1].replaceAll("%20", " ").replaceAll(".mp3", "");
        
        playlistElements.forEach(el => {
            let songName = el.querySelector("span").innerHTML;
            if (songName === targetSongName) {
                targetElement = el;
            }
        });
        
        playMusic(songs[nextIndex], targetElement);
        play.src="assets/svg/pause.svg";
    });

    //adding volume functionality
    document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width ="100%"
    var percent=1
    document.querySelector(".controls>.right-controls>.volume-container").addEventListener("click",e=>{
        const volumecontainer = document.querySelector(".controls>.right-controls>.volume-container");
        const rect = volumecontainer.getBoundingClientRect();
        
        // Calculate the percentage clicked relative to the container
        percent = (e.clientX - rect.left) / rect.width;
        percent = Math.min(Math.max(percent, 0), 1); // Ensure percent is between 0 and 1
        
        // Update the visual progress bar
        document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width = `${percent * 100}%`;
        currentTrack.volume=percent
    })
    
    // Volume button mute/unmute functionality
    document.querySelector(".right-controls>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "assets/svg/mute.svg";
            currentTrack.volume = 0; // mute
            document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width = "0%";
        } else {
            e.target.src = "assets/svg/volume.svg";
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

    // Scroll indicators functionality
    function initScrollIndicators() {
        const cardsContainer = document.querySelector('.cards-container');
        const plistcards = document.querySelector('.plistcards');
        const leftIndicator = document.querySelector('.left-indicator');
        const rightIndicator = document.querySelector('.right-indicator');
        
        if (!cardsContainer || !plistcards || !leftIndicator || !rightIndicator) return;
        
        function updateIndicators() {
            const scrollLeft = plistcards.scrollLeft;
            const maxScroll = plistcards.scrollWidth - plistcards.clientWidth;
            
            // Show/hide left indicator
            if (scrollLeft <= 10) {
                leftIndicator.classList.add('hidden');
            } else {
                leftIndicator.classList.remove('hidden');
            }
            
            // Show/hide right indicator
            if (scrollLeft >= maxScroll - 10) {
                rightIndicator.classList.add('hidden');
            } else {
                rightIndicator.classList.remove('hidden');
            }
        }
        
        function scrollLeft() {
            const cardWidth = 160; // approximate card width + gap
            plistcards.scrollBy({
                left: -cardWidth * 2,
                behavior: 'smooth'
            });
        }
        
        function scrollRight() {
            const cardWidth = 160; // approximate card width + gap
            plistcards.scrollBy({
                left: cardWidth * 2,
                behavior: 'smooth'
            });
        }
        
        // Event listeners
        leftIndicator.addEventListener('click', scrollLeft);
        rightIndicator.addEventListener('click', scrollRight);
        plistcards.addEventListener('scroll', updateIndicators);
        
        // Initial update
        updateIndicators();
        
        // Update on window resize
        window.addEventListener('resize', updateIndicators);
    }
    
    // Initialize scroll indicators
    initScrollIndicators();

}

main()