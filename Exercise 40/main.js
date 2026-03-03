const videoTitle = document.getElementById("videoTitle");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const volumeSlider = document.getElementById("volume");
const speedSelect = document.getElementById("speed");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const remainingEl = document.getElementById("remainingTime");

const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"></path></svg>';
const PREV_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM9 12l9 6V6z"></path></svg>';
const NEXT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM6 18l9-6-9-6z"></path></svg>';

const playlist = [
  {
    title: "Humood - Dandin Ma'i حمود الخضر - دندن معي",
    videoId: "2K1yppsGX04"
  }
];

let player;
let currentIndex = 0;
let progressTimer = null;

prevBtn.innerHTML = PREV_ICON;
nextBtn.innerHTML = NEXT_ICON;
playPauseBtn.innerHTML = PLAY_ICON;

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateProgressFill(percent) {
  const p = Math.max(0, Math.min(100, percent));
  progress.style.background = `linear-gradient(to right, #22c55e 0%, #22c55e ${p}%, rgba(255,255,255,0.2) ${p}%, rgba(255,255,255,0.2) 100%)`;
}

function updateTimeUI() {
  if (!player || typeof player.getDuration !== "function") return;

  const current = player.getCurrentTime() || 0;
  const duration = player.getDuration() || 0;
  const remaining = Math.max(0, duration - current);

  currentTimeEl.textContent = formatTime(current);
  durationEl.textContent = formatTime(duration);
  remainingEl.textContent = `-${formatTime(remaining)}`;

  const percent = duration > 0 ? (current / duration) * 100 : 0;
  progress.value = String(percent);
  updateProgressFill(percent);
}

function updatePlayPauseIcon(isPlaying) {
  playPauseBtn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
  playPauseBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

function loadCurrentVideo(autoplay = false) {
  if (!player) return;
  const current = playlist[currentIndex];
  videoTitle.textContent = current.title;
  player.loadVideoById(current.videoId);
  if (!autoplay) {
    player.pauseVideo();
  }
}

function nextVideo(autoplay = true) {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadCurrentVideo(autoplay);
}

function prevVideo(autoplay = true) {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadCurrentVideo(autoplay);
}

function startProgressTimer() {
  if (progressTimer) return;
  progressTimer = setInterval(updateTimeUI, 250);
}

function stopProgressTimer() {
  if (!progressTimer) return;
  clearInterval(progressTimer);
  progressTimer = null;
}

function onPlayerReady() {
  const current = playlist[currentIndex];
  videoTitle.textContent = current.title;
  player.setVolume(Number(volumeSlider.value));
  player.setPlaybackRate(Number(speedSelect.value));
  updatePlayPauseIcon(false);
  updateTimeUI();
}

function onPlayerStateChange(event) {
  // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
  if (event.data === 1) {
    updatePlayPauseIcon(true);
    startProgressTimer();
  } else if (event.data === 2) {
    updatePlayPauseIcon(false);
    stopProgressTimer();
  } else if (event.data === 0) {
    stopProgressTimer();
    nextVideo(true);
  }
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  player = new YT.Player("video", {
    videoId: playlist[currentIndex].videoId,
    playerVars: {
      controls: 0,
      rel: 0,
      modestbranding: 1,
      iv_load_policy: 3,
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
};

playPauseBtn.addEventListener("click", () => {
  if (!player) return;
  const state = player.getPlayerState();
  if (state === 1) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
});

prevBtn.addEventListener("click", () => {
  if (!player) return;
  const shouldContinue = player.getPlayerState() === 1;
  prevVideo(shouldContinue);
});

nextBtn.addEventListener("click", () => {
  if (!player) return;
  const shouldContinue = player.getPlayerState() === 1;
  nextVideo(shouldContinue);
});

volumeSlider.addEventListener("input", () => {
  if (!player) return;
  player.setVolume(Number(volumeSlider.value));
});

speedSelect.addEventListener("change", () => {
  if (!player) return;
  player.setPlaybackRate(Number(speedSelect.value));
});

progress.addEventListener("input", () => {
  if (!player) return;
  const duration = player.getDuration() || 0;
  if (!duration) return;
  const seekTo = (Number(progress.value) / 100) * duration;
  player.seekTo(seekTo, true);
  updateTimeUI();
});

const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.body.appendChild(ytScript);
