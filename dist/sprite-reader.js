(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SpriteReader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SpriteReader = function () {
	function SpriteReader() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var _ref$image = _ref.image;
		var image = _ref$image === undefined ? null : _ref$image;
		var _ref$json = _ref.json;
		var json = _ref$json === undefined ? null : _ref$json;
		var _ref$autoplay = _ref.autoplay;
		var autoplay = _ref$autoplay === undefined ? true : _ref$autoplay;
		var _ref$canvas = _ref.canvas;
		var canvas = _ref$canvas === undefined ? null : _ref$canvas;
		var _ref$fillColor = _ref.fillColor;
		var fillColor = _ref$fillColor === undefined ? null : _ref$fillColor;
		var _ref$fps = _ref.fps;
		var fps = _ref$fps === undefined ? 30 : _ref$fps;
		var _ref$from = _ref.from;
		var from = _ref$from === undefined ? 0 : _ref$from;
		var _ref$loop = _ref.loop;
		var loop = _ref$loop === undefined ? false : _ref$loop;
		var _ref$onComplete = _ref.onComplete;
		var onComplete = _ref$onComplete === undefined ? null : _ref$onComplete;
		var _ref$onRepeat = _ref.onRepeat;
		var onRepeat = _ref$onRepeat === undefined ? null : _ref$onRepeat;
		var _ref$onRepeatComplete = _ref.onRepeatComplete;
		var onRepeatComplete = _ref$onRepeatComplete === undefined ? null : _ref$onRepeatComplete;
		var _ref$repeat = _ref.repeat;
		var repeat = _ref$repeat === undefined ? 0 : _ref$repeat;
		var _ref$retina = _ref.retina;
		var retina = _ref$retina === undefined ? false : _ref$retina;
		var _ref$to = _ref.to;
		var to = _ref$to === undefined ? null : _ref$to;

		_classCallCheck(this, SpriteReader);

		if (!image) throw new Error('image parameter can not be null');
		if (!json) throw new Error('json parameter can not be null');
		if (image.length && json.length && image.length !== json.length) throw new Error('image length must be equal to json length');

		this._image = image;
		this._json = json;

		this._canvasCache = [];
		this._ctxCache = [];
		this._packCached = 0;
		this._canvasTarget = canvas || document.createElement('canvas');
		this._ctxTarget = null;

		this._multipackSize = image.length || 1;
		this._currentPack = 0;
		this._currentRepeat = 0;

		this._from = from;
		this._current = from;
		this._to = to;

		this._isPlaying = autoplay;
		this._repeat = loop ? -1 : repeat;

		this._fillColor = fillColor;

		this._interval = 1000 / fps;
		this._then = null;

		this._onComplete = onComplete;
		this._onRepeat = onRepeat;
		this._onRepeatComplete = onRepeatComplete;

		if (!this._image.length) this._image = [this._image];
		if (!this._json.length) this._json = [this._json];

		if (this._to === null) {

			var total = 0;

			for (var i = 0; i < this._multipackSize; i++) {

				total += this._json[i].frames.length;
			}

			this._to = total - 1;
		}

		this._side = this._from > this._to ? -1 : 1;

		var tmpCanvas = document.createElement('canvas');

		for (var _i = 0; _i < this._multipackSize; _i++) {

			this._canvasCache[_i] = tmpCanvas.cloneNode(false);

			this._canvasCache[_i].width = this._json[_i].meta.size.w;
			this._canvasCache[_i].height = this._json[_i].meta.size.h;

			this._ctxCache[_i] = this._canvasCache[_i].getContext('2d');
		}

		if (!canvas) {

			this._canvasTarget.width = this._json[0].frames[0].sourceSize.w;
			this._canvasTarget.height = this._json[0].frames[0].sourceSize.h;

			Object.assign(this._canvasTarget.style, {
				width: this._canvasTarget.width / (retina ? 2 : 1) + 'px',
				height: this._canvasTarget.height / (retina ? 2 : 1) + 'px'
			});
		}

		this._ctxTarget = this._canvasTarget.getContext('2d');

		if (fillColor) this._ctxTarget.fillStyle = fillColor;

		this.update(true);
	}

	// find the pack that contains the current frame

	_createClass(SpriteReader, [{
		key: 'findPack',
		value: function findPack() {

			var currentTmp = 0;
			var currentPackTmp = 0;

			while (this._current > currentTmp) {

				currentTmp += this._json[currentPackTmp].frames.length;

				if (this._current > currentTmp) currentPackTmp++;
			}

			this._currentPack = currentPackTmp;
		}

		// check if we are targeting outside the current pack

	}, {
		key: 'checkPack',
		value: function checkPack() {

			if (this.getCurrentRelatedToPack() > this._json[this._currentPack].frames.length - 1) {

				if (this._currentPack < this._multipackSize - 1) this._currentPack++;else this._currentPack = 0;
			}
		}

		// get an index0 based number related to the current pack

	}, {
		key: 'getCurrentRelatedToPack',
		value: function getCurrentRelatedToPack() {

			var increment = 0;

			for (var i = 0; i < this._currentPack; i++) {
				increment += this._json[i].frames.length;
			}return this._current - increment;
		}
	}, {
		key: 'drawCache',
		value: function drawCache(index) {

			var tmpCanvas = document.createElement('canvas');

			tmpCanvas.width = this._canvasCache[index].width;
			tmpCanvas.height = this._canvasCache[index].height;

			tmpCanvas.getContext('2d').drawImage(this._image[index], 0, 0);
			var imgData = tmpCanvas.getContext('2d').getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
			this._ctxCache[index].putImageData(imgData, 0, 0);

			this._packCached++;

			// if you simply call the below line, you will have latency when switching pack

			// this._ctxCache[i].drawImage(this._image[i], 0, 0);
		}
	}, {
		key: 'draw',
		value: function draw() {

			var canvas = this._canvasTarget;

			this.checkPack();

			var currentFrame = this._json[this._currentPack].frames[this.getCurrentRelatedToPack()];

			var newSize = {
				w: currentFrame.frame.w,
				h: currentFrame.frame.h
			};

			var newPosition = {
				x: 0,
				y: 0
			};

			this._ctxTarget.clearRect(0, 0, canvas.width, canvas.height);

			if (this._fillColor) {

				this._ctxTarget.fillRect(0, 0, canvas.width, canvas.height);
			}

			if (currentFrame.rotated) {

				this._ctxTarget.save();
				this._ctxTarget.translate(canvas.width / 2, canvas.height / 2);
				this._ctxTarget.rotate(-Math.PI / 2);

				this._ctxTarget.translate(-canvas.height / 2, -canvas.width / 2);

				newSize.w = currentFrame.frame.h;
				newSize.h = currentFrame.frame.w;
			}

			if (currentFrame.trimmed) {

				newPosition.x = currentFrame.spriteSourceSize.x;
				newPosition.y = currentFrame.spriteSourceSize.y;

				if (currentFrame.rotated) {

					newPosition.x = canvas.height - currentFrame.spriteSourceSize.h - currentFrame.spriteSourceSize.y;
					newPosition.y = currentFrame.spriteSourceSize.x;
				}
			}

			this._ctxTarget.drawImage(this._canvasCache[this._currentPack], currentFrame.frame.x, currentFrame.frame.y, newSize.w, newSize.h, newPosition.x, newPosition.y, newSize.w, newSize.h);

			if (currentFrame.rotated) this._ctxTarget.restore();
		}
	}, {
		key: 'update',
		value: function update() {
			var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;


			if (this._packCached < this._multipackSize) this.drawCache(this._packCached);

			if (!this._isPlaying && !force) return;

			var now = performance.now();
			var delta = now - this._then;

			if (delta < this._interval && !force) return;

			this._then = now - delta % this._interval;

			this.draw();

			if (this._current === this._to) {

				if (this._repeat) {

					this._currentRepeat++;
					this._current = this._from;
					this._currentPack = 0;

					if (this._onRepeat) this._onRepeat();

					if (this._repeat > 0 && this._currentRepeat > this._repeat) {

						this._isPlaying = false;

						if (this._onRepeatComplete) this._onRepeatComplete();
					}
				} else {

					this._isPlaying = false;

					if (this._onComplete) this._onComplete();
				}
			} else this._current += this._side;
		}
	}, {
		key: 'play',
		value: function play() {

			this._isPlaying = true;
		}
	}, {
		key: 'pause',
		value: function pause() {

			this._isPlaying = false;
		}
	}, {
		key: 'stop',
		value: function stop() {

			this._isPlaying = false;
			this._current = this._from;
		}
	}, {
		key: 'reverse',
		value: function reverse(side) {

			if (side === 1 || side === -1) this._side = side;else this._side = this._side === 1 ? -1 : 1;

			var tmpFrom = this._from;
			var tmpTo = this._to;

			this._side === 1 ? this._from = Math.min(tmpFrom, tmpTo) : Math.max(tmpFrom, tmpTo);
			this._side === 1 ? this._to = Math.max(tmpFrom, tmpTo) : Math.min(tmpFrom, tmpTo);
		}
	}, {
		key: 'goFromTo',
		value: function goFromTo(from, to) {

			if (from >= 0) this._from = from;

			if (to >= 0) this._to = to;

			this._current = this._from;
			this._side = from > to ? -1 : 1;

			this.findPack();
		}
	}, {
		key: 'goToAndStop',
		value: function goToAndStop(frame) {

			this._current = frame;
			this._isPlaying = false;
		}
	}, {
		key: 'destroy',
		value: function destroy() {

			this._isPlaying = false;

			this._ctxTarget.clearRect(0, 0, this._canvasTarget.width, this._canvasTarget.height);
		}
	}, {
		key: 'canvas',
		get: function get() {

			return this._canvasTarget;
		}
	}, {
		key: 'fps',
		set: function set(nbr) {

			this._interval = 1000 / nbr;
		}
	}, {
		key: 'loop',
		set: function set(val) {

			if (val) this._repeat = -1;else if (this._repeat === -1) this._repeat = 0;
		}
	}, {
		key: 'repeat',
		set: function set(nbr) {

			this._repeat = nbr;
			this._currentRepeat = 0;
		}
	}, {
		key: 'onComplete',
		set: function set(fn) {

			this._onComplete = fn;
		}
	}, {
		key: 'onRepeat',
		set: function set(fn) {

			this._onRepeat = fn;
		}
	}, {
		key: 'onRepeatComplete',
		set: function set(fn) {

			this._onRepeatComplete = fn;
		}
	}]);

	return SpriteReader;
}();

