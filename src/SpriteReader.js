const _ = new WeakMap();

export default class SpriteReader {

	constructor(image, json, {
		autoplay = true,
		fillColor = null,
		fps = 30,
		from = 0,
		loop = false,
		onComplete = null,
		onRepeat = null,
		onRepeatComplete = null,
		repeat = 0,
		retina = false,
		canvasTarget = null,
		to = null
	} = {}) {

		if (!image) throw new Error('image parameter can not be null');
		if (!json) throw new Error('json parameter can not be null');
		if (image.length && json.length && image.length !== json.length) throw new Error('image length must be equal to json length');
		if (image.length && !json.length || json.length && !image.length) throw new Error('image and json must be of same type');
		if (loop && repeat) throw new Error('you can not have loop and repeat parameters defined');

		_.set(this, {
			canvasCache: [],
			canvasTarget: canvasTarget ? canvasTarget : document.createElement('canvas'),
			ctxCache: [],
			ctxTarget: null,
			current: from,
			currentPack: 0,
			currentRepeat: 0,
			fillColor,
			from,
			image,
			interval: 1000 / fps,
			isPlaying: autoplay,
			json,
			multipackSize: image.length ? image.length : 1,
			onComplete,
			onRepeat,
			onRepeatComplete,
			repeat: loop ? -1 : repeat,
			side: 1,
			then: null,
			to
		});

		if (!_.get(this).image.length) _.get(this).image = [_.get(this).image];
		if (!_.get(this).json.length) _.get(this).json = [_.get(this).json];

		if (_.get(this).to === null) {

			let total = 0;

			for (let i = 0; i < _.get(this).multipackSize; i++) {

				total += _.get(this).json[i].frames.length;
			}

			_.get(this).to = total - 1;
		}

		const tmpCanvas = document.createElement('canvas');

		for (let i = 0; i < _.get(this).multipackSize; i++) {

			// _.get(this).image[i] = image[i];
			// _.get(this).json[i] = json[i];

			_.get(this).canvasCache[i] = tmpCanvas.cloneNode(false);

			_.get(this).canvasCache[i].width = _.get(this).json[i].meta.size.w;
			_.get(this).canvasCache[i].height = _.get(this).json[i].meta.size.h;

			_.get(this).ctxCache[i] = _.get(this).canvasCache[i].getContext('2d');
		}

		if (!canvasTarget) {

			_.get(this).canvasTarget.width = _.get(this).json[0].frames[0].sourceSize.w;
			_.get(this).canvasTarget.height = _.get(this).json[0].frames[0].sourceSize.h;

			_.get(this).canvasTarget.style.width = `${_.get(this).canvasTarget.width / (retina ? 2 : 1)}px`;
			_.get(this).canvasTarget.style.height = `${_.get(this).canvasTarget.height / (retina ? 2 : 1)}px`;

			// _.get(this).canvasTarget.setAttribute('moz-opaque', '');
		}

		_.get(this).ctxTarget = _.get(this).canvasTarget.getContext('2d');

		if (fillColor) _.get(this).ctxTarget.fillStyle = fillColor;

		// if (typeof from === 'string') _.get(this).from = this.getAssociatedFrameNumber(from);

		// if (typeof to === 'string') _.get(this).to = this.getAssociatedFrameNumber(to);

		if (from > _.get(this).to) _.get(this).side = -1;

		this.update = this.update.bind(this);

		this.drawCache();

		this.update(true);
	}

	// getAssociatedFrameNumber(name) {

	// 	for (let i = 0; i < _.get(this).json.length; i++) {

	// 		if (_.get(this).json[i].filename === name) return i;
	// 	}
	// }

	findPack() {

		let currentTmp = 0;
		let currentPackTmp = 0;

		while (_.get(this).current > currentTmp) {

			currentTmp += _.get(this).json[currentPackTmp].frames.length;

			if (_.get(this).current > currentTmp) currentPackTmp++;
		}

		_.get(this).currentPack = currentPackTmp;
	}

	checkPack() {

		if (this.getCurrentRelatedToPack() > _.get(this).json[_.get(this).currentPack].frames.length - 1) {

			if (_.get(this).currentPack < _.get(this).multipackSize - 1) _.get(this).currentPack++;
			else _.get(this).currentPack = 0;
		}
	}

	getCurrentRelatedToPack() {

		let increment = 0;

		for (let i = 0; i < _.get(this).currentPack; i++) {

			increment += _.get(this).json[i].frames.length;
		}

		return _.get(this).current - increment;
	}

