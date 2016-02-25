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
        target = null,
        to = 0
    } = {}) {

        /////////////////////
        // Errors handling //
        /////////////////////

        if (!image) throw new Error('image parameter can not be null');
        if (!json) throw new Error('json parameter can not be null');
        if (loop && repeat) throw new Error('you can not have loop and repeat parameters defined');

        _.set(this, {
            cacheTarget: document.createElement('canvas'),
            current: from,
            currentRepeat: 0,
            fillColor,
            from,
            image,
            interval: 1000 / fps,
            isPlaying: autoplay,
            json,
            onComplete,
            onRepeat,
            onRepeatComplete,
            repeat: loop ? -1 : repeat,
            side: 1,
            target: target ? target : document.createElement('canvas'),
            then: null,
            to: to ? to : json.frames.length
        });

        if (!target) {

            _.get(this).target.width = json.frames[0].sourceSize.w;
            _.get(this).target.height = json.frames[0].sourceSize.h;

            _.get(this).target.style.width = `${json.frames[0].sourceSize.w / (retina ? 2 : 1)}px`;
            _.get(this).target.style.height = `${json.frames[0].sourceSize.h / (retina ? 2 : 1)}px`;
        }

        _.get(this).cacheTarget.width = json.meta.size.w;
        _.get(this).cacheTarget.height = json.meta.size.h;

        _.get(this).ctx = _.get(this).target.getContext('2d');
        _.get(this).ctxCache = _.get(this).cacheTarget.getContext('2d');

        if (fillColor) _.get(this).ctx.fillStyle = fillColor;

        if (typeof from === 'string') _.get(this).from = this.getAssociatedFrameNumber(from);

        if (typeof to === 'string') _.get(this).to = this.getAssociatedFrameNumber(to);

        if (from > _.get(this).to) _.get(this).side = -1;

        //////////////
        // Bindings //
        //////////////

        this.update = this.update.bind(this);

        ///////////
        // Calls //
        ///////////

        this.drawCache();
        this.draw();
    }

    getAssociatedFrameNumber(name) {

        for (let i = 0; i < _.get(this).json.length; i++) {

            if (_.get(this).json[i].filename === name) return i;
        }
    }

    drawCache() {

        _.get(this).ctxCache.drawImage(_.get(this).image, 0, 0);
    }

    draw() {

        const canvas = _.get(this).target;
        const currentFrame = _.get(this).json.frames[_.get(this).current];

        const newSize = {
            w: currentFrame.frame.w,
            h: currentFrame.frame.h
        };

        const newPosition = {
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

        _.get(this).ctx.drawImage(
            _.get(this).cacheTarget,
            currentFrame.frame.x,
            currentFrame.frame.y,
            newSize.w,
            newSize.h,
            newPosition.x,
            newPosition.y,
            newSize.w,
            newSize.h
        );

        if (currentFrame.rotated) _.get(this).ctx.restore();
    }

    ////////////
    // Public //
    ////////////

    /**
     * Call this to update the sprite
     */
    update() {

        if (!_.get(this).isPlaying) return;

        const now = performance.now();
        const delta = now - _.get(this).then;

        if (delta < _.get(this).interval) return;

        _.get(this).then = now - delta % _.get(this).interval;

        this.draw();

        if (
            _.get(this).current + 1 === _.get(this).to && _.get(this).side === 1 ||
            _.get(this).current - 1 === _.get(this).to && _.get(this).side === -1
        ) {

            _.get(this).currentRepeat++;

            if (!_.get(this).repeat && _.get(this).onComplete) _.get(this).onComplete();
            else if (_.get(this).repeat && _.get(this).onRepeat) _.get(this).onRepeat();

            if (_.get(this).repeat > 0 && _.get(this).currentRepeat > _.get(this).repeat - 1) {

                if (_.get(this).onCompleteRepeat) _.get(this).onCompleteRepeat();

                _.get(this).isPlaying = false;
            }
            else if (!_.get(this).repeat) _.get(this).isPlaying = false;

            _.get(this).current = _.get(this).from;
        }
        else _.get(this).current += _.get(this).side;
    }

    /**
     * Play the sprite from the current position
     */
    play() {

        _.get(this).isPlaying = true;
    }

    /**
     * Pause
     */
    pause() {

        _.get(this).isPlaying = false;
    }

    /**
     * Stop the sprite playing and go back to first frame
     */
    stop() {

        _.get(this).isPlaying = false;
        _.get(this).current = _.get(this).from;
    }

    /**
     * Change playing side
     */
    reverse(side) {

        if (side === 1 || side === -1) _.get(this).side = side;
        else _.get(this).side = _.get(this).side === 1 ? -1 : 1;
    }

    /**
     * Set the starting position and the last frame
     */
    goFromTo(from, to) {

        if (from >= 0) _.get(this).from = from;

        if (to >= 0) _.get(this).to = to;

        _.get(this).current = _.get(this).from;
        _.get(this).side = from > to ? -1 : 1;
    }

    /**
     * Go to a defined frame and stop playing
     */
    goToAndStop(frame) {

        _.get(this).current = frame;
        _.get(this).isPlaying = false;
    }

    /////////////
    // Getters //
    /////////////

    get target() {

        return _.get(this).target;
    }

    /////////////
    // Setters //
    /////////////

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
}
