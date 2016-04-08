'use strict';

var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

var _ = new WeakMap();

var SpriteReader = function () {
	function SpriteReader(image, json) {
		var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

		var _ref$autoplay = _ref.autoplay;
		var autoplay = _ref$autoplay === undefined ? true : _ref$autoplay;
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
		var _ref$target = _ref.target;
		var target = _ref$target === undefined ? null : _ref$target;
		var _ref$to = _ref.to;
		var to = _ref$to === undefined ? 0 : _ref$to;
		babelHelpers.classCallCheck(this, SpriteReader);


		if (!image) throw new Error('image parameter can not be null');
		if (!json) throw new Error('json parameter can not be null');
		if (loop && repeat) throw new Error('you can not have loop and repeat parameters defined');

		_.set(this, {
			cacheTarget: document.createElement('canvas'),
			current: from,
			currentRepeat: 0,
			fillColor: fillColor,
			from: from,
			image: image,
			interval: 1000 / fps,
			isPlaying: autoplay,
			json: json,
			onComplete: onComplete,
			onRepeat: onRepeat,
			onRepeatComplete: onRepeatComplete,
			repeat: loop ? -1 : repeat,
			side: 1,
			target: target ? target : document.createElement('canvas'),
			then: null,
			to: to ? to : json.frames.length
		});

		if (!target) {

			_.get(this).target.width = json.frames[0].sourceSize.w;
			_.get(this).target.height = json.frames[0].sourceSize.h;

			_.get(this).target.style.width = json.frames[0].sourceSize.w / (retina ? 2 : 1) + 'px';
			_.get(this).target.style.height = json.frames[0].sourceSize.h / (retina ? 2 : 1) + 'px';
		}

		_.get(this).cacheTarget.width = json.meta.size.w;
		_.get(this).cacheTarget.height = json.meta.size.h;

		_.get(this).ctx = _.get(this).target.getContext('2d');
		_.get(this).ctxCache = _.get(this).cacheTarget.getContext('2d');

		if (fillColor) _.get(this).ctx.fillStyle = fillColor;

		if (typeof from === 'string') _.get(this).from = this.getAssociatedFrameNumber(from);

		if (typeof to === 'string') _.get(this).to = this.getAssociatedFrameNumber(to);

		if (from > _.get(this).to) _.get(this).side = -1;

		this.update = this.update.bind(this);

		this.drawCache();
		this.draw();
	}

	babelHelpers.createClass(SpriteReader, [{
		key: 'getAssociatedFrameNumber',
		value: function getAssociatedFrameNumber(name) {

			for (var i = 0; i < _.get(this).json.length; i++) {

				if (_.get(this).json[i].filename === name) return i;
			}
		}
	}, {
		key: 'drawCache',
		value: function drawCache() {

			_.get(this).ctxCache.drawImage(_.get(this).image, 0, 0);
		}
	}, {
		key: 'draw',
		value: function draw() {

			var canvas = _.get(this).target;
			var currentFrame = _.get(this).json.frames[_.get(this).current];

			var newSize = {
				w: currentFrame.frame.w,
				h: currentFrame.frame.h
			};

			var newPosition = {
				x: 0,
				y: 0
			};

			_.get(this).ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (_.get(this).fillColor) {

				_.get(this).ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			if (currentFrame.rotated) {

				_.get(this).ctx.save();
				_.get(this).ctx.translate(canvas.width / 2, canvas.height / 2);
				_.get(this).ctx.rotate(-Math.PI / 2);

				_.get(this).ctx.translate(-canvas.height / 2, -canvas.width / 2);

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

			_.get(this).ctx.drawImage(_.get(this).cacheTarget, currentFrame.frame.x, currentFrame.frame.y, newSize.w, newSize.h, newPosition.x, newPosition.y, newSize.w, newSize.h);

			if (currentFrame.rotated) _.get(this).ctx.restore();
		}
	}, {
		key: 'update',
		value: function update() {

			if (!_.get(this).isPlaying) return;

			var now = performance.now();
			var delta = now - _.get(this).then;

			if (delta < _.get(this).interval) return;

			_.get(this).then = now - delta % _.get(this).interval;

			this.draw();

			if (_.get(this).current + 1 === _.get(this).to && _.get(this).side === 1 || _.get(this).current - 1 === _.get(this).to && _.get(this).side === -1) {

				_.get(this).currentRepeat++;

				if (!_.get(this).repeat && _.get(this).onComplete) _.get(this).onComplete();else if (_.get(this).repeat && _.get(this).onRepeat) _.get(this).onRepeat();

				if (_.get(this).repeat > 0 && _.get(this).currentRepeat > _.get(this).repeat - 1) {

					if (_.get(this).onCompleteRepeat) _.get(this).onCompleteRepeat();

					_.get(this).isPlaying = false;
				} else if (!_.get(this).repeat) _.get(this).isPlaying = false;

				_.get(this).current = _.get(this).from;
			} else _.get(this).current += _.get(this).side;
		}
	}, {
		key: 'play',
		value: function play() {

			_.get(this).isPlaying = true;
		}
	}, {
		key: 'pause',
		value: function pause() {

			_.get(this).isPlaying = false;
		}
	}, {
		key: 'stop',
		value: function stop() {

			_.get(this).isPlaying = false;
			_.get(this).current = _.get(this).from;
		}
	}, {
		key: 'reverse',
		value: function reverse(side) {

			if (side === 1 || side === -1) _.get(this).side = side;else _.get(this).side = _.get(this).side === 1 ? -1 : 1;
		}
	}, {
		key: 'goFromTo',
		value: function goFromTo(from, to) {

			if (from >= 0) _.get(this).from = from;

			if (to >= 0) _.get(this).to = to;

			_.get(this).current = _.get(this).from;
			_.get(this).side = from > to ? -1 : 1;
		}
	}, {
		key: 'goToAndStop',
		value: function goToAndStop(frame) {

			_.get(this).current = frame;
			_.get(this).isPlaying = false;
		}
	}, {
		key: 'target',
		get: function get() {

			return _.get(this).target;
		}
	}, {
		key: 'fps',
		set: function set(nbr) {

			_.get(this).interval = 1000 / nbr;
		}
	}, {
		key: 'loop',
		set: function set(state) {

			if (state) _.get(this).repeat = -1;else if (_.get(this).repeat === -1) _.get(this).repeat = 0;
		}
	}, {
		key: 'repeat',
		set: function set(nbr) {

			_.get(this).repeat = nbr;
			_.get(this).currentRepeat = 0;
		}
	}]);
	return SpriteReader;
}();

module.exports = SpriteReader;