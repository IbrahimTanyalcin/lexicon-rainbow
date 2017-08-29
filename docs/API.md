# <a id="h1" href="#h1">API REFERENCE </a>

This document describes the methods you can call on the LexiconRainbow instance. Refer to the 
[LEGEND][LEGEND] section of the [README][README] file to have list of abbreviations used in this document.

## QUICSTART
Refer to the [API][QUICSTART] section of the [README][README] to have an idea of a general use case. Just a hint:
* `.append` and `.render` methods are always called **LAST**.
* Look out for the :warning: signs, they usually mark methods that is **NOT** inteded to be called by you but rather documented for completeness.
* Look out for the :+1: signs, they usually point out to something that might worth a try.
* Look out for the :-1: signs, they usually point out to something that might **NOT** be good to try.

### INPUT DATA STRUCTURE


### METHODS

#### toggleGUI [:link:](#togglegui-link)[🔍][toggleGUI]

```js
lexiconRainbow.toggleGUI([bool]) {Boolean} //ex: lexiconRainbow.toggleGUI(false) --> turns off the gui
```

* Togges the [GUI][GUI] on or off. 
* No argument supplied means as if `false` has been specified.
* :warning: This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`][.GUI].

#### toggleAxis [:link:](#toggleaxis-link)[🔍][toggleAxis]

```js
lexiconRainbow.toggleAxis([bool]) {Boolean|String} //ex: lexiconRainbow.toggleAxis("Red") --> paints the axis red
```

* Togges the axis on or off. 
* No argument supplied means as if `false` has been specified.
* If the argument is a truthy value AND a color string(hex, rgb, rgba or one of html color names), then the axis is turned on with that color.
* :warnin: This is not meant to be called by the developer but it actually called by [`lexiconRainbow.changeScale`][changeScale]
which is dynamically added after calling [`lexiconRainbow.append`][append].

#### setViewBox [:link:](#setviewbox-link)[🔍][setViewBox]

```js
lexiconRainbow.setViewBox([x,y,w,h]) {Number, Number, Number, Number} //ex: lexiconRainbow.setViewBox(0,0,600,200) --> registeres a function to set viewBox
//x and y are origin, w stands for width, h stands for height
```

* Registeres a function to set the svg [viewBox][w3c-viewbox]. 
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`][.GUI].
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.

#### setCanvasDims [:link:](#setcanvasdims-link)[🔍][setCanvasDims]

```js
lexiconRainbow.setCanvasDims([w,h]) {Number, Number} //ex: lexiconRainbow.setCanvasDims(600,200) --> registeres a function to set canvas dimensions
//w stands for width, h stands for height
```

* Registeres a function to set the canvas dimensions. 
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`][.GUI].
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.
* In versions of IE, svg cannot be scaled properly, so the aim is to force the position css property of the svg to absolute while forcing the 
browser to scale based on the width and height of the canvas element which the display property set to "hidden". 

#### lexID [:link:](#lexid-link)[🔍][lexID]

```js
lexiconRainbow.lexID([id]) {String} //ex: lexiconRainbow.lexID("someInstance") --> the created svg will have an id attribute of "someInstance"
```

* Gives the created svg the specified id string and returns the `lexiconRainbow` instace.
* If no arguement is given, then returns the id string of the created svg instead.

#### x [:link:](#x-link)[🔍][x]

```js
lexiconRainbow.x([x]) {Number} //ex: lexiconRainbow.x(10) --> the created svg will have an origin x-offset of 10 in units of userSpaceOnUse"
```

* Not calling this at all implies the default value of x which is 0.
* Sets the origin-x coordinate of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :-1: Setting this effectively shifts the viewBox right or left, potentially concealing other elements. There is no reason to call this method unless
you deliberately want to offset.

#### y [:link:](#y-link)[🔍][y]

```js
lexiconRainbow.y([y]) {Number} //ex: lexiconRainbow.y(10) --> the created svg will have an origin y-offset of 10 in units of userSpaceOnUse"
```

* Not calling this at all implies the default value of y which is 0.
* Sets the origin-y coordinate of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :-1: Setting this effectively shifts the viewBox down or up, potentially concealing other elements. There is no reason to call this method unless
you deliberately want to offset.

#### w [:link:](#w-link)[🔍][w]

```js
lexiconRainbow.w([w]) {Number} //ex: lexiconRainbow.w(600) --> the created svg will have a width of 600 in units of userSpaceOnUse"
```

* Not calling this at all implies the default value of w which is 100, probably **NOT** what you want.
* Sets the width of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :+1: You might want to set the width larger than the height something like 600 to 200 or maybe something close to golden ratio (w = ~1.618*h).
In anycase, the text size will be adjusted automatically.

#### h [:link:](#h-link)[🔍][h]

```js
lexiconRainbow.h([h]) {Number} //ex: lexiconRainbow.h(200) --> the created svg will have an height of 200 in units of userSpaceOnUse"
```

* Not calling this at all implies the default value of h which is 100, probably **NOT** what you want.
* Sets the height of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :+1: You might want to set the width larger than the height something like 600 to 200 or maybe something close to golden ratio (w = ~1.618*h).
In anycase, the text size will be adjusted automatically.

#### h [:link:](#h-link)[🔍][h]

```js
lexiconRainbow.h([h]) {Number} //ex: lexiconRainbow.h(200) --> the created svg will have an height of 200 in units of userSpaceOnUse"
```

* Not calling this at all implies the default value of h which is 100, probably **NOT** what you want.
* Sets the height of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :+1: You might want to set the width larger than the height something like 600 to 200 or maybe something close to golden ratio (w = ~1.618*h).
In anycase, the text size will be adjusted automatically.






[README]: https://github.com/IbrahimTanyalcin/lexicon-rainbow/blob/master/docs/README.md
[LEGEND]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#legends
[QUICSTART]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#api
[GUI]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#anatomy
[MUTAFRAME]: http://deogen2.mutaframe.com/ 

[w3c-viewbox]: https://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute

[toggleGUI]: ../dev/lexiconRainbow.d3v4.dev.js#L112
[toggleAxis]: ../dev/lexiconRainbow.d3v4.dev.js#L135
[.GUI]: ../dev/lexiconRainbow.d3v4.dev.js#L2147
[changeScale]: ../dev/lexiconRainbow.d3v4.dev.js#L1763
[append]: ../dev/lexiconRainbow.d3v4.dev.js#L989
[setViewBox]: ../dev/lexiconRainbow.d3v4.dev.js#L145
[setCanvasDims]: ../dev/lexiconRainbow.d3v4.dev.js#L146
[lexID]: ../dev/lexiconRainbow.d3v4.dev.js#L147
[x]: ../dev/lexiconRainbow.d3v4.dev.js#148
[y]: ../dev/lexiconRainbow.d3v4.dev.js#149
[w]: ../dev/lexiconRainbow.d3v4.dev.js#150
[h]: ../dev/lexiconRainbow.d3v4.dev.js#151
