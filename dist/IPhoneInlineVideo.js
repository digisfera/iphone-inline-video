(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.IPhoneInlineVideo = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @class
 * @classdesc Minimalistic event emitter
 */
function EventEmitter() {}

/**
 * @param {String} event
 * @param {Function} fn Handler function
 */
EventEmitter.prototype.addEventListener = function(event, fn) {
  var eventMap = this.__events = this.__events || {};
  var handlerList = eventMap[event] = eventMap[event] || [];
  handlerList.push(fn);
};

/**
 * @param {String} event
 * @param {Function} fn Handler function
 */
EventEmitter.prototype.removeEventListener = function(event, fn) {
  var eventMap = this.__events = this.__events || {};
  var handlerList = eventMap[event];
  if (handlerList) {
    var index = handlerList.indexOf(fn);
    if (index >= 0) {
      handlerList.splice(index, 1);
    }
  }
};

/**
 * Emit an event
 */
EventEmitter.prototype.emit = function() {
  var eventMap = this.__events = this.__events || {};
  var event = arguments[0];
  var handlerList = eventMap[event];
  if (handlerList) {
    for (var i = 0; i < handlerList.length; i++) {
      var fn = handlerList[i];
      fn.apply(this, arguments);
    }
  }
};

/**
 * Mixes in {@link EventEmitter} into a constructor function
 */
function eventEmitter(ctor) {
  for (var prop in EventEmitter.prototype) {
    if (EventEmitter.prototype.hasOwnProperty(prop)) {
      ctor.prototype[prop] = EventEmitter.prototype[prop];
    }
  }
}

module.exports = eventEmitter;

},{}],2:[function(require,module,exports){
'use strict';

var eventEmitter = require('minimal-event-emitter');

function defaultVideoSrcToAudioSrc(videoSrc) {
  var extensionRegex = /\.[a-zA-Z0-9]+$/;
  return videoSrc.replace(extensionRegex, '.mp3');
}

function IPhoneInlineVideo(videoSrcToAudioSrc) {
  if(typeof(videoSrcToAudioSrc) === 'string') {
    this._videoSrcToAudioSrc = function() { return videoSrcToAudioSrc; };
  }
  else if(typeof(videoSrcToAudioSrc) === 'function') {
    this._videoSrcToAudioSrc = videoSrcToAudioSrc;
  }
  else if(videoSrcToAudioSrc === undefined) {
    this._videoSrcToAudioSrc = defaultVideoSrcToAudioSrc;    
  }
  else {
    throw new Error("Invalid value for argument 0 (videoSrcToAudioSrc):", videoSrcToAudioSrc);
  }

  this._videoElement = document.createElement('video');
  this._videoElement.volume = 0;


  this._audioElement = document.createElement('audio');
  // Audio must be muted while we wait for the video to load
  this._audioMutedForVideoLoad = false;
  this._audioVolume = 1;

  this._fakePlayAnimationFrameRequest = null;
  this._fakePlayingEmitted = false;


  var self = this;
  self.addEventListener('error', function() {
    if(self.onerror) { self.onerror(); }
  });
  self.addEventListener('playing', function() {
    if(self.onplaying) { self.onplaying(); }
  });
  self.addEventListener('loadedmetadata', function() {
    if(self.onloadedmetadata) { self.onloadedmetadata(); }
  });

  this._handleVideoLoadedMetadata = function() { self.emit('loadedmetadata'); };
  self._videoElement.addEventListener('loadedmetadata', this._handleVideoLoadedMetadata);

  self.__defineGetter__("currentTime", function() {
    return self._videoElement.currentTime;
  });
  self.__defineGetter__("videoWidth", function() {
    return self._videoElement.videoWidth;
  });
  self.__defineGetter__("videoHeight", function() {
    return self._videoElement.videoHeight;
  });

  self.__defineSetter__("currentTime", function(val) {
    self._videoElement.currentTime = val;
    self._audioElement.currentTime = val;
  });

  self.__defineGetter__("src", function() { return self._videoElement.src; });
  self.__defineSetter__("src", function(val) {
    self._videoElement.src = val;

    // Required for frame to appear when setting currentTime
    self._videoElement.load();

    var audioUrl = self._videoSrcToAudioSrc(val);
    self._audioElement.src = audioUrl;
  });


  self.__defineGetter__("volume", function() {
    return self._audioVolume;
  });
  
  self.__defineSetter__("volume", function(val) {
    var changed = self._audioVolume !== val;
    self._audioVolume = val;

    if(!this._audioMutedForVideoLoad) {
      self._audioElement.volume = self._audioVolume;
    }

    if(changed) {
      self.emit('volumechange');
    }
  });

  self.__defineGetter__("duration", function() { return self._videoElement.duration; });

  self.__defineGetter__("paused", function() { return this._fakePlayAnimationFrameRequest === null; });
}

eventEmitter(IPhoneInlineVideo);

IPhoneInlineVideo.prototype.destroy = function() {
  this._videoElement.removeEventListener('loadedmetadata', this._handleVideoLoadedMetadata);

  [ this._videoElement, this._audioElement ].forEach(function(element) {
    element.pause();
    element.volume = 0;
    element.removeAttribute('src');
  });

  this._videoElement = null;
  this._audioElement = null;
};

IPhoneInlineVideo.prototype.videoElement = function() {
  return this._videoElement;
};

IPhoneInlineVideo.prototype.removeAttribute = function() {
  return this._videoElement.removeAttribute.apply(this._videoElement, arguments);
};
IPhoneInlineVideo.prototype.setAttribute = function() {
  return this._videoElement.setAttribute.apply(this._videoElement, arguments);
};

IPhoneInlineVideo.prototype.audioElement = function() {
  return this._audioElement;
};

IPhoneInlineVideo.prototype.play = function() {
  var self = this;


  if(self._fakePlayAnimationFrameRequest) { return; } // Already playing
 

  // Audio element play must be in response to user interaction, so we can not
  // do it inside fakePlayLoop()
  self._audioMutedForVideoLoad = true;
  self._audioElement.volume = 0;
  self._audioElement.play();


  self._fakePlayingEmitted = false;

  var lastTime = Date.now();

  function fakePlayLoop() {
    // Schedule the next play immediately, as self._fakePlayAnimationFrameRequest
    // is used by the "paused" getter
    self._fakePlayAnimationFrameRequest = requestAnimationFrame(fakePlayLoop);

    var time = Date.now();

    var videoReady = self._videoElement.readyState >= self._videoElement.HAVE_CURRENT_DATA;
    var audioReady = self._audioElement.readyState >= self._audioElement.HAVE_CURRENT_DATA || self._audioElement.error;
    if(videoReady && audioReady) {

      if(self._audioMutedForVideoLoad) {
        self._audioElement.currentTime = self._videoElement.currentTime;
        self._audioElement.volume = self._audioVolume;
        self._audioMutedForVideoLoad = false;
      }

      var elapsed = (time - lastTime)/1000;

      self._videoElement.currentTime = self._videoElement.currentTime + elapsed;
      self.emit('timeupdate');

      if(!self._fakePlayingEmitted) {
        self.emit('play');
        self.emit('playing');
        self._fakePlayingEmitted = true;
      }
    }

    lastTime = time;
  }

  fakePlayLoop();

};


IPhoneInlineVideo.prototype.pause = function() {
  this._audioElement.pause();
  cancelAnimationFrame(this._fakePlayAnimationFrameRequest);
  this._fakePlayAnimationFrameRequest = null;

  this.emit('pause');
};



module.exports = IPhoneInlineVideo;
},{"minimal-event-emitter":1}]},{},[2])(2)
});