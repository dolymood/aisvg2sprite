# aisvg2sprite
Convert illustrator(ai) SVG to pretty SVG sprite

## Usage

```
npm install -g aisvg2sprite
```

```
  Usage: aisvg2sprite <file> <output> [options]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -v                             get version
    -f, --remove-fill [pattern]    remove fill attributes by [pattern](default [a-f0-9])
    -s, --remove-stroke [pattern]  remove stroke attributes by [pattern](default [a-f0-9])
    -m, --minimize                 minimize output svg file
    -d, --demo                     create demo.html
```

## examples

* no output: `aisvg2sprite examples/icon.svg` -> `examples/icon.min.svg`

* output is directory: `aisvg2sprite examples/icon.svg examples/default` -> `examples/default/icon.svg`

* output is file: `aisvg2sprite examples/icon.svg examples/default2/default2icon.svg` -> `examples/default2/default2icon.svg`

* create demo: `aisvg2sprite examples/icon.svg examples/demo -d` -> `examples/demo/icon.svg` & `examples/demo/demo.html`

* minimize svg: `aisvg2sprite examples/icon.svg examples/minimize -m` -> `examples/minimize/icon.svg`

* remove fill attributes: `aisvg2sprite examples/icon.svg examples/removeFill -f` -> `examples/removeFill/icon.svg`

* remove fill attributes by `f`(fill:#ffffff): `aisvg2sprite examples/icon.svg examples/removeFill2 -f f` -> `examples/removeFill2/icon.svg`

* remove stroke attributes: `aisvg2sprite examples/icon.svg examples/removeStroke -s` -> `examples/removeStroke/icon.svg`

* with all options and fill pattern is `f`: `aisvg2sprite examples/icon.svg examples/all -f f -s -d -m` -> `examples/all/icon.svg` & `examples/all/demo.html`

* with all options and output is file: `aisvg2sprite examples/icon.svg examples/all2/icon.min.svg -f -s -d -m` -> `examples/all2/icon.min.svg` & `examples/all2/demo.html`

* with all options and output is file, but the extname of output isnt `.svg`: `aisvg2sprite examples/icon.svg examples/all2/icon.min -f -s -d -m` -> `examples/all2/icon.min.svg` & `examples/all2/demo.html`

## Thanks:

<http://www.zhangxinxu.com/sp/svg.html>

## License

[MIT](https://github.com/dolymood/aisvg2sprite/blob/master/LICENSE)
