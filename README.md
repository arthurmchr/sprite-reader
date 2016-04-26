# sprite-reader

Little TexturePacker animation engine. It allows you to play in a canvas your TexturePacker JSON export (array typed).

### Why sprite-reader ?

- cache image in an offscreen canvas to optimize further calls to drawImage.
- sprite `update` function has to be called in a requestAnimationFrame loop by your own. Therefore, there is only one raf to handle, not multiple ones.

### Browser compatibility

Should works in IE9+ browsers (canvas compatibility).

For IE9 support you will have to install :
- `perfnow` with `npm install -S perfnow`
- a WeakMap polyfill (Babel Polyfill)

## Installation

```
```

## Example

In order to work, TexturePacker configuration must follow some rules :
- `Algorithm: Basic`
- `Sort by: Name`
- `Sort order: Ascending`

If you use Multipack, `Detect identical sprites` has to be unchecked.

```js
import SpriteReader from 'sprite-reader';

const image = new Image();
let sprite;

image.onload = function() {

    sprite = new SpriteReader(
        image,
        require('sprite.json') // you can also preload it via ajax, or use your bundler json loader
    );

    document.body.appendChild(sprite.target);
};

image.src = 'sprite.png';

function animate() {

    requestAnimationFrame(animate);

    if (sprite) {

        sprite.update();
    }
}.bind(this);

animate();
```

## Documentation

### Constructor

`const sprite = new SpriteReader(image, json, [options]);`

- `image`
- `json`
- `autoplay`
- `fillColor`
- `fps`
- `from`
- `loop`
- `onComplete`
- `onRepeat`
- `onRepeatComplete`
- `repeat`
- `retina`
- `target`
- `to`

### Methods

`sprite.update()`

`sprite.play()`

`sprite.pause()`

`sprite.stop()`

`sprite.reverse()`

`sprite.goFromTo()`

`sprite.goToAndStop()`

### Properties

`target`

`fps`

`loop`

`repeat`

## Development

```
npm install
npm run build
```
