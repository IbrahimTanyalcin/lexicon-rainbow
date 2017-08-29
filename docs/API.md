# <a id="h1" href="#h1">API REFERENCE </a>

This document describes the methods you can call on the LexiconRainbow instance. Refer to the 
[LEGEND][LEGEND] section of the [README][README] file to have list of abbreviations used in this document.

## QUICSTART
Refer to the [API][QUICSTART] section of the [README][README] to have an idea of a general use case.

### INPUT DATA STRUCTURE


### METHODS

#### toggleGUI [:link:](#togglegui-link)<a href="../dev/lexiconRainbow.d3v4.dev.js#L112-L134">🔍</a>

```js
lexiconRainbow.toggleGUI([bool]) {Boolean} //ex: lexiconRainbow.toggleGUI(false) --> turns off the gui
```

* Togges the [GUI][GUI] on or off. 
* No argument supplied means as if `false` has been specified.
* This is not meant to be called by the developer but it actually called by `lexiconRainbow.GUI`.

#### toggleAxis [:link:](#toggleaxis-link)<a href="../dev/lexiconRainbow.d3v4.dev.js#L135-L144">🔍</a>

```js
lexiconRainbow.toggleAxis([bool]) {Boolean|String} //ex: lexiconRainbow.toggleAxis("Red") --> paints the axis red
```

* Togges the axis on or off. 
* No argument supplied means as if `false` has been specified.
* If the argument is a truthy value AND a color string(hex, rgb, rgba or one of html color names), then the axis is turned on with that color.
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.changeScale`](../dev/lexiconRainbow.d3v4.dev.js#L1763)
which is dynamically added after calling [`lexiconRainbow.append`](../dev/lexiconRainbow.d3v4.dev.js#L989).



[README]: https://github.com/IbrahimTanyalcin/lexicon-rainbow/blob/master/docs/README.md
[LEGEND]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#legends
[QUICSTART]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#api
[GUI]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#anatomy
[MUTAFRAME]: http://deogen2.mutaframe.com/ 