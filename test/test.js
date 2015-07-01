'use strict';

var IPhoneInlineVideo = require('../src/IPhoneInlineVideo');

var baseUrl = 'http://www.marzipano.net/demos/common-media/video/';
var video = new IPhoneInlineVideo(baseUrl + 'mercedes-f1-720x360.mp4', baseUrl + 'mercedes-f1-720x360.mp3');

document.body.appendChild(video.videoElement());

document.querySelector("[data-video-play]").addEventListener('click', function() {
  video.play();
});

document.querySelector("[data-video-pause]").addEventListener('click', function() {
  video.pause();
});

video.addEventListener('play', function() { console.log("PLAY!"); })