exports.default = SpriteReader;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU3ByaXRlUmVhZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0FxQixZO0FBRXBCLHlCQWdCUTtBQUFBLGlGQUFKLEVBQUk7O0FBQUEsd0JBZlAsS0FlTztBQUFBLE1BZlAsS0FlTyw4QkFmQyxJQWVEO0FBQUEsdUJBZFAsSUFjTztBQUFBLE1BZFAsSUFjTyw2QkFkQSxJQWNBO0FBQUEsMkJBWlAsUUFZTztBQUFBLE1BWlAsUUFZTyxpQ0FaSSxJQVlKO0FBQUEseUJBWFAsTUFXTztBQUFBLE1BWFAsTUFXTywrQkFYRSxJQVdGO0FBQUEsNEJBVlAsU0FVTztBQUFBLE1BVlAsU0FVTyxrQ0FWSyxJQVVMO0FBQUEsc0JBVFAsR0FTTztBQUFBLE1BVFAsR0FTTyw0QkFURCxFQVNDO0FBQUEsdUJBUlAsSUFRTztBQUFBLE1BUlAsSUFRTyw2QkFSQSxDQVFBO0FBQUEsdUJBUFAsSUFPTztBQUFBLE1BUFAsSUFPTyw2QkFQQSxLQU9BO0FBQUEsNkJBTlAsVUFNTztBQUFBLE1BTlAsVUFNTyxtQ0FOTSxJQU1OO0FBQUEsMkJBTFAsUUFLTztBQUFBLE1BTFAsUUFLTyxpQ0FMSSxJQUtKO0FBQUEsbUNBSlAsZ0JBSU87QUFBQSxNQUpQLGdCQUlPLHlDQUpZLElBSVo7QUFBQSx5QkFIUCxNQUdPO0FBQUEsTUFIUCxNQUdPLCtCQUhFLENBR0Y7QUFBQSx5QkFGUCxNQUVPO0FBQUEsTUFGUCxNQUVPLCtCQUZFLEtBRUY7QUFBQSxxQkFEUCxFQUNPO0FBQUEsTUFEUCxFQUNPLDJCQURGLElBQ0U7O0FBQUE7O0FBRVAsTUFBSSxDQUFDLEtBQUwsRUFBWSxNQUFNLElBQUksS0FBSixDQUFVLGlDQUFWLENBQU47QUFDWixNQUFJLENBQUMsSUFBTCxFQUFXLE1BQU0sSUFBSSxLQUFKLENBQVUsZ0NBQVYsQ0FBTjtBQUNYLE1BQUksTUFBTSxNQUFOLElBQWdCLEtB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QUViLFFBQUssUUFBTCxHQUFnQixLQUFLLEtBQXJCO0FBQ0EsUUFBSyxLQUFMLEdBQWEsT0FBTyxFQUFQLEdBQVksQ0FBQyxDQUFiLEdBQWlCLENBQTlCOztBQUVBLFFBQUssUUFBTDtBQUNBOzs7OEJBRVcsSyxFQUFPOztBQUVsQixRQUFLLFFBQUwsR0FBZ0IsS0FBaEI7QUFDQSxRQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQTs7OzRCQUVTOztBQUVULFFBQUssVUFBTCxHQUFrQixLQUFsQjs7QUFFQSxRQUFLLFVBQUwsQ0FBZ0IsU0FBaEIsQ0FBMEIsQ0FBMUIsRUFBNkIsQ0FBN0IsRUFBZ0MsS0FBSyxhQUFMLENBQW1CLEtBQW5ELEVBQTBELEtBQUssYUFBTCxDQUFtQixNQUE3RTtBQUNBOzs7c0JBRVk7O0FBRVosVUFBTyxLQUFLLGFBQVo7QUFDQTs7O29CQUVPLEcsRUFBSzs7QUFFWixRQUFLLFNBQUwsR0FBaUIsT0FBTyxHQUF4QjtBQUNBOzs7b0JBRVEsRyxFQUFLOztBQUViLE9BQUksR0FBSixFQUFTLEtBQUssT0FBTCxHQUFlLENBQUMsQ0FBaEIsQ0FBVCxLQUNLLElBQUksS0FBSyxPQUFMLEtBQWlCLENBQUMsQ0FBdEIsRUFBeUIsS0FBSyxPQUFMLEdBQWUsQ0FBZjtBQUM5Qjs7O29CQUVVLEcsRUFBSzs7QUFFZixRQUFLLE9BQUwsR0FBZSxHQUFmO0FBQ0EsUUFBSyxjQUFMLEdBQXNCLENBQXRCO0FBQ0E7OztvQkFFYyxFLEVBQUk7O0FBRWxCLFFBQUssV0FBTCxHQUFtQixFQUFuQjtBQUNBOzs7b0JBRVksRSxFQUFJOztBQUVoQixRQUFLLFNBQUwsR0FBaUIsRUFBakI7QUFDQTs7O29CQUVvQixFLEVBQUk7O0FBRXhCLFFBQUssaUJBQUwsR0FBeUIsRUFBekI7QUFDQTs7Ozs7O2tCQS9WbUIsWSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBTcHJpdGVSZWFkZXIge1xuXG5cdGNvbnN0cnVjdG9yKHtcblx0XHRpbWFnZSA9IG51bGwsXG5cdFx0anNvbiA9IG51bGwsXG5cblx0XHRhdXRvcGxheSA9IHRydWUsXG5cdFx0Y2FudmFzID0gbnVsbCxcblx0XHRmaWxsQ29sb3IgPSBudWxsLFxuXHRcdGZwcyA9IDMwLFxuXHRcdGZyb20gPSAwLFxuXHRcdGxvb3AgPSBmYWxzZSxcblx0XHRvbkNvbXBsZXRlID0gbnVsbCxcblx0XHRvblJlcGVhdCA9IG51bGwsXG5cdFx0b25SZXBlYXRDb21wbGV0ZSA9IG51bGwsXG5cdFx0cmVwZWF0ID0gMCxcblx0XHRyZXRpbmEgPSBmYWxzZSxcblx0XHR0byA9IG51bGxcblx0fSA9IHt9KSB7XG5cblx0XHRpZiAoIWltYWdlKSB0aHJvdyBuZXcgRXJyb3IoJ2ltYWdlIHBhcmFtZXRlciBjYW4gbm90IGJlIG51bGwnKTtcblx0XHRpZiAoIWpzb24pIHRocm93IG5ldyBFcnJvcignanNvbiBwYXJhbWV0ZXIgY2FuIG5vdCBiZSBudWxsJyk7XG5cdFx0aWYgKGltYWdlLmxlbmd0aCAmJiBqc29uLmxlbmd0aCAmJiBpbWFnZS5sZW5ndGggIT09IGpzb24ubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ2ltYWdlIGxlbmd0aCBtdXN0IGJlIGVxdWFsIHRvIGpzb24gbGVuZ3RoJyk7XG5cblx0XHR0aGlzLl9pbWFnZSA9IGltYWdlO1xuXHRcdHRoaXMuX2pzb24gPSBqc29uO1xuXG5cdFx0dGhpcy5fY2FudmFzQ2FjaGUgPSBbXTtcblx0XHR0aGlzLl9jdHhDYWNoZSA9IFtdO1xuXHRcdHRoaXMuX3BhY2tDYWNoZWQgPSAwO1xuXHRcdHRoaXMuX2NhbnZhc1RhcmdldCA9IGNhbnZhcyB8fCBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0XHR0aGlzLl9jdHhUYXJnZXQgPSBudWxsO1xuXG5cdFx0dGhpcy5fbXVsdGlwYWNrU2l6ZSA9IGltYWdlLmxlbmd0aCB8fCAxO1xuXHRcdHRoaXMuX2N1cnJlbnRQYWNrID0gMDtcblx0XHR0aGlzLl9jdXJyZW50UmVwZWF0ID0gMDtcblxuXHRcdHRoaXMuX2Zyb20gPSBmcm9tO1xuXHRcdHRoaXMuX2N1cnJlbnQgPSBmcm9tO1xuXHRcdHRoaXMuX3RvID0gdG87XG5cblx0XHR0aGlzLl9pc1BsYXlpbmcgPSBhdXRvcGxheTtcblx0XHR0aGlzLl9yZXBlYXQgPSBsb29wID8gLTEgOiByZXBlYXQ7XG5cblx0XHR0aGlzLl9maWxsQ29sb3IgPSBmaWxsQ29sb3I7XG5cblx0XHR0aGlzLl9pbnRlcnZhbCA9IDEwMDAgLyBmcHM7XG5cdFx0dGhpcy5fdGhlbiA9IG51bGw7XG5cblx0XHR0aGlzLl9vbkNvbXBsZXRlID0gb25Db21wbGV0ZTtcblx0XHR0aGlzLl9vblJlcGVhdCA9IG9uUmVwZWF0O1xuXHRcdHRoaXMuX29uUmVwZWF0Q29tcGxldGUgPSBvblJlcGVhdENvbXBsZXRlO1xuXG5cdFx0aWYgKCF0aGlzLl9pbWFnZS5sZW5ndGgpIHRoaXMuX2ltYWdlID0gW3RoaXMuX2ltYWdlXTtcblx0XHRpZiAoIXRoaXMuX2pzb24ubGVuZ3RoKSB0aGlzLl9qc29uID0gW3RoaXMuX2pzb25dO1xuXG5cdFx0aWYgKHRoaXMuX3RvID09PSBudWxsKSB7XG5cblx0XHRcdGxldCB0b3RhbCA9IDA7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbXVsdGlwYWNrU2l6ZTsgaSsrKSB7XG5cblx0XHRcdFx0dG90YWwgKz0gdGhpcy5fanNvbltpXS5mcmFtZXMubGVuZ3RoO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl90byA9IHRvdGFsIC0gMTtcblx0XHR9XG5cblx0XHR0aGlzLl9zaWRlID0gdGhpcy5fZnJvbSA+IHRoaXMuX3RvID8gLTEgOiAxO1xuXG5cdFx0Y29uc3QgdG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX211bHRpcGFja1NpemU7IGkrKykge1xuXG5cdFx0XHR0aGlzLl9jYW52YXNDYWNoZVtpXSA9IHRtcENhbnZhcy5jbG9uZU5vZGUoZmFsc2UpO1xuXG5cdFx0XHR0aGlzLl9jYW52YXNDYWNoZVtpXS53aWR0aCA9IHRoaXMuX2pzb25baV0ubWV0YS5zaXplLnc7XG5cdFx0XHR0aGlzLl9jYW52YXNDYWNoZVtpXS5oZWlnaHQgPSB0aGlzLl9qc29uW2ldLm1ldGEuc2l6ZS5oO1xuXG5cdFx0XHR0aGlzLl9jdHhDYWNoZVtpXSA9IHRoaXMuX2NhbnZhc0NhY2hlW2ldLmdldENvbnRleHQoJzJkJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCFjYW52YXMpIHtcblxuXHRcdFx0dGhpcy5fY2FudmFzVGFyZ2V0LndpZHRoID0gdGhpcy5fanNvblswXS5mcmFtZXNbMF0uc291cmNlU2l6ZS53O1xuXHRcdFx0dGhpcy5fY2FudmFzVGFyZ2V0LmhlaWdodCA9IHRoaXMuX2pzb25bMF0uZnJhbWVzWzBdLnNvdXJjZVNpemUuaDtcblxuXHRcdFx0T2JqZWN0LmFzc2lnbih0aGlzLl9jYW52YXNUYXJnZXQuc3R5bGUsIHtcblx0XHRcdFx0d2lkdGg6IGAke3RoaXMuX2NhbnZhc1RhcmdldC53aWR0aCAvIChyZXRpbmEgPyAyIDogMSl9cHhgLFxuXHRcdFx0XHRoZWlnaHQ6IGAke3RoaXMuX2NhbnZhc1RhcmdldC5oZWlnaHQgLyAocmV0aW5hID8gMiA6IDEpfXB4YFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY3R4VGFyZ2V0ID0gdGhpcy5fY2FudmFzVGFyZ2V0LmdldENvbnRleHQoJzJkJyk7XG5cblx0XHRpZiAoZmlsbENvbG9yKSB0aGlzLl9jdHhUYXJnZXQuZmlsbFN0eWxlID0gZmlsbENvbG9yO1xuXG5cdFx0dGhpcy51cGRhdGUodHJ1ZSk7XG5cdH1cblxuXHQvLyBmaW5kIHRoZSBwYWNrIHRoYXQgY29udGFpbnMgdGhlIGN1cnJlbnQgZnJhbWVcblxuXHRmaW5kUGFjaygpIHtcblxuXHRcdGxldCBjdXJyZW50VG1wID0gMDtcblx0XHRsZXQgY3VycmVudFBhY2tUbXAgPSAwO1xuXG5cdFx0d2hpbGUgKHRoaXMuX2N1cnJlbnQgPiBjdXJyZW50VG1wKSB7XG5cblx0XHRcdGN1cnJlbnRUbXAgKz0gdGhpcy5fanNvbltjdXJyZW50UGFja1RtcF0uZnJhbWVzLmxlbmd0aDtcblxuXHRcdFx0aWYgKHRoaXMuX2N1cnJlbnQgPiBjdXJyZW50VG1wKSBjdXJyZW50UGFja1RtcCsrO1xuXHRcdH1cblxuXHRcdHRoaXMuX2N1cnJlbnRQYWNrID0gY3VycmVudFBhY2tUbXA7XG5cdH1cblxuXHQvLyBjaGVjayBpZiB3ZSBhcmUgdGFyZ2V0aW5nIG91dHNpZGUgdGhlIGN1cnJlbnQgcGFja1xuXG5cdGNoZWNrUGFjaygpIHtcblxuXHRcdGlmICh0aGlzLmdldEN1cnJlbnRSZWxhdGVkVG9QYWNrKCkgPiB0aGlzLl9qc29uW3RoaXMuX2N1cnJlbnRQYWNrXS5mcmFtZXMubGVuZ3RoIC0gMSkge1xuXG5cdFx0XHRpZiAodGhpcy5fY3VycmVudFBhY2sgPCB0aGlzLl9tdWx0aXBhY2tTaXplIC0gMSkgdGhpcy5fY3VycmVudFBhY2srKztcblx0XHRcdGVsc2UgdGhpcy5fY3VycmVudFBhY2sgPSAwO1xuXHRcdH1cblx0fVxuXG5cdC8vIGdldCBhbiBpbmRleDAgYmFzZWQgbnVtYmVyIHJlbGF0ZWQgdG8gdGhlIGN1cnJlbnQgcGFja1xuXG5cdGdldEN1cnJlbnRSZWxhdGVkVG9QYWNrKCkge1xuXG5cdFx0bGV0IGluY3JlbWVudCA9IDA7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2N1cnJlbnRQYWNrOyBpKyspIGluY3JlbWVudCArPSB0aGlzLl9qc29uW2ldLmZyYW1lcy5sZW5ndGg7XG5cblx0XHRyZXR1cm4gdGhpcy5fY3VycmVudCAtIGluY3JlbWVudDtcblx0fVxuXG5cdGRyYXdDYWNoZShpbmRleCkge1xuXG5cdFx0Y29uc3QgdG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cblx0XHR0bXBDYW52YXMud2lkdGggPSB0aGlzLl9jYW52YXNDYWNoZVtpbmRleF0ud2lkdGg7XG5cdFx0dG1wQ2FudmFzLmhlaWdodCA9IHRoaXMuX2NhbnZhc0NhY2hlW2luZGV4XS5oZWlnaHQ7XG5cblx0XHR0bXBDYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcy5faW1hZ2VbaW5kZXhdLCAwLCAwKTtcblx0XHRjb25zdCBpbWdEYXRhID0gdG1wQ2FudmFzLmdldENvbnRleHQoJzJkJykuZ2V0SW1hZ2VEYXRhKDAsIDAsIHRtcENhbnZhcy53aWR0aCwgdG1wQ2FudmFzLmhlaWdodCk7XG5cdFx0dGhpcy5fY3R4Q2FjaGVbaW5kZXhdLnB1dEltYWdlRGF0YShpbWdEYXRhLCAwLCAwKTtcblxuXHRcdHRoaXMuX3BhY2tDYWNoZWQrKztcblxuXHRcdC8vIGlmIHlvdSBzaW1wbHkgY2FsbCB0aGUgYmVsb3cgbGluZSwgeW91IHdpbGwgaGF2ZSBsYXRlbmN5IHdoZW4gc3dpdGNoaW5nIHBhY2tcblxuXHRcdC8vIHRoaXMuX2N0eENhY2hlW2ldLmRyYXdJbWFnZSh0aGlzLl9pbWFnZVtpXSwgMCwgMCk7XG5cdH1cblxuXHRkcmF3KCkge1xuXG5cdFx0Y29uc3QgY2FudmFzID0gdGhpcy5fY2FudmFzVGFyZ2V0O1xuXG5cdFx0dGhpcy5jaGVja1BhY2soKTtcblxuXHRcdGNvbnN0IGN1cnJlbnRGcmFtZSA9IHRoaXMuX2pzb25bdGhpcy5fY3VycmVudFBhY2tdLmZyYW1lc1t0aGlzLmdldEN1cnJlbnRSZWxhdGVkVG9QYWNrKCldO1xuXG5cdFx0Y29uc3QgbmV3U2l6ZSA9IHtcblx0XHRcdHc6IGN1cnJlbnRGcmFtZS5mcmFtZS53LFxuXHRcdFx0aDogY3VycmVudEZyYW1lLmZyYW1lLmhcblx0XHR9O1xuXG5cdFx0Y29uc3QgbmV3UG9zaXRpb24gPSB7XG5cdFx0XHR4OiAwLFxuXHRcdFx0eTogMFxuXHRcdH07XG5cblx0XHR0aGlzLl9jdHhUYXJnZXQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cblx0XHRpZiAodGhpcy5fZmlsbENvbG9yKSB7XG5cblx0XHRcdHRoaXMuX2N0eFRhcmdldC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdH1cblxuXHRcdGlmIChjdXJyZW50RnJhbWUucm90YXRlZCkge1xuXG5cdFx0XHR0aGlzLl9jdHhUYXJnZXQuc2F2ZSgpO1xuXHRcdFx0dGhpcy5fY3R4VGFyZ2V0LnRyYW5zbGF0ZShjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMik7XG5cdFx0XHR0aGlzLl9jdHhUYXJnZXQucm90YXRlKC1NYXRoLlBJIC8gMik7XG5cblx0XHRcdHRoaXMuX2N0eFRhcmdldC50cmFuc2xhdGUoLWNhbnZhcy5oZWlnaHQgLyAyLCAtY2FudmFzLndpZHRoIC8gMik7XG5cblx0XHRcdG5ld1NpemUudyA9IGN1cnJlbnRGcmFtZS5mcmFtZS5oO1xuXHRcdFx0bmV3U2l6ZS5oID0gY3VycmVudEZyYW1lLmZyYW1lLnc7XG5cdFx0fVxuXG5cdFx0aWYgKGN1cnJlbnRGcmFtZS50cmltbWVkKSB7XG5cblx0XHRcdG5ld1Bvc2l0aW9uLnggPSBjdXJyZW50RnJhbWUuc3ByaXRlU291cmNlU2l6ZS54O1xuXHRcdFx0bmV3UG9zaXRpb24ueSA9IGN1cnJlbnRGcmFtZS5zcHJpdGVTb3VyY2VTaXplLnk7XG5cblx0XHRcdGlmIChjdXJyZW50RnJhbWUucm90YXRlZCkge1xuXG5cdFx0XHRcdG5ld1Bvc2l0aW9uLnggPSBjYW52YXMuaGVpZ2h0IC0gY3VycmVudEZyYW1lLnNwcml0ZVNvdXJjZVNpemUuaCAtIGN1cnJlbnRGcmFtZS5zcHJpdGVTb3VyY2VTaXplLnk7XG5cdFx0XHRcdG5ld1Bvc2l0aW9uLnkgPSBjdXJyZW50RnJhbWUuc3ByaXRlU291cmNlU2l6ZS54O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2N0eFRhcmdldC5kcmF3SW1hZ2UoXG5cdFx0XHR0aGlzLl9jYW52YXNDYWNoZVt0aGlzLl9jdXJyZW50UGFja10sXG5cdFx0XHRjdXJyZW50RnJhbWUuZnJhbWUueCxcblx0XHRcdGN1cnJlbnRGcmFtZS5mcmFtZS55LFxuXHRcdFx0bmV3U2l6ZS53LFxuXHRcdFx0bmV3U2l6ZS5oLFxuXHRcdFx0bmV3UG9zaXRpb24ueCxcblx0XHRcdG5ld1Bvc2l0aW9uLnksXG5cdFx0XHRuZXdTaXplLncsXG5cdFx0XHRuZXdTaXplLmhcblx0XHQpO1xuXG5cdFx0aWYgKGN1cnJlbnRGcmFtZS5yb3RhdGVkKSB0aGlzLl9jdHhUYXJnZXQucmVzdG9yZSgpO1xuXHR9XG5cblx0dXBkYXRlKGZvcmNlID0gZmFsc2UpIHtcblxuXHRcdGlmICh0aGlzLl9wYWNrQ2FjaGVkIDwgdGhpcy5fbXVsdGlwYWNrU2l6ZSkgdGhpcy5kcmF3Q2FjaGUodGhpcy5fcGFja0NhY2hlZCk7XG5cblx0XHRpZiAoIXRoaXMuX2lzUGxheWluZyAmJiAhZm9yY2UpIHJldHVybjtcblxuXHRcdGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdGNvbnN0IGRlbHRhID0gbm93IC0gdGhpcy5fdGhlbjtcblxuXHRcdGlmIChkZWx0YSA8IHRoaXMuX2ludGVydmFsICYmICFmb3JjZSkgcmV0dXJuO1xuXG5cdFx0dGhpcy5fdGhlbiA9IG5vdyAtIGRlbHRhICUgdGhpcy5faW50ZXJ2YWw7XG5cblx0XHR0aGlzLmRyYXcoKTtcblxuXHRcdGlmICh0aGlzLl9jdXJyZW50ID09PSB0aGlzLl90bykge1xuXG5cdFx0XHRpZiAodGhpcy5fcmVwZWF0KSB7XG5cblx0XHRcdFx0dGhpcy5fY3VycmVudFJlcGVhdCsrO1xuXHRcdFx0XHR0aGlzLl9jdXJyZW50ID0gdGhpcy5fZnJvbTtcblx0XHRcdFx0dGhpcy5fY3VycmVudFBhY2sgPSAwO1xuXG5cdFx0XHRcdGlmICh0aGlzLl9vblJlcGVhdCkgdGhpcy5fb25SZXBlYXQoKTtcblxuXHRcdFx0XHRpZiAodGhpcy5fcmVwZWF0ID4gMCAmJiB0aGlzLl9jdXJyZW50UmVwZWF0ID4gdGhpcy5fcmVwZWF0KSB7XG5cblx0XHRcdFx0XHR0aGlzLl9pc1BsYXlpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLl9vblJlcGVhdENvbXBsZXRlKSB0aGlzLl9vblJlcGVhdENvbXBsZXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXG5cdFx0XHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICh0aGlzLl9vbkNvbXBsZXRlKSB0aGlzLl9vbkNvbXBsZXRlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgdGhpcy5fY3VycmVudCArPSB0aGlzLl9zaWRlO1xuXHR9XG5cblx0cGxheSgpIHtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IHRydWU7XG5cdH1cblxuXHRwYXVzZSgpIHtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXHR9XG5cblx0c3RvcCgpIHtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXHRcdHRoaXMuX2N1cnJlbnQgPSB0aGlzLl9mcm9tO1xuXHR9XG5cblx0cmV2ZXJzZShzaWRlKSB7XG5cblx0XHRpZiAoc2lkZSA9PT0gMSB8fCBzaWRlID09PSAtMSkgdGhpcy5fc2lkZSA9IHNpZGU7XG5cdFx0ZWxzZSB0aGlzLl9zaWRlID0gdGhpcy5fc2lkZSA9PT0gMSA/IC0xIDogMTtcblxuXHRcdGNvbnN0IHRtcEZyb20gPSB0aGlzLl9mcm9tO1xuXHRcdGNvbnN0IHRtcFRvID0gdGhpcy5fdG87XG5cblx0XHR0aGlzLl9zaWRlID09PSAxID8gdGhpcy5fZnJvbSA9IE1hdGgubWluKHRtcEZyb20sIHRtcFRvKSA6IE1hdGgubWF4KHRtcEZyb20sIHRtcFRvKTtcblx0XHR0aGlzLl9zaWRlID09PSAxID8gdGhpcy5fdG8gPSBNYXRoLm1heCh0bXBGcm9tLCB0bXBUbykgOiBNYXRoLm1pbih0bXBGcm9tLCB0bXBUbyk7XG5cdH1cblxuXHRnb0Zyb21Ubyhmcm9tLCB0bykge1xuXG5cdFx0aWYgKGZyb20gPj0gMCkgdGhpcy5fZnJvbSA9IGZyb207XG5cblx0XHRpZiAodG8gPj0gMCkgdGhpcy5fdG8gPSB0bztcblxuXHRcdHRoaXMuX2N1cnJlbnQgPSB0aGlzLl9mcm9tO1xuXHRcdHRoaXMuX3NpZGUgPSBmcm9tID4gdG8gPyAtMSA6IDE7XG5cblx0XHR0aGlzLmZpbmRQYWNrKCk7XG5cdH1cblxuXHRnb1RvQW5kU3RvcChmcmFtZSkge1xuXG5cdFx0dGhpcy5fY3VycmVudCA9IGZyYW1lO1xuXHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXHR9XG5cblx0ZGVzdHJveSgpIHtcblxuXHRcdHRoaXMuX2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0dGhpcy5fY3R4VGFyZ2V0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLl9jYW52YXNUYXJnZXQud2lkdGgsIHRoaXMuX2NhbnZhc1RhcmdldC5oZWlnaHQpO1xuXHR9XG5cblx0Z2V0IGNhbnZhcygpIHtcblxuXHRcdHJldHVybiB0aGlzLl9jYW52YXNUYXJnZXQ7XG5cdH1cblxuXHRzZXQgZnBzKG5icikge1xuXG5cdFx0dGhpcy5faW50ZXJ2YWwgPSAxMDAwIC8gbmJyO1xuXHR9XG5cblx0c2V0IGxvb3AodmFsKSB7XG5cblx0XHRpZiAodmFsKSB0aGlzLl9yZXBlYXQgPSAtMTtcblx0XHRlbHNlIGlmICh0aGlzLl9yZXBlYXQgPT09IC0xKSB0aGlzLl9yZXBlYXQgPSAwO1xuXHR9XG5cblx0c2V0IHJlcGVhdChuYnIpIHtcblxuXHRcdHRoaXMuX3JlcGVhdCA9IG5icjtcblx0XHR0aGlzLl9jdXJyZW50UmVwZWF0ID0gMDtcblx0fVxuXG5cdHNldCBvbkNvbXBsZXRlKGZuKSB7XG5cblx0XHR0aGlzLl9vbkNvbXBsZXRlID0gZm47XG5cdH1cblxuXHRzZXQgb25SZXBlYXQoZm4pIHtcblxuXHRcdHRoaXMuX29uUmVwZWF0ID0gZm47XG5cdH1cblxuXHRzZXQgb25SZXBlYXRDb21wbGV0ZShmbikge1xuXG5cdFx0dGhpcy5fb25SZXBlYXRDb21wbGV0ZSA9IGZuO1xuXHR9XG59XG4iXX0=
