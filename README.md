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

## Documentation

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
