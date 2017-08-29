# <a id="h1" href="#h1">API REFERENCE </a>

This document describes the methods you can call on the LexiconRainbow instance. Refer to the 
[LEGEND][LEGEND] section of the [README][README] file to have list of abbreviations used in this document.

## QUICSTART
Refer to the [API][QUICSTART] section of the [README][README] to have an idea of a general use case. Just a hint:
`.append` and `.render` methods are always called **LAST**.

### INPUT DATA STRUCTURE


### METHODS

#### toggleGUI [:link:](#togglegui-link)[🔍][toggleGUI]

```js
lexiconRainbow.toggleGUI([bool]) {Boolean} //ex: lexiconRainbow.toggleGUI(false) --> turns off the gui
```

* Togges the [GUI][GUI] on or off. 
* No argument supplied means as if `false` has been specified.
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`](../dev/lexiconRainbow.d3v4.dev.js#L2147).

#### toggleAxis [:link:](#toggleaxis-link)<a href="../dev/lexiconRainbow.d3v4.dev.js#L135">🔍</a>

```js
lexiconRainbow.toggleAxis([bool]) {Boolean|String} //ex: lexiconRainbow.toggleAxis("Red") --> paints the axis red
```

* Togges the axis on or off. 
* No argument supplied means as if `false` has been specified.
* If the argument is a truthy value AND a color string(hex, rgb, rgba or one of html color names), then the axis is turned on with that color.
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.changeScale`](../dev/lexiconRainbow.d3v4.dev.js#L1763)
which is dynamically added after calling [`lexiconRainbow.append`](../dev/lexiconRainbow.d3v4.dev.js#L989).

#### setViewBox [:link:](#togglegui-link)<a href="../dev/lexiconRainbow.d3v4.dev.js#L145">🔍</a>

```js
lexiconRainbow.setViewBox([x,y,w,h]) {Number, Number, Number, Number} //ex: lexiconRainbow.setViewBox(0,0,600,200) --> registeres a function to set viewBox
//x and y are origin, w stands for width, h stands for height
```

* Registeres a function to set the svg viewBox. 
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`](../dev/lexiconRainbow.d3v4.dev.js#L2147).
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.

#### setViewBox [:link:](#togglegui-link)<a href="../dev/lexiconRainbow.d3v4.dev.js#L145">🔍</a>

```js
lexiconRainbow.setCanvasDims([w,h]) {Number, Number} //ex: lexiconRainbow.setCanvasDims(600,200) --> registeres a function to set canvas dimensions
//w stands for width, h stands for height
```

* Registeres a function to set the canvas dimensions. 
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`](../dev/lexiconRainbow.d3v4.dev.js#L2147).
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.
* In versions of IE, svg cannot be scaled properly, so the aim is to force the position css property of the svg to absolute while forcing the 
browser to scale based on the width and height of the canvas element which the display property set to "hidden". 




[README]: https://github.com/IbrahimTanyalcin/lexicon-rainbow/blob/master/docs/README.md
[LEGEND]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#legends
[QUICSTART]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#api
[GUI]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#anatomy
[MUTAFRAME]: http://deogen2.mutaframe.com/ 

[toggleGUI]: ../dev/lexiconRainbow.d3v4.dev.js#L112