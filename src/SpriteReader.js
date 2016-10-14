export default class SpriteReader {

	constructor(image = null, json = null, {
		autoplay = true,
		canvas = null,
		fillColor = null,
		fps = 30,
		from = 0,
		loop = false,
		onReady = null,
		onComplete = null,
		onRepeat = null,
		onRepeatComplete = null,
		repeat = 0,
		retina = false,
		reverse = false,
		to = null
	} = {}) {

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

		this._onReady = onReady;
		this._onComplete = onComplete;
		this._onRepeat = onRepeat;
		this._onRepeatComplete = onRepeatComplete;

		if (!this._image.length) this._image = [this._image];
		if (!this._json.length) this._json = [this._json];

		if (this._to === null) {

			let total = 0;

			for (let i = 0; i < this._multipackSize; i++) {

				total += this._json[i].frames.length;
			}

			this._to = total - 1;
		}

		this._side = reverse || this._from > this._to ? -1 : 1;

		if (this._side === -1 && this._from < this._to) {

			const tmpFrom = this._from;
			const tmpTo = this._to;

			this._from = Math.max(tmpFrom, tmpTo);
			this._to = Math.min(tmpFrom, tmpTo);
		}

		const tmpCanvas = document.createElement('canvas');

		for (let i = 0; i < this._multipackSize; i++) {

			this._canvasCache[i] = tmpCanvas.cloneNode(false);

			this._canvasCache[i].width = this._json[i].meta.size.w;
			this._canvasCache[i].height = this._json[i].meta.size.h;

			this._ctxCache[i] = this._canvasCache[i].getContext('2d');
		}

		if (!canvas) {

			this._canvasTarget.width = this._json[0].frames[0].sourceSize.w;
			this._canvasTarget.height = this._json[0].frames[0].sourceSize.h;

			Object.assign(this._canvasTarget.style, {
				width: `${this._canvasTarget.width / (retina ? 2 : 1)}px`,
				height: `${this._canvasTarget.height / (retina ? 2 : 1)}px`
			});
		}

		this._ctxTarget = this._canvasTarget.getContext('2d');

		if (fillColor) this._ctxTarget.fillStyle = fillColor;

		this.update(true);
	}

	// find the pack that contains the current frame

	findPack() {

		let currentTmp = 0;
		let currentPackTmp = 0;

		while (this._current > currentTmp) {

			currentTmp += this._json[currentPackTmp].frames.length;

			if (this._current > currentTmp) currentPackTmp++;
		}

		this._currentPack = currentPackTmp;
	}

	// check if we are targeting outside the current pack

	checkPack() {

		if (this.getCurrentRelatedToPack() > this._json[this._currentPack].frames.length - 1) {

			if (this._currentPack < this._multipackSize - 1) this._currentPack++;
			else this._currentPack = 0;
		}
	}

	// get an index0 based number related to the current pack

	getCurrentRelatedToPack() {

		let increment = 0;

		for (let i = 0; i < this._currentPack; i++) increment += this._json[i].frames.length;

		return this._current - increment;
	}

	drawCache() {

		const index = this._packCached;
		const tmpCanvas = document.createElement('canvas');
		const tmpCtx = tmpCanvas.getContext('2d');

		tmpCanvas.width = this._canvasCache[index].width;
		tmpCanvas.height = this._canvasCache[index].height;

		tmpCtx.drawImage(this._image[index], 0, 0);
		const imgData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
		this._ctxCache[index].putImageData(imgData, 0, 0);

		this._packCached++;

		if (this._packCached === this._multipackSize && this._onReady) this._onReady();

		// if you simply call the below line, you will have latency when switching pack

		// this._ctxCache[i].drawImage(this._image[i], 0, 0);
	}

	draw() {

		const canvas = this._canvasTarget;

		this.checkPack();

		const currentFrame = this._json[this._currentPack].frames[this.getCurrentRelatedToPack()];

		const newSize = {
			w: currentFrame.frame.w,
			h: currentFrame.frame.h
		};

		const newPosition = {
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

		this._ctxTarget.drawImage(
			this._canvasCache[this._currentPack],
			currentFrame.frame.x,
			currentFrame.frame.y,
			newSize.w,
			newSize.h,
			newPosition.x,
			newPosition.y,
			newSize.w,
			newSize.h
		);

		if (currentFrame.rotated) this._ctxTarget.restore();
	}

	update(force = false) {

		if (this._packCached < this._multipackSize) this.drawCache();

		if (!this._isPlaying && !force) return;

		const now = performance.now();
		const delta = now - this._then;

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
			}
			else {

				this._isPlaying = false;

				if (this._onComplete) this._onComplete();
			}
		}
		else this._current += this._side;
	}

	play() {

		this._isPlaying = true;
	}

	pause() {

		this._isPlaying = false;
	}

	stop() {

		this._isPlaying = false;
		this._current = this._from;
	}

	reverse(force = null) {

		if (force !== null) this._side = force ? 1 : -1;
		else this._side = this._side === 1 ? -1 : 1;

		const tmpFrom = this._from;
		const tmpTo = this._to;

		this._side === 1 ? this._from = Math.min(tmpFrom, tmpTo) : Math.max(tmpFrom, tmpTo);
		this._side === 1 ? this._to = Math.max(tmpFrom, tmpTo) : Math.min(tmpFrom, tmpTo);
	}

	goFromTo(from, to) {

		if (from >= 0) this._from = from;

		if (to >= 0) this._to = to;

		this._current = this._from;
		this._side = from > to ? -1 : 1;

		this.findPack();
	}

	goToAndStop(frame) {

		this._current = frame;
		this._isPlaying = false;
	}

	destroy() {

		this._isPlaying = false;

		this._ctxTarget.clearRect(0, 0, this._canvasTarget.width, this._canvasTarget.height);
	}

	get canvas() {

		return this._canvasTarget;
	}

	set fps(nbr) {

		this._interval = 1000 / nbr;
	}

	set loop(val) {

		if (val) this._repeat = -1;
		else if (this._repeat === -1) this._repeat = 0;
	}

	set repeat(nbr) {

		this._repeat = nbr;
		this._currentRepeat = 0;
	}

	set onComplete(fn) {

		this._onComplete = fn;
	}

	set onRepeat(fn) {

		this._onRepeat = fn;
	}

	set onRepeatComplete(fn) {

		this._onRepeatComplete = fn;
	}
}
