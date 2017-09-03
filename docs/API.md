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
As shown in [**this example**][MINIMAL], a minimal data structure looks like below:
```js
{
	"ordinal": [
		{
			"name": "A Minimal Set",
			"categories": {
				"A": 1,
				"B": 2,
				"C": 3
			}
		}
	],
	"linear": [
		{
			"domain": [-10,10],
			"name": "A Minimal Set",
			"categories": {
				"A": {intervals:[-9,-4]},
				"B": {intervals:[[-2,2]]},
				"C": {intervals:8}
			}
		}
	]
}
```

The main input object is an object with 2 keys:
`{ordinal:[dataObject..],linear:[dataObject..]}`
* The ordinal key hosts objects that control what is shown on the top of the plot, namely the ['items'](./README.md#anatomy).
* The linear key host objects that control the links/ribbons, how they are drawn and stacked and also the axis.

Each key references an array of **dataObjects**. If a dataObject is under the ordinal key,
then it is an **ordinal dataObject**. Likewise, if a dataObject is under the linear key,
then it is a **linear dataObject**. This for instance is an ordinal data object from the previous example:
```js
{
	"name": "A Minimal Set",
	"categories": {
		"A": 1,
		"B": 2,
		"C": 3
	}
}
```
This also, is a bit more complicated ordinal data object:
```js
{
	"colors": {
		"Clinton":["LightBlue","LightBlue","Blue","DarkBlue"],
		"Trump": ["Pink","Pink","Red","DarkRed"],
		"Others": ["Green","Green","LightGreen","DarkGreen"]
	},
	"name": "All candidates - Eq",
	"categories": {
		"Clinton": 1,
		"Trump": 2,
		"Others": 3
	},
	"mode":"stackEqual",
	"Info": "Pooled vote counts, but equal separation on the top scale"
}
```
And here is a linear data object
```js
{
	"domain": [
		0,
		140000000
	],
	"format":".3s",
	"name": "All candidates(C,T,O)",
	"categories": {
		"Clinton": {intervals:[
			65853516
		],names:["Clinton"]},
		"Trump": {intervals:[
			62984824
		],names:["Trump"]},
		"Others": {intervals:[
			7801446
		],names:["Others"]}
	},
	"glyph": "./usFlag.png",
	"mode":"stack",
	"gMode":"stack",
	"Info": "Total vote counts stacked"
}
```

If you use the inbuilt GUI, you will realize two controllers marked with
'activate ordinal scale control' and 'activate linear scale control' [HERE](./README.md#anatomy).
When you click on them, you can use the mouse/touch to drag and choose the dataObject for the activated scale.

Each dataObject has special keys that change how the information is plotted. Available keys depend on whether
the dataObject is an ordinal or a linear one:

* ### ordinal dataObjects:
  * **name**: name of the dataObject, this will appear on the GUI
  * **categories**: an object with keys of the items that will be displayed. 
  Each key will be shown on the ordinal scale. The values of these keys are used to **sort** the order
  the items will be plotted:
    * All values are coerced from string to number if possible.
	* If it is a single value, than this value is used for sorted.
	* If it is an array, then this array is reduced and THEN sorted. For example, 
	an array with [1,5,[6,9]] is first transformed to [[1,1],[5,5],[6,9]] and finally
	reduced to 1+1+5+5+6+9/6 = 4.5. The resulting value is used for sorting.
	* If value of the key is an object, then a field with the name 'intervals' is looked
	and previous steps are performed.
  * **colors**: Can be a single color name or an array of color names:
  
* linear dataObjects:
### PROPERTIES

#### version [:link:](#version-link)[🔍][version]

```js
lexiconRainbow.version --> returns the version string
```

* Returns the version string. 

#### isAppended [:link:](#isappended-link)[🔍][isappended]

```js
lexiconRainbow.isAppended --> returns the true or false
```

* If the `append` method has already been called, returns `true` otherwise `false`. 

#### passiveSupported [:link:](#passivesupported-link)[🔍][passivesupported]

```js
lexiconRainbow.passiveSupported --> returns if passive events are supported
```

* In certain browsers (Chrome), certain events such as 'touchmove' and 'touchstart' are 'passive' meaning that
calling `preventDefault` will not have effect. To override this, you can pass an object
with the 'passive' key set to true instead of the **useCapture** boolean parameter of the
`window.addEventListener` function. However, one first has to check whether this feature 
is supported. So you can use `lexiconRainbow.passiveSupported` property as a surrogate for
feature detection.

### METHODS

#### toggleGUI [:link:](#togglegui-link)[🔍][toggleGUI]

```js
lexiconRainbow.toggleGUI([bool]) {Boolean} 
//ex: lexiconRainbow.toggleGUI(false) --> turns off the gui
```

* Togges the [GUI][GUI] on or off. 
* No argument supplied means as if `false` has been specified.
* :warning: This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`][.GUI].

#### toggleAxis [:link:](#toggleaxis-link)[🔍][toggleAxis]

```js
lexiconRainbow.toggleAxis([bool]) {Boolean|String} 
//ex: lexiconRainbow.toggleAxis("Red") --> paints the axis red
```

* Togges the axis on or off. 
* No argument supplied means as if `false` has been specified.
* If the argument is a truthy value AND a color string(hex, rgb, rgba or one of html color names), then the axis is turned on with that color.
* :warning: This is not meant to be called by the developer but it actually called by [`lexiconRainbow.changeScale`][changeScale]
which is dynamically added after calling [`lexiconRainbow.append`][append].

#### setViewBox [:link:](#setviewbox-link)[🔍][setViewBox]

```js
lexiconRainbow.setViewBox([x,y,w,h]) {Number, Number, Number, Number} 
//ex: lexiconRainbow.setViewBox(0,0,600,200) --> registeres a function to set viewBox
//x and y are origin, w stands for width, h stands for height
```

* Registers a function to set the svg [viewBox][w3c-viewbox]. 
* This is not meant to be called by the developer but it is actually called by [`lexiconRainbow.GUI`][.GUI].
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.

#### setCanvasDims [:link:](#setcanvasdims-link)[🔍][setCanvasDims]

```js
lexiconRainbow.setCanvasDims([w,h]) {Number, Number} 
//ex: lexiconRainbow.setCanvasDims(600,200) --> registeres a function to set canvas dimensions
//w stands for width, h stands for height
```

* Registeres a function to set the canvas dimensions. 
* This is not meant to be called by the developer but it actually called by [`lexiconRainbow.GUI`][.GUI].
* :warning: Nothing will happen when you call this, a new function will be registered waiting to be called by some other higher level function.
* In versions of IE, svg cannot be scaled properly, so the aim is to force the position css property of the svg to absolute while forcing the 
browser to scale based on the width and height of the canvas element with the css display property set to "hidden". 

#### lexID [:link:](#lexid-link)[🔍][lexID]

```js
lexiconRainbow.lexID([id]) {String} 
//ex: lexiconRainbow.lexID("someInstance") --> the created svg will have an id attribute of "someInstance"
```

* Gives the created svg the specified id string and returns the `lexiconRainbow` instace.
* If no arguement is given, then returns the id string of the created svg instead.

#### x [:link:](#x-link)[🔍][x]

```js
lexiconRainbow.x([x]) {Number} 
//ex: lexiconRainbow.x(10) --> the created svg will have an origin x-offset of 10 in units of userSpaceOnUse
```

* Not calling this at all implies the default value of x which is 0.
* Sets the origin-x coordinate of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :-1: Setting this effectively shifts the viewBox right or left, potentially concealing other elements. There is no reason to call this method unless
you deliberately want to offset.

#### y [:link:](#y-link)[🔍][y]

```js
lexiconRainbow.y([y]) {Number} 
//ex: lexiconRainbow.y(10) --> the created svg will have an origin y-offset of 10 in units of userSpaceOnUse
```

* Not calling this at all implies the default value of y which is 0.
* Sets the origin-y coordinate of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :-1: Setting this effectively shifts the viewBox down or up, potentially concealing other elements. There is no reason to call this method unless
you deliberately want to offset.

#### w [:link:](#w-link)[🔍][w]

```js
lexiconRainbow.w([w]) {Number} 
//ex: lexiconRainbow.w(600) --> the created svg will have a width of 600 in units of userSpaceOnUse
```

* Not calling this at all implies the default value of w which is 100, probably **NOT** what you want.
* Sets the width of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :+1: You might want to set the width larger than the height something like 600 to 200 or maybe something close to golden ratio (w = ~1.618*h).
In anycase, the text size will be adjusted automatically.

#### h [:link:](#h-link)[🔍][h]

```js
lexiconRainbow.h([h]) {Number} 
//ex: lexiconRainbow.h(200) --> the created svg will have an height of 200 in units of userSpaceOnUse
```

* Not calling this at all implies the default value of h which is 100, probably **NOT** what you want.
* Sets the height of the created svg's [viewBox][w3c-viewbox] attribute to the specified value and returns the `lexiconRainbow` instance.
* :+1: You might want to set the width larger than the height something like 600 to 200 or maybe something close to golden ratio (w = ~1.618*h).
In anycase, the text size will be adjusted automatically.

#### sW [:link:](#sw-link)[🔍][sW]

```js
lexiconRainbow.sW([styleWidth]) {String|Number} 
//ex: lexiconRainbow.sW("1000px") --> the created svg will have a viewport width of 1000 pixels
```

* Not calling this at all implies the default value of sW which is "100px", probably **NOT** what you want.
* Specifying a number is assumed to indicate pixels as units.
* Sets the viewport width of the created svg to the specified value and returns the `lexiconRainbow` instance.
* :+1: Keep the aspect ratio same as your specified w and h values. For instance, if you have a width of 1000 and a height of 500
and you specified sW to be "400px", then make sure your sH is set to "200px". Deviating from this ratio too much will eventually
distort the image as the [preserveAspectRatio][w3c-preserveAspectRatio] is always set to "none".

#### sH [:link:](#sh-link)[🔍][sH]

```js
lexiconRainbow.sH([styleHeight]) {String|Number} 
//ex: lexiconRainbow.sH("400px") --> the created svg will have a viewport height of 400 pixels
```

* Not calling this at all implies the default value of sH which is "100px", probably **NOT** what you want.
* Specifying a number is assumed to indicate pixels as units.
* Sets the viewport height of the created svg to the specified value and returns the `lexiconRainbow` instance.
* :+1: Keep the aspect ratio same as your specified w and h values. For instance, if you have a width of 1000 and a height of 500
and you specified sW to be "400px", then make sure your sH is set to "200px". Deviating from this ratio too much will eventually
distort the image as the [preserveAspectRatio][w3c-preserveAspectRatio] is always set to "none".

#### position [:link:](#position-link)[🔍][position]

```js
lexiconRainbow.position([CSSposition]) {String} 
//ex: lexiconRainbow.position("absolute") --> the created svg will have a CSS position property of 'absolute'
```

* Defaults to "relative".
* Sets the CSS position property of the created svg to the specified string and returns the `lexiconRainbow` instance.

#### color [:link:](#color-link)[🔍][color]

```js
lexiconRainbow.color([colorName]) {String} 
//ex: lexiconRainbow.color("LightRed") --> the created svg will have a background rectangle color of 'LightRed'
```

* Defaults to "DimGray".
* Sets the fill attribute of the created svg rect to the specified string and returns the `lexiconRainbow` instance.
* :-1: The background rectangle is hidden by default in lexicon-rainbow. It covers the area behind the plotted elements.
The method exist to keep methods similar with other lexicon modules.

#### colorScale [:link:](#colorscale-link)[🔍][colorscale]

```js
lexiconRainbow.colorScale([scaleFunction]) {Function} 
//ex: lexiconRainbow.colorScale(function(i){return ["#000000","#a00500",#05a000,#0005a0][i % 4]})
//registers a new function that returns color from an ordinal scale
```

* Defaults to  `d3.scaleOrdinal(d3.schemeCategory20)`.
* This is used when the user does not provide any color input.

#### opacity [:link:](#opacity-link)[🔍][opacity]

```js
lexiconRainbow.opacity([opacity]) {String|Number} 
//ex: lexiconRainbow.opacity(0.7) --> the created svg will have a background rectangle opacity of '0.7'
```

* Defaults to 0.
* Sets the fill-opacity attribute of the created svg rect to the specified string or number and returns the `lexiconRainbow` instance.
* :-1: The background rectangle is hidden by default in lexicon-rainbow. It covers the area behind the plotted elements.
The method exist to keep methods similar with other lexicon modules.

#### container [:link:](#container-link)[🔍][container]

```js
lexiconRainbow.container([CSS-SelectorString|Node]) {String|Object} 
//ex: lexiconRainbow.container("#myDiv")
//the created svg will be inserted as the lastChild (at the moment when lexicon.append is called)
//of a flow content element with the id of "myDiv"
```

* Defaults to `document.body`.
* Sets the `parentElement` of the created svg to the specified string or object and returns the `lexiconRainbow` instance.
* :+1: You do not want to leave this option default. 
Always specify a container either with the form of a [CSS selector][w3c-cssSelector] or node reference.

#### sTop [:link:](#stop-link)[🔍][stop]

```js
lexiconRainbow.sTop([Length in CSS units]) {String} 
//ex: lexiconRainbow.sTop("100px") --> the created svg will have a css top property of 100px.
```

* Defaults to `0px`.
* Sets the css top property of the created svg to the specified string and returns the `lexiconRainbow` instance.

#### sLeft [:link:](#sleft-link)[🔍][sleft]

```js
lexiconRainbow.sLeft([Length in CSS units]) {String} 
//ex: lexiconRainbow.sLeft("100px") --> the created svg will have a css left property of 100px.
```

* Defaults to `0px`.
* Sets the css left property of the created svg to the specified string and returns the `lexiconRainbow` instance.

#### sMargin [:link:](#smargin-link)[🔍][smargin]

```js
lexiconRainbow.sMargin([Length in CSS units]) {String} 
//ex: lexiconRainbow.sLeft("100px 50px")
//the created svg will have a css margin-top/bottom property of 100px and margin-left/right property of 50px.
```

* Defaults to `0px`.
* Sets the css margin property of the created svg to the specified string and returns the `lexiconRainbow` instance.

#### input [:link:](#input-link)[🔍][input]

```js
lexiconRainbow.input([Input]) {Object} 
//ex: 
//var sample = {ordinal:[...],linear:[...]};
//lexiconRainbow.input(sample);
//the created svg will plot the data specified in the input object.
```

* Defaults to `undefined`.
* :+1: This is one of the core methods of the library. LexiconRainbow instance does **NOT** mutate the object that 
is passed via `.input` method. But if you change the input object, then you need to recall `.render` to reflect these changes. 

#### handleEvent [:link:](#handleevent-link)[🔍][handleevent]

```js
lexiconRainbow.handleEvent([functionRef]) {function} 
/*ex: 
var handleEvent = function(data,type,eventType){
	if(eventType !== "mouseover"){return}
	console.log("interval "+data.index+" of "+data.item);
};
lexiconRainbow.handleEvent(handleEvent);
*/
//the lexiconRainbow instace will pass data to the specified function.
```

* Defaults to `(function(){})` with this bound to the lexiconRainbow instance.
* Sets the handleEvent function with `this` bound to the **lexiconRainbow instance** and returns the instance.
* :+1: You bind only single function to the lexiconRainbow instance which handles all event types and data
handled to it. Check the table below for **when** and **what arguments** are passed. `linearID` and `ordinalID`
are internal variables and refer to the index of the current ordinal/linear data object. Do not forget that
`d3.event.type` is the native DOM `event.type`:
<table>
	<thead>
		<tr>
			<th><h3>when</h3></th>
			<th colspan="3"><h3>arguments</h3></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th></th>
			<th>data (Object)</th>
			<th>type (Proprietary String)</th>
			<th>eventType (DOM event)</th>
		</tr>
		<tr>
			<td>The first time render function is called</td>
			<td>
				<pre>{
linear: _input_.linear[linearID],
ordinal: _input_.ordinal[ordinalID]
}</pre>
			</td>
			<td>"onload"</td>
			<td>null</td>
		</tr>
		<tr>
			<td>User hovers on an item on the ordinal scale</td>
			<td>
				<pre>{
name: d<sup>*</sup>,
item: _input_.linear[linearID].categories[d]
}</pre>
			</td>
			<td>"onpick"</td>
			<td>d3.event.type</td>
		</tr>
		<tr>
			<td>None of the categories in the ordinal scale matches the ones in the linear scale: nothing to show.</td>
			<td>null</td>
			<td>"onmismatch"</td>
			<td>null</td>
		</tr>
		<tr>
			<td>User hovers on a link/ribbon</td>
			<td>
				<pre>{
name: names[ii]<sup>**</sup>,
item: dd<sup>***</sup>,
parent: _input_.linear[linearID].categories[d],
index: ii<sup>**</sup>
}</pre>
			</td>
			<td>"onpick"</td>
			<td>event.type<sup>****</sup></td>
		</tr>
		<tr>
			<td>Either through the GUI or programmatic access the ordinal or the linear data object is changed</td>
			<td>
				<pre>_input_.linear[linearID]
or
_input_.ordinal[ordinalID]</pre>
			</td>
			<td>
				<pre>"onrenderLinear" 
or
"onrenderOrdinal"</pre>
			</td>
			<td>null</td>
		</tr>
	</tbody>
</table>

<sup>
*: d is the 'key' within the category, it is the name you see on the plot.<br>
**: name of the interval, if specified, otherwise undefined`<br>
***: value of the current interval<br>
****: For both mobile and desktop, you will receive "onmouseover". 
For mouseout, in desktop you will receive "mouseout" and mobile, you will receive "touchend".
</sup>

#### dispersion [:link:](#dispersion-link)[🔍][dispersion]

```js
lexiconRainbow.dispersion([number]) {Number} 
//ex: lexiconRainbow.dispersion(0) --> sharp-ended links for single values
```

* Defaults to 0.01 (means 0.01 * width of the viewbox in **userSpaceOnUse**).
* :+1: This controls how spread the links will be for intervals that are **NOT** a range.
For instance if a link goes to 3, by default it will be spread on both sides about
0.01*width of the viewbox. Making dispersion 0 results in an example like
[here][http://bl.ocks.org/ibrahimtanyalcin/3ec054bc6dc485c46631c5ef1d28dbe9] .

#### enableOnPick [:link:](#enableonpick-link)[🔍][enableonpick]

```js
lexiconRainbow.enableOnPick([bool]) {Boolean|String|Number|Object|Function} 
//ex: lexiconRainbow.enableOnPick(false) --> no "onpick" event
```

* Defaults to `true`.
* Any truthy value is considered to be `true`.
* :+1: In internet explorer or firefox, when there are too many links going out from
1 item, you might have flicker issues. Also a lot of path string interpolations can be 
expensive so you might want to turn this off. If you are asking what is an "onpick"
event, look [here][handleevent].

#### forceStyle [:link:](#forcestyle-link)[🔍][forcestyle]

```js
lexiconRainbow.forceStyle()
//ex: lexiconRainbow.forceStyle() --> gives a default look to the plot and returns the lexiconRainbow instance
```

* This method is **NOT** called by default. .
* If called with any argument, appends a style node to the `document.head` with the attribute `data-lexType='lexiconRainbow'`.
* It is a collection of styles and a font-family that I think fits the project. The style is appended only **ONCE**,
if it has been appended previously, it is not added again.

#### append [:link:](#append-link)[🔍][append]

```js
lexiconRainbow.append([bool]) {Boolean|String|Number|Object|Function} 
//ex: lexiconRainbow.append(true) --> gives a default look to the plot and returns the lexiconRainbow instance
```

* This method is **NOT** called by default but you **MUST** call it at some point before calling `render`.
* Any truthy value passed will insert before the svg an invisible canvas to help SVG scaling
because in internet explorer SVGs are not scaled properly as the window innerWidth and innerHeight changes.
Therefore passing in a truthy argument is not necessary in Firefox, Safari or Chrome.
* :+1: Call this method **AFTER** any callable methods and **BEFORE** the `render` method.

#### render [:link:](#render-link)[🔍][render]

```js
lexiconRainbow.render() 
//ex: lexiconRainbow.render() --> renders the scene and returns undefined
```

* Renders the scene and returns **undefined**.
* :+1: Call this method **LAST**.
* :+1: If the underlying input object changes, you can call it one more time to reflect upon the changes.

#### renderOrdinal [:link:](#renderordinal-link)[🔍][renderordinal]

```js
lexiconRainbow.renderOrdinal(ordinalData,container,scale)  {[..],[..],[..]}
```

* Renders the objects in the ordinal scale and returns undefined.
* ordinalData is a sorted list of category names in the ordinal scale,
container is a **d3 selection** and scale is a array with two values:
lower bound and upper bound of the domain in floats or integers.
* :warning: This method is **NOT** meant to be called by the developer but rather documented for completeness. 
It is called by the `render` method.

#### renderSolidCurve [:link:](#rendersolidcurve-link)[🔍][rendersolidcurve]

```js
lexiconRainbow.renderSolidCurve(ordinalData,container,scale)  {[..],[..],[..]}
```

* Renders the objects in the linear scale (the links/ribbons) and returns undefined.
* ordinalData is a sorted list of category names in the ordinal scale,
container is a **d3 selection** and scale is a array with two values:
lower bound and upper bound of the domain in floats or integers.
* :warning: This method is **NOT** meant to be called by the developer but rather documented for completeness. 
It is called by the `render` method.

#### unwarp [:link:](#unwarp-link)[🔍][unwarp]

```js
//create instance
window.someInstance = new LexiconRainbow;
//render and do something with it
someInstance...render();
//when you are done, start a fadeout animation and delete the object in the end.
someInstance.unwarp(function(){delete window.someInstance}) {Function}
```

* Fades away the plotted svg and removes it in the end. If a function or a function reference is passed, 
that function is invoked at the 'end' event of the transition.
* :+1: Beware that this only removes the svg and not the object that created it (the lexiconRainbow instance).
Thus, if you store the instance as a property of another object, make sure you delete it later as shown 
in the example. Also make sure that the hosting object is not frozen or its property descriptor set to
`configurable: false`. Alternatively if you stored the instance inside a variable, make sure it is not
observable anymore.

#### GUI [:link:](#gui-link)[🔍][gui]

```js
lexiconRainbow.GUI([Bool[,Offset]]) {Bool|String,{x:..,y:..,w:..,h:..}}
```

* If `true` is passed then shows the GUI which is the default view and returns the lexiconRainbow instance.
If `false` is passed then removes the GUI and returns the lexiconRainbow instance. If the first argument is
truthy **AND** a string such as "rgb(x,y,z)"/"rgba(x,y,z,a)"/"#xxyyzz"/"LightRed", then the color of the GUI
is set to the specified string value if possible and then fadedin if previously was hidden.
* :+1: If you want to have an idea of how the plot looks without a GUI, have a look at the second plot of
[this](http://bl.ocks.org/ibrahimtanyalcin/2e478e178470c385656a90d3a4629220) example. If you want to change
the area that is shown without the GUI, you can pass an optional object that has the keys x,y,w,h which 
stand for origin-x, origin-y, width and height offsets for the viewBox respectively. For instance, 
{x:-50,w:100} enlarges the viewBox from left and right by 50 units in **userSpaceOnUse**. If a key is not present,
then it is assumed to be 0.

### PROGRAMMATIC ACCESS
Sometimes it is desirable to craft predefined buttons to set different views of the input data.
It might be that not every data object inside the ordinal scale works with the current linear scale etc.
In those cases, you can attach the below functions to html buttons or other elements to trigger when
'click' or 'touchend' etc event is dispatched.

#### ordinalG.update [:link:](#ordinalgupdate-link)[🔍][ordinalgupdate]

```js
lexiconRainbow.orginalG.update(4) --> updates the ordinal scale to match the 5th data object.
```

* Updates the ordinal scale and calls the [`render`](#render-link).

#### linearG.update [:link:](#lineargupdate-link)[🔍][lineargupdate]

```js
lexiconRainbow.linearG.update(2) --> updates the linear scale to match the 3rd data object.
```

* Updates the linear scale and calls the [`render`](#render-link). 



[README]: https://github.com/IbrahimTanyalcin/lexicon-rainbow/blob/master/docs/README.md
[LEGEND]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#legends
[QUICSTART]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#api
[GUI]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#anatomy
[MUTAFRAME]: http://deogen2.mutaframe.com/ 
[MINIMAL]: http://bl.ocks.org/ibrahimtanyalcin/6e2e775cb954ecf89e6b379b5fa4c510

[w3c-viewbox]: https://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
[w3c-preserveAspectRatio]: https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
[w3c-cssSelector]: https://www.w3schools.com/cssref/css_selectors.asp

[toggleGUI]: ../dev/lexiconRainbow.d3v4.dev.js#L112
[toggleAxis]: ../dev/lexiconRainbow.d3v4.dev.js#L135
[.GUI]: ../dev/lexiconRainbow.d3v4.dev.js#L2147
[changeScale]: ../dev/lexiconRainbow.d3v4.dev.js#L1763
[append]: ../dev/lexiconRainbow.d3v4.dev.js#L989
[setViewBox]: ../dev/lexiconRainbow.d3v4.dev.js#L145
[setCanvasDims]: ../dev/lexiconRainbow.d3v4.dev.js#L146
[lexID]: ../dev/lexiconRainbow.d3v4.dev.js#L147
[x]: ../dev/lexiconRainbow.d3v4.dev.js#L148
[y]: ../dev/lexiconRainbow.d3v4.dev.js#L149
[w]: ../dev/lexiconRainbow.d3v4.dev.js#L150
[h]: ../dev/lexiconRainbow.d3v4.dev.js#L151
[sW]: ../dev/lexiconRainbow.d3v4.dev.js#L152
[sH]: ../dev/lexiconRainbow.d3v4.dev.js#L153
[position]: ../dev/lexiconRainbow.d3v4.dev.js#L154
[color]: ../dev/lexiconRainbow.d3v4.dev.js#L155
[colorScale]: ../dev/lexiconRainbow.d3v4.dev.js#L156
[opacity]: ../dev/lexiconRainbow.d3v4.dev.js#L157
[container]: ../dev/lexiconRainbow.d3v4.dev.js#L158
[stop]: ../dev/lexiconRainbow.d3v4.dev.js#L159
[sLeft]: ../dev/lexiconRainbow.d3v4.dev.js#L160
[sMargin]: ../dev/lexiconRainbow.d3v4.dev.js#L161
[input]: ../dev/lexiconRainbow.d3v4.dev.js#L162
[handleevent]: ../dev/lexiconRainbow.d3v4.dev.js#L163
[dispersion]: ../dev/lexiconRainbow.d3v4.dev.js#L164
[enableonpick]: ../dev/lexiconRainbow.d3v4.dev.js#L165
[forcestyle]: ../dev/lexiconRainbow.d3v4.dev.js#L168
[append]: ../dev/lexiconRainbow.d3v4.dev.js#L989
[render]: ../dev/lexiconRainbow.d3v4.dev.js#L1071
[renderordinal]: ../dev/lexiconRainbow.d3v4.dev.js#L1086
[rendersolidcurve]: ../dev/lexiconRainbow.d3v4.dev.js#L1281
[unwarp]: ../dev/lexiconRainbow.d3v4.dev.js#L2040
[gui]: ../dev/lexiconRainbow.d3v4.dev.js#L2147
[version]: ../dev/lexiconRainbow.d3v4.dev.js#L2146
[isappended]: ../dev/lexiconRainbow.d3v4.dev.js#L988
[passivesupported]: ../dev/lexiconRainbow.d3v4.dev.js#L2132
[ordinalgupdate]: ../dev/lexiconRainbow.d3v4.dev.js#L1532
[lineargupdate]: ../dev/lexiconRainbow.d3v4.dev.js#L1539


