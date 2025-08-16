var currentTrack=new Audio()

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

function playMusic(track){
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
    // audio.play();

    let songUL=document.querySelector(".playlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML=songUL.innerHTML+`<li><img src="assets/svg/music.svg" alt=""><span>${song.split("/songs/")[1].replaceAll("%20"," ").replaceAll(".mp3","")}</span><img src="assets/svg/play.svg" alt=""></li>`
    }
    Array.from(document.querySelectorAll(".playlist>ul>li")).forEach(e=>{
        console.log(e.querySelector("span").innerHTML);
        e.addEventListener("click",()=>{
            playMusic("assets/songs/"+e.querySelector("span").innerHTML+".mp3");
            
            let play = document.getElementById("play");
            play.src="assets/svg/pause.svg"
        })
        
    })
    
    let playbtn = document.getElementById("play-btn");
    playbtn.addEventListener("click",(e)=>{
        if(currentTrack.paused){
            currentTrack.play()
            play.src="assets/svg/pause.svg"
        }
        else{
            currentTrack.pause()
            play.src="assets/svg/play.svg"
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
        playMusic(songs[prevIndex]);
    });

    next.addEventListener("click", e => {
        let index = songs.indexOf(currentTrack.src);
        let nextIndex = (index + 1) % songs.length;
        playMusic(songs[nextIndex]);
    });

    //adding volume functionality

    document.querySelector(".controls>.right-controls>.volume-container").addEventListener("click",e=>{
        const volumecontainer = document.querySelector(".controls>.right-controls>.volume-container");
        const rect = volumecontainer.getBoundingClientRect();
        
        // Calculate the percentage clicked relative to the container
        let percent = (e.clientX - rect.left) / rect.width;
        percent = Math.min(Math.max(percent, 0), 1); // Ensure percent is between 0 and 1
        
        // Update the visual progress bar
        document.querySelector(".controls>.right-controls>.volume-container>.volume").style.width = `${percent * 100}%`;
        currentTrack.volume=percent
    })

    
    


}

main()