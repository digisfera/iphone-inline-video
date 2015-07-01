'use strict';

var eventEmitter = require('minimal-event-emitter');

function IPhoneInlineVideo(videoUrl, audioUrl) {
  this._videoElement = document.createElement('video');
  this._videoElement.src = videoUrl;
  this._videoElement.volume = 0;

  // Required for frame to appear when setting currentTime
  this._videoElement.load();

  this._audioElement = document.createElement('audio');
  this._audioElement.src = audioUrl;
  this._audioElement.load();

  this._fakePlayAnimationFrameRequest = null;
}

eventEmitter(IPhoneInlineVideo);

IPhoneInlineVideo.prototype.videoElement = function() {
  return this._videoElement;
};

IPhoneInlineVideo.prototype.audioElement = function() {
  return this._audioElement;
};

IPhoneInlineVideo.prototype.play = function() {
  var self = this;

  if(self._fakePlayAnimationFrameRequest) { return; } // Already playing

  self._videoElement.webkitExitFullScreen();
  self._audioElement.play();
  self._videoElement.currentTime = self._audioElement.currentTime;

  var lastTime = Date.now();

  function fakePlayLoop() {
    var time = Date.now();
    var elapsed = (time - lastTime)/1000;

    self._videoElement.currentTime = self._videoElement.currentTime + elapsed;
    this.emit('timeupdate');

    lastTime = time;
    self._fakePlayAnimationFrameRequest = requestAnimationFrame(fakePlayLoop);
  }

  fakePlayLoop();

  this.emit('play');
};


IPhoneInlineVideo.prototype.pause = function() {
  this._audioElement.pause();
  cancelAnimationFrame(this._fakePlayAnimationFrameRequest);
  this._fakePlayAnimationFrameRequest = null;

  this.emit('pause');
};



module.exports = IPhoneInlineVideo;