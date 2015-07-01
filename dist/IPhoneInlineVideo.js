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
    self.emit('timeupdate');

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
},{"minimal-event-emitter":1}]},{},[2])(2)
});