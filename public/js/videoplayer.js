


//document.addEventListener("DOMContentLoaded", function() { loadvideoplayer(); }, false);

var videoMask = document.getElementById('video-mask');
var videoPlayer = document.getElementById('video');
var playPauseBtn = document.getElementById('playpause');
var progressBar = document.getElementById('progress2');
var mirageProgressBar = document.getElementById('progress1');
var muteBtn = document.getElementById('mute');
var volumeBtn = document.getElementById('volume');
var expandcollapseBtn = document.getElementById('expandcollapse');


function loadvideoplayer() {

	videoPlayer.addEventListener('pause', function() {
		playPauseBtn.innerHTML = '<i class="flaticon-play128"></i>';
	},false);
	videoPlayer.addEventListener('play', function() {
		playPauseBtn.innerHTML = '<i class="flaticon-pause52"></i>';
	},false);

	videoPlayer.addEventListener('timeupdate', updateProgressBar, false);

	volume();

	videoPlayer.addEventListener('volumechange', function(e) {
		if(videoPlayer.muted) muteBtn.innerHTML = '<i class="flaticon-volumecontrol"></i>';
		else muteBtn.innerHTML = '<i class="flaticon-sound64"></i>';
	},false);

}


function playpause() {

	if (videoPlayer.paused || videoPlayer.ended) {
		playPauseBtn.value = "play";
		videoPlayer.play();
	}
	else {
		playPauseBtn.value = "pause";
		videoPlayer.pause();
	}

}



function stop() {
	videoPlayer.currentTime = 0;
	videoPlayer.pause();
}

function replay() {
	videoPlayer.currentTime = 0;
	videoPlayer.play();
}

function updateProgressBar() {
	// Work out how much of the media has played via the duration and currentTime parameters
	var percentage = Math.floor((100 / videoPlayer.duration) * videoPlayer.currentTime);
	// Update the progress bar's value
	progressBar.value = percentage;
	mirageProgressBar.value = percentage;
	// Update the progress bar's text (for browsers that don't support the progress element)
	progressBar.innerHTML = percentage + '% played';

}

function pausebyprogress() {
	var current = (mirageProgressBar.value * videoPlayer.duration) / 100;
	videoPlayer.pause();
	videoPlayer.currentTime = current;
}

function volume() {
	var volumevalue = parseFloat(volumeBtn.value / 10);
	videoPlayer.volume = volumevalue;
}

function mute() {
	if (videoPlayer.muted) {
		mute.innerHTML = '<i class="flaticon-sound64"></i>';
		videoPlayer.muted = false;
		volumeBtn.value = 5;
	}
	else {
		mute.innerHTML = '<i class="flaticon-volumecontrol"></i>';
		videoPlayer.muted = true;
		volumeBtn.value = 0;
	}

}

function expandcollapse() {
	if(!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {
		if (videoMask.requestFullscreen) {
		  videoMask.requestFullscreen();
		} else if (videoMask.msRequestFullscreen) {
		  videoMask.msRequestFullscreen();
		} else if (videoMask.mozRequestFullScreen) {
		  videoMask.mozRequestFullScreen();
		} else if (videoMask.webkitRequestFullscreen) {
		  videoMask.webkitRequestFullscreen();
		}
    	expandcollapseBtn.innerHTML = '<i class="flaticon-collapsing"></i>';
		
	}
	else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
	      document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }
		expandcollapseBtn.innerHTML = '<i class="flaticon-expand23"></i>';
	}

}