	drawCache() {

		const tmpCanvas = document.createElement('canvas');

		for (let i = 0; i < _.get(this).multipackSize; i++) {

			const tmpCache = tmpCanvas.cloneNode(false);
			tmpCache.width = _.get(this).canvasCache[i].width;
			tmpCache.height = _.get(this).canvasCache[i].height;

			tmpCache.getContext('2d').drawImage(_.get(this).image[i], 0, 0);

			const imgData = tmpCache.getContext('2d').getImageData(0, 0, tmpCache.width, tmpCache.height);

			_.get(this).ctxCache[i].putImageData(imgData, 0, 0);
		}
	}

	draw() {

		const canvas = _.get(this).canvasTarget;

		this.checkPack();

		const currentFrame = _.get(this).json[_.get(this).currentPack].frames[this.getCurrentRelatedToPack()];

		const newSize = {
			w: currentFrame.frame.w,
			h: currentFrame.frame.h
		};

		const newPosition = {
			x: 0,
			y: 0
		};

		_.get(this).ctxTarget.clearRect(0, 0, canvas.width, canvas.height);

		if (_.get(this).fillColor) {

			_.get(this).ctxTarget.fillRect(0, 0, canvas.width, canvas.height);
		}

		if (currentFrame.rotated) {

			_.get(this).ctxTarget.save();
			_.get(this).ctxTarget.translate(canvas.width / 2, canvas.height / 2);
			_.get(this).ctxTarget.rotate(-Math.PI / 2);

			_.get(this).ctxTarget.translate(-canvas.height / 2, -canvas.width / 2);

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

		_.get(this).ctxTarget.drawImage(
			_.get(this).canvasCache[_.get(this).currentPack],
			currentFrame.frame.x,
			currentFrame.frame.y,
			newSize.w,
			newSize.h,
			newPosition.x,
			newPosition.y,
			newSize.w,
			newSize.h
		);

		if (currentFrame.rotated) _.get(this).ctxTarget.restore();
	}

	update(force = false) {

		if (!_.get(this).isPlaying && !force) return;

		const now = performance.now();
		const delta = now - _.get(this).then;

		if (delta < _.get(this).interval) return;

		_.get(this).then = now - delta % _.get(this).interval;

		this.draw();

		if (_.get(this).current === _.get(this).to) {

			_.get(this).currentRepeat++;

			if (_.get(this).repeat > 0 && _.get(this).currentRepeat > _.get(this).repeat - 1) {

				if (_.get(this).onCompleteRepeat) _.get(this).onCompleteRepeat();

				_.get(this).isPlaying = false;
			}
			else if (!_.get(this).repeat) _.get(this).isPlaying = false;

			if (_.get(this).repeat) {

				_.get(this).current = _.get(this).from;
				_.get(this).currentPack = 0;
			}

			if (!_.get(this).repeat && _.get(this).onComplete) _.get(this).onComplete();
			else if (_.get(this).repeat && _.get(this).onRepeat) _.get(this).onRepeat();
		}
		else _.get(this).current += _.get(this).side;
	}

	play() {

		_.get(this).isPlaying = true;
	}

	pause() {

		_.get(this).isPlaying = false;
	}

	stop() {

		_.get(this).isPlaying = false;
		_.get(this).current = _.get(this).from;
	}

	reverse(side) {

		if (side === 1 || side === -1) _.get(this).side = side;
		else _.get(this).side = _.get(this).side === 1 ? -1 : 1;

		const tmpFrom = _.get(this).from;
		const tmpTo = _.get(this).to;

		if (_.get(this).side === 1) {

			_.get(this).from = Math.min(tmpFrom, tmpTo);
			_.get(this).to = Math.max(tmpFrom, tmpTo);
		}
		else {

			_.get(this).from = Math.max(tmpFrom, tmpTo);
			_.get(this).to = Math.min(tmpFrom, tmpTo);
		}
	}

	goFromTo(from, to) {

		if (from >= 0) _.get(this).from = from;

		if (to >= 0) _.get(this).to = to;

		_.get(this).current = _.get(this).from;
		_.get(this).side = from > to ? -1 : 1;

		this.findPack();
	}

	goToAndStop(frame) {

		_.get(this).current = frame;
		_.get(this).isPlaying = false;
	}

	get canvasTarget() {

		return _.get(this).canvasTarget;
	}

	set fps(nbr) {

		_.get(this).interval = 1000 / nbr;
	}

	set loop(state) {

		if (state) _.get(this).repeat = -1;
		else if (_.get(this).repeat === -1) _.get(this).repeat = 0;
	}

	set repeat(nbr) {

		_.get(this).repeat = nbr;
		_.get(this).currentRepeat = 0;
	}

	set onComplete(fn) {

		_.get(this).onComplete = fn;
	}

	set onRepeat(fn) {

		_.get(this).onRepeat = fn;
	}

	set onRepeatComplete(fn) {

		_.get(this).onRepeatComplete = fn;
	}
}
