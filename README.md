# sprite-reader

Little TexturePacker animation engine. It allows you to play in a canvas your TexturePacker JSON export (array typed).

#### Why sprite-reader ?

- cache image in an offscreen canvas to optimize further calls.
- sprite `update` function has to be called in a requestAnimationFrame loop by your own. Therefore, there is only one raf to handle, not multiple ones.

#### Requirements

Generating sprite of maxsize 2048 * 2048 seems to give the best result.

##### With multipack

In order to work with multipack (and only in that case), TexturePacker configuration must follow some rules :
- `Algorithm: Basic`
- `Sort by: Name`
- `Sort order: Ascending`
- `Detect identical sprites` has to be unchecked

#### Browser compatibility

Should works in IE9+ browsers (canvas compatibility).

For IE9 support you will have to install :
- `perfnow` polyfill with `npm install -S perfnow`

## Installation

`npm install -S sprite-reader`

## Example

```javascript
var SpriteReader = require('sprite-reader');

var reader;
var img = new Image();
img.onload = function() {
	
	reader = new SpriteReader({
		image: img,
		json: require('sprite-data.json')
	});

	anim();
};
img.src = 'sprite.jpg';

function anim() {
	
	requestAnimationFrame(anim);

	reader.update();
}
```

## Documentation

##### Constructor

```javascript
new SpriteReader({
	image: [], // an image or an array of images
	json: [] // the associated data or array of datas. Must be equals to image length
});
```

###### Options

Name | Type | Default | Description
---- | ---- | ------- | -----------
autoplay | Boolean | true | Does animation start playing immediately
canvas | Dom Element | null | The targeting canvas element. If not provided, one will be created and must be inserted (accessible through getter)
fillColor | Hex color | null | A color to fill the background
fps | Number | 30 | FPS to play the animation
from | Int | 0 | Starting frame
loop | Boolean | false | Does animation must loop when it reachs the to frame
onReady | Function | null | A function to be called when all sprites have been cached 
onComplete | Function | null | A function to be called
onRepeat | Function | null | Function to be called at each repeat
onRepeatComplete | Function | null | Function to be called when the animation has finish his repeat
repeat | Int | 0 | How many time the animation should repeat
retina | Boolean | false | If true, the created canvas (if no one was provided) would be styled with width and height divided by 2
side | Int | 1 | If -1, animation will be played in reverse side 
to | Int | image.length - 1 | Define at which frame to stop the animation

##### Methods

Name | Options | Description
---- | ------- | -----------
update() | force:Boolean (false) | Update the current sprite according to the FPS. This has to ba called by your own in a raf. If force is set to true, FPS will be ignore and frame will be incremented
play() | | Start playing from last known position
pause() | | Pause at current position
stop() | | Stop playing and set current position to from value
reverse() | side:Int (null) | Switch playing side. `-1` or `1` can be pass to force side 
goFromTo() | from:Int (null), to:Int (null) | Set cursor to from/to values
goToAndStop() | frame:Int* | Go to frame number and stop playing
destroy() | | Clean the current sprite

##### Properties

###### Getters

Name | Description
---- | -----------
canvas | return the targeting canvas. If no canvas was given to the constructor, you will have to add this to your page

###### Setters

Name | Type | Description
---- | ---- | -----------
fps | Number | Set fps of the animation
loop | Boolean | Set animation looping status
repeat | Number | How many time the animation must be repeated after the first complete
onComplete | Function | Function to be called once when animation complete. Does not trigger if loop is set to true
onRepeat | Function | Function to be called at each repeat
onRepeatComplete | Function | Function to be called when the animation has finish his repeat

#### Contribute

First you should install [EditorConfig](http://editorconfig.org/) package in your code editor. Then,

```
cd .git/hooks
ln -s ../../hooks/pre-commit

npm install
```

Then 2 commands are available :
- `npm run watch` watch js files
- `npm run build` clean, build and uglify js files
