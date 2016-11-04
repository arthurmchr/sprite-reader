sprite-reader
=============

Little TexturePacker animation engine. It allows you to play in a canvas your TexturePacker JSON export (array typed).

Installation
============

```
npm install -S sprite-reader
```

How to use
==========

```javascript
var SpriteReader = require('sprite-reader');

var reader;

var img = new Image();
img.onload = function() {
	
	reader = new SpriteReader(img, require('sprite-data.json'));

	anim();
};
img.src = 'sprite.jpg';

function anim() {
	
	requestAnimationFrame(anim);

	reader.update();
}
```

##### With multipack

In order to work with multipack (and only in that case), TexturePacker configuration must follow some configuration rules :
- `Algorithm: Basic`
- `Sort by: Name`
- `Sort order: Ascending`
- `Detect identical sprites` has to be unchecked

Documentation
=============

### Constructor

```javascript
new SpriteReader(image, json[, options]);
```

#### image `Array[Image]`
The loaded images which contain the sprites. Single `Image` can be passed without array.

#### json `Array[Object]`
JSON datas associated to `image` order. Length of the array must be equals to `image` length.

---

### Options

#### autoplay `Boolean` `true`
Start playing immediately when instanciated

#### canvas `Canvas` `null` 
The targeting canvas element. If not provided, one will be created and must be inserted, accessible through `canvas` property.

#### fillColor `Hex` `null`
Fill background color

#### fps `Number` `30`
FPS of the animation

#### from `Number` `0`
Starting sprite

#### loop `Boolean` `false`
Loop when it reaches `to` value

#### onReady `Function` `null`
Called when all sprites have been cached 

#### onComplete `Function` `null`
Called when the animation complete. Does not work if repeat is set.

#### onRepeat `Function` `null`
Called at each repeat

#### onRepeatComplete `Function` `null`
Called when the animation has played all repeat

#### repeat `Number` `0`
How many time the animation should repeat

#### retina `Boolean` `false`
If true, the created canvas (if no one was provided) would be styled with `width` and `height` divided by 2

#### reverse `Boolean` `false`
If `true`, animation will be played in reverse side 

#### to `Number` `null`
Frame to stop the animation

---

### Methods

#### update([force])
Update the current sprite according to `fps`. This method has to ba called by your own in a raf.
- **force** `Boolean` `false` : If `force` is set to `true`, FPS will be ignore and current frame will be updated

#### play()
Start playing from last known position

#### pause()
Pause at current position

#### stop()
Stop playing and set current position to `from` value

#### reverse([side])
Switch playing side, optionaly forcing it
- **side** `Boolean` `null` : Switch playing side. If side is set to `true`, normal side will be forced; `false` will force reverse.

#### goFromTo([from, to])
`from` or `to` can be omitted.
- **from** `Number` : Set starting frame and go to it
- **to** `Number` : Set ending frame

#### goToAndStop(frame)
- **frame** `Number` : Move cursor to `frame` and stop playing

#### destroy()
Clear the canvas and stop it

---

### Properties

###### Getter

#### canvas `Canvas`
Return the targeting canvas. If no `canvas` was given to the constructor, you will have to add this to your page.


###### Setters

#### fps `Number`
FPS of the animation

#### loop `Boolean`
Loop when it reaches `to` value

#### repeat `Number`
How many time the animation should repeat

#### onComplete `Function`
Called when the animation complete. Does not work if repeat is set.

#### onRepeat `Function`
Called at each repeat

#### onRepeatComplete `Function`
Called when the animation has played all repeat

---

Browser compatibility
---------------------

Should works in IE9+ browsers (canvas compatibility).

For IE9 support you will have to install :
- `perfnow` polyfill with `npm install -S perfnow`

Contribute
----------

First you should install [EditorConfig](http://editorconfig.org/) package in your code editor. Then,

```
cd .git/hooks
ln -s ../../hooks/pre-commit

npm install
```

Then 2 commands are available :
- `npm run watch` watch and build js files
- `npm run build` clean, build and uglify js files
