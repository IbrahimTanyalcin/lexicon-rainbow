# <a id="h1" href="#h1">API REFERENCE </a>

This document describes the methods you can call on the LexiconRainbow instance. Refer to the 
[LEGEND][LEGEND] section of the [README][README] file to have list of abbreviations used in this document.

## QUICSTART
Refer to the [API][QUICSTART] section of the [README][README] to have an idea of a general use case. Just a hint:
* `.append` and `.render` methods are always called **LAST**.
* Look out for the :warning: signs, they usually mark methods that is **NOT** inteded to be called by you but rather documented for completeness.
* Look out for the :+1: signs, they usually point out to something that might worth a try.
* Look out for the :-1: signs, they usually point out to something that might **NOT** be good to try.

## NAVIGATION
* [INPUT DATA STRUCTURE](#input-data-structure) - understand what kind of input to provide
* [PROPERTIES](#properties) - *version*, *isAppended*, feature detection
* [METHODS](#methods) - available methods to call before rendering

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

Each key references an array of **dataObjects** <a id = "what_is_dataobject" href = "#what_is_dataobject"></a>. If a dataObject is under the ordinal key,
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
This also, is a bit more complicated ordinal data object <a id = "str_ordinal_example" href = "#str_ordinal_example"></a>:
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
  * **name** <a id = "str_ordinal_name" href = "#str_ordinal_name"><b>#</b></a>: name of the dataObject, this will appear on the GUI at the top-left.
  ```js
  {
  "ordinal": [
	  {
		  "name": "A Minimal Set",
		  //some other keys..
  ```
  * **categories** <a id = "str_ordinal_categories" href = "#str_ordinal_categories"><b>#</b></a>: an object with keys of the items that will be displayed.
  Each key will be shown on the ordinal scale. The values of these keys are used to **sort** the order the items that will be plotted:
    1. All values are coerced from string to number if possible.
	1. If it is a single value, than this value is used for sorting.
	1. If it is an array, then this array is reduced and THEN sorted. For example, 
	an array with [1,5,[6,9]] is first transformed to [[1,1],[5,5],[6,9]] and finally
	reduced to 1+1+5+5+6+9/6 = 4.5. The resulting value is used for sorting.
	1. If value of the key is an object, then a field with the name 'intervals' is looked
	and previous steps are performed.
  ```js
  {
	  "ordinal": [
		  {
			  "categories": {
				  item1: 5,
				  item2: "5",
				  item3: [5,[5,5]]
				  item4: {
					  intervals: [5,[5,5]],
					  someOtherKey: "someOtherValue"
				  }
			  },
			  //some other keys..
  ```  
  * **colors** <a id = "str_ordinal_colors" href = "#str_ordinal_colors"><b>#</b></a>: Can be a single color name or an array of color names:
    1. If a single color name as string is provided ("LightGray" or "#bb0011" etc.), then the item color,
	ribbon color, and stroke color (when you hover on the item) are set to this value.
	1. If an array is provided and it has a single value then previous step is applied.
	If the array has 2 values, the item and the link colors will be the first value and the stroke color
	will be the last value. 
	1. If the array has 3 values, the item color will be the first value, the 
	link color will be the second and the stroke color will be the last.
	1. If more than 3 colors are provided, then the item color will be the first, the stroke color
	will be the last and the links will have a color of `[1+n%(l-2)]` where n is the link index as
	given in the intervals array and l is the length of the colors array.
  ```js
  {
	  "ordinal": [
		  {
			  "colors": {
				  item1: "#ffffff",
				  item2: "Red",
				  item3: ["Red","Green","Blue"]
				  item4: ["Red","Green","DarkGreen","LightGreen","rgba(0,200,40,0.3)","Blue"]
			  },
			  //some other keys..
  ```  
  * **mode** <a id = "str_ordinal_mode" href = "#str_ordinal_mode"><b>#</b></a>: Controls how the links are organized on the 
  ordinal scale end (the top part of the plot). The default configuration is regardless of whether you have many links
  or not, each link spans the entire length of the item. Using the mode, you can either stack them equally or proportional 
  to their span. You can specify **one of** two values: "stackEqual" or "stack". Let's assume two links:
	
	Link1: [1,4]
	
	Link2: [-5,-3]
	
	1. If the mode is "stack" then link1 will have 1.5 times the span of the link2 (|4-1|/|-3--5|). Their order will be the same 
	as specified in the intervals key of the [correspoding category in the linear dataObject](#str_linear_categories).
	1. If the mode is "stackEqual", then all links will have the same span. Their order will be the same as described as above.
  * **exteding the dataObject** <a id = "str_ordinal_extend" href = "#str_ordinal_extend"><b>#</b></a>: Apart from the key names described in this
  section, you can pretty much add any other property to the dataObject. Some of the [synthetic lexicon-rainbow events](#handleevent-link) allows you
  to access the entire dataObject so that you can make use of the extended properties. For example [here](#str_ordinal_example) the dataObject is
  entended by adding "Info" field.
  
* ### linear dataObjects:
  * **name** <a id = "str_linear_name" href = "#str_linear_name"><b>#</b></a>: name of the dataObject, this will appear on the GUI at the bottom-left.
  ```js
  ],
  "linear": [
	  {
		  "name": "A Linear dataObject",
		  //some other keys..
  ```
  * **categories** <a id = "str_linear_categories" href = "#str_linear_categories"><b>#</b></a>: an object with keys of the <a href="#what_is_item"><b>items</b></a> that will have their links displayed.
  Each key will have links eminating from the correspoding item towards the linear scale. The values inside the 'intervals' key will dictate how the links are drawn:
    1. Within the category key (item1 in the below example), an intervals key is looked.
	1. If the intervals key is provided, its value should be an array of intervals such as:
	[1,[3,6],2]
	1. Single values are treated as arrays. For example [4,[1,3]] is considered same as [[4,4],[1,3]]. (Beware that the **mode** 
	key can change this behavior)
	1. If the value of the intervals key is a single value such as 5, then it is considered to be a single element array
	like [5].
	1. If there is **NO** intervals key inside the category, then the value refers to a **reference**. The reference is the dataObject's index.
	For example if `input.linear[3].categories.someItem` has no 'intervals' key and its value is 2, then it is equivalent to:
	`input.linear[2].categories.someItem`.
	
  A casual example:
  ```js
  ],
	  "linear": [
		  {
			  "categories": {
				  item1: {
					intervals: [5,[3,10],6]
				  }
			  },
			  //some other keys..
  ```  
  A reference:<a href="#what_is_item" id="what_is_item"></a><a href="#what_is_reference" id="what_is_reference"></a>
   ```js
  ],
	  "linear": [
		  .
		  .
		  },
		  {
			  "categories": {
				  item1: "2" //Strings are coerced to number,
					     //2 refers to 'input.linear[2].item1'
			  },
			  //some other keys..
  ```  
  * **domain** <a id = "str_linear_domain" href = "#str_linear_domain"><b>#</b></a>: Specifies the range of the linear scale such as 
  [-5,5] or [0,10]. It must be an array of 2 values: a lower bound and an upper bound.
  ```js
  ],
  "linear": [
	  {
		  "domain": [0,10],
		  //some other keys..
  ```
  * **axis** <a id = "str_linear_axis" href = "#str_linear_axis"><b>#</b></a>: Controls whether you want to show the axis or not
  or have it other than the default color 'AntiqueWhite'.
    1. If an untruthy value is provided then the axis is hidden at the 'end' event of the axis transition.
	1. If a truthy value is provided than it is faded back with the current color.
	1. If a truthy value is provided and the value is a color string such as "Green" or "#ff00ff", then the axis is faded back 
	if hidden previously and the color is transitioned to the specified value.
  ```js
  ],
  "linear": [
	  {
		  "axis": false,
		  //some other keys..
  ```
  * **format** <a id = "str_linear_format" href = "#str_linear_format"><b>#</b></a>: Defines the format of the axis if any. Takes
  the same arguments as d3.format.
  ```js
  ],
  "linear": [
	  {
		  "format": ".3s",
		  //some other keys..
  ```
  * **glyph** <a id = "str_linear_glyph" href = "#str_linear_glyph"><b>#</b></a>: Shows a image on the left hand side of the 
  GUI that describes what the linear scale is showing. You can either specify the path (relative/absolute) of the image or false
  to turn it off.
  ```js
  ],
  "linear": [
	  {
		  "glyph": "./sample.png",
		  //some other keys..
  ```
  * **mode** <a id = "str_linear_mode" href = "#str_linear_mode"><b>#</b></a>: Controls how the links are drawn within the same item ([item?](#what_is_item)).
  2 values can be specified: 'stack' or 'intervalize'. If a truthy value is provided that does not equal to both, then it is considered to be the same as 
  'stack'.
    1. This key can accept either a string or an array.
	1. If the value is a string, then it can take one of 2 values: 'stack' or 'intervalize'.
	1. If the value is 'stack', then the links are taken out of context and placed side by side with respect to the first interval.
	For example if the 'invervals' value of a category is [[1,3],[7,9],[10,11]] and the mode is 'stack', then the values are transformed to
	[[0,2],[2,4],[4,5]]. The first interval is placed at origin (0 by default) and the span of the other intervals (absolute value of difference between first
	and last value) are added to the ending value of the first interval. The order is kept the same. The origin is always 0 meaning that [5,[2,3]]
	is first transformed to [[0,5],[2,3]] and then to [[0,5],[5,6]]. For this option to work, set the [dispersion](#dispersion-link) to 0.
	Mode 'stack' is usefull when you have many positive real numbers such as 46.45.. and you do not want to specify them as [0,46.45] and so on. Take a look
	at this <a href="http://bl.ocks.org/ibrahimtanyalcin/f2067bef081d84b85e3fb077f3272a90"><b>EXAMPLE</b></a>, the votes of Clinton,
	Trump or the cities are written in number primitives rather than arrays.
	1. If the value is 'intervalize' then the links are taken out of context and placed at the origin with their span staying the same. For example 
	[[1,3],[7,9],[10,11]] will be transformed to [[0,2],[0,2],[0,1]]. 
	1. If the value is an array, then the first value of the array is used to set the mode and the last value is used to set the offset. For example if the value is
	['intervalize',100] and the 'invervals' is  [[1,3],[7,9],[10,11]]. Then the final intervals will be [[100,102],[100,102],[100,101]]. Offset can be applied to
	both 'stack' and 'intervalize' and it can be negative or positive.
  ```js
  ],
  "linear": [
	  {
		  "mode": ["stack",20],
		  //some other keys..
  ```	
  * **gMode** <a id = "str_linear_gmode" href = "#str_linear_gmode"><b>#</b></a>: Stands for **global mode**. Similar to [mode](#str_linear_mode) but rather than
  controlling how links are drawn with respect to each other **within** the same [item](#what_is_item), it controls how links are drawn **between** items. 2 values can be 
  provided: 'stack' and 'justify'. If a truthy value is provided that does not equal to both, then it is considered to be the same as 'stack'.
    1. If the value is 'stack', then all intervals of the current [item](#what_is_item) are offset by the previous item. For example take two intervals, [[3,5],[1,2]]
	from item 1 and [[0,1],7] from item 2. If the gMode is 'stack' then the intervals will be converted to [[3,5],[1,2]] (first item --> there is no previous item --> so no change) and 
	[[5,6],12] (all increased by 5). You can combine this with the **'mode'** key to create different layouts.
	1. If the value is 'justify', then your linear [domain](#str_linear_domain) is remapped using:
	```js
		domain.map(function(d,i,a){return i === 0 ? d : a[i-1]+l*abs(d-a[i-1])})
	```
	where `l` is item count and `abs` is the absolute value. So if you have 5 items to show and your domain is [-5,5] then remapped domain will be
	[-5,45]. Then each item's intervals are displayed in its 'offsetted domain'. For instance first item will operate between -5,5, second item
	will operate between 5,15 and so on. So an interval of [0,3] in item1's 'intervals' key will stay unchanged, while if it would belong to item2,
	it would be transformed to [10,13]. You can combine this with the **'mode'** key to create different layouts.
  * **sort** <a id = "str_linear_sort" href = "#str_linear_sort"><b>#</b></a>: Sorts the intervals based on a criteria. **ALWAYS** create a reference
  of your [dataObject](#what_is_dataobject) before you sort, otherwise it will not behave as expected. From [this](http://bl.ocks.org/ibrahimtanyalcin/f2067bef081d84b85e3fb077f3272a90) example:
  ```js
    .
	.
	},
	{
		"domain": [
			0,
			65853516
		],
		"format":".3s",
		"name": "C-states",
		"categories": {
			"Clinton": {intervals:[
					1161167,1338870,4504975,653669,357735,2268839,1367716,
				539260,348526,2189316,2394164,2926441,1382536,
				729547,116454,380494,8753788,897572,235603,
				282830,1877963,266891,189765,3090729,1033126,
				427005,628854,780154,1677928,1995196,485131,
				1071068,177709,284494,2148278,385234,4556124,
				93758,420375,1002106,252525,855373,117458,
				870695,3877868,310676,178573,1981473,1742718,
				188794,55973
			],names:["Arizona","Colorado","Florida","Lowa","Maine","Michigan",
			"Minnesota","Nevada","New Hampshire","North Carolina","Ohio","Pennsylvania",
			"Wisconsin","Alabama","Alaska","Arkansas","California","Connecticut",
			"Delaware","District of Columbia","Georgia","Hawaii","Idaho","Illinois",
			"Indiana","Kansas","Kentucky","Lousiana","Maryland","Massachusetts",
			"Mississippi","Misouri","Montana","Nebraska","New Jersey","New Mexico",
			"New York","North Dakota","Oklahoma","Oregon","Rhode Island","South Carolina",
			"South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
			"West Virginia","Wyoming"]}
		},
		"glyph": "./usFlag.png",
		"mode":"stack",
		"Info": "Clinton - state votes stacked"
	},
	.
	.
  ```
  the above linear [dataObject](#what_is_dataobject) has the actual data and let's say it has an index of 2 (2nd dataObject inside the 'linear' key). 
  If you now want to sort the intervals based on the names, create a reference like below:
  ```js
  .
  .
  },
  {
	"domain": [
		0,
		65853516
	],
	"axis":"DarkSlateGray",
	"format":".3s",
	"name": "C-states-sort (s>)",
	"categories": {
		"Clinton": 2
	},
	"sort":"s>",
	"glyph": "./usFlag.png",
	"mode":"stack",
	"Info": "Clinton - state votes stacked and sorted by increasing alphabetical order"
  },
  .
  .
  ```
  Now `"Clinton":2` refers to `input.linear[2].categories.Clinton`.
  The values for the 'sort' key can be one of the following:
    1. ">": sort ascending based on the last value of the interval ([1,5] > [3,4])
	1. "<": sort descending based on the last value of the interval ([1,5] < [3,4])
	1. "|>|": sort ascending based on the span of the interval ([-1,5] > [1,5])
	1. "|<|": sort descending based on the span of the interval ([-1,5] < [1,5])
	1. "s>": sort ascending based on the 'name' of the interval if any, otherwise do not change the order.
	1. "s<": sort descending based on the 'name' of the interval if any, otherwise do not change the order.
  * **partition**: This is option  is designed to work in conjunction with `"gMode":"justify"`. 
  Creates a rectangular shading behind each item like a table as in [this](http://bl.ocks.org/IbrahimTanyalcin/35d404d513420d84570eb0a418c87856/)
  example. It can take 2 values: 'color' or `true`. Any truthy value that does not equal to 'color' is considered to be
  `true`. A `true` value specifies an alternating banded pattern of light gray and dark gray. If the value is 'color', then the 
  shaded area inherits its color from the [color](#str_ordinal_colors) of the item.
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

#### sTop [:link:](#stop-link)[🔍][sTop]

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
* The lexiconRainbow instance passes 4 arguments to this function: 
  * *data* : an event specific data object that allows to access parts of your main input
  * *type* : a proprietary string that describes the event
  * *event.type* : this is your native `DOMevent.type`
  * *state* : Events are both ways, for instance you can mouseover as well as mouseout from a link. Rather than listening to `event.type`, you can check for this boolean argument which is true if active (mouseover, touchstart etc) or false otherwise.
* :+1: You bind only single function to the lexiconRainbow instance which handles all event types and data
handled to it. Check the table below for **when** and **what arguments** are passed. `linearID` and `ordinalID`
are internal variables and refer to the index of the current ordinal/linear data object. Do not forget that
`d3.event.type` is the native DOM `event.type`.
* :-1: The handleEvent function is designed to have `this` point to the lexiconRainbow instance. So do **NOT** pass an already bound function to it.
<table>
	<thead>
		<tr>
			<th><h3>when</h3></th>
			<th colspan="4"><h3>arguments</h3></th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<th></th>
			<th>data (Object)</th>
			<th>type (Proprietary String)</th>
			<th>eventType (DOM event)</th>
			<th>state (Proprietary Boolean)</th>
		</tr>
		<tr>
			<td>The first time render function is called</td>
			<td>
				<code>{
linear: _input_.linear[linearID],
ordinal: _input_.ordinal[ordinalID]
}</code>
			</td>
			<td>"onload"</td>
			<td>null</td>
			<td>true</td>
		</tr>
		<tr>
			<td>User hovers on an item on the ordinal scale</td>
			<td>
				<code>{
name: d<sup>*</sup>,
item: _input_.linear[linearID].categories[d]
}</code>
			</td>
			<td>"onpick"</td>
			<td>d3.event.type</td>
			<td>true/false</td>
		</tr>
		<tr>
			<td>None of the categories in the ordinal scale matches the ones in the linear scale: nothing to show.</td>
			<td>null</td>
			<td>"onmismatch"</td>
			<td>null</td>
			<td>true</td>
		</tr>
		<tr>
			<td>User hovers on a link/ribbon</td>
			<td>
				<code>{
name: names[ii]<sup>**</sup>,
item: dd<sup>***</sup>,
parent: _input_.linear[linearID].categories[d],
index: ii<sup>**</sup>
}</code>
			</td>
			<td>"onhighlight"</td>
			<td>event.type<sup>****</sup></td>
			<td>true/false</td>
		</tr>
		<tr>
			<td>Either through the GUI or programmatic access the ordinal or the linear data object is changed</td>
			<td>
				<code>_input_.linear[linearID]<br>
or<br>
_input_.ordinal[ordinalID]</code>
			</td>
			<td>
				"onrenderLinear"<br>
or<br>
"onrenderOrdinal"
			</td>
			<td>null</td>
			<td>true</td>
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

And here is a function that you can take and use the bits you care about:

```js
function handleEvent (data,type,eventType,state) {
	switch (type) {
		case "onload":
			/*do some work the first time the instance is rendered,
			state is always true in this case*/
			.
			.
			break;
		case "onhighlight":
			if(state) {
				//do some work when user touches or mouseovers a link
			} else {
				//do some work when user touchends or mouseouts a link
			}
			break;
		case "pick":
			if(state) {
				//do some work when user touches or mouseovers a category
			} else {
				//do some work when user touchends or mouseouts a category
			}
			break;
		case "onrenderLinear":
			/*do some work each time linear dataObject is changed 
			through inbuilt GUI or programmatic access, state
			is always true*/
			.
			.
			break;
		case "onrenderOrdinal":
			/*do some work each time ordinal dataObject is changed 
			through inbuilt GUI or programmatic access, state 
			is always true*/
			.
			.
			break;
		case "mismatch":
			/*do some work when none of the categories in the ordinal 
			dataObject matches the ones in the linear dataObject, 
			so there is nothing to show. The state is always true*/
			.
			.
			break;
	}
}
```

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
//ex: lexiconRainbow.enableOnPick('noLineAnim') --> "onpick" event 
//without drawing lines around the links
```

* Defaults to `true`.
* Any truthy value is considered to be `true`.
* A special case "noLineAnim" allows the firing of the "onpick" event without line interpolations (taxing on the CPU).
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

#### GUI [:link:](#gui-link)[🔍][gui_code]

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

#### shapeRendering [:link:](#shaperendering-link)[🔍][shaperendering]

```js
lexiconRainbow.shapeRendering("crispEdges") 
//ex: lexiconRainbow.shapeRendering("auto") --> sets the shape-rendering attribute 
//if the lexiconRainbow instance is not yet appended
```

* Sets the shape-rendering attribute of the rendered svg if the lexiconRainbow instance is not yet appended (`.append` not called).
* If no arguments supplied, returns the current shapeRendering which defaults to "auto".
* If the lexiconRainbow instance has already been rendered and this method is called with an argument, throws an error.
* :+1: If you are using straight lines in your project like this or this example, then set it to "crispEdges".

### PROGRAMMATIC ACCESS
Sometimes it is desirable to craft predefined buttons to set different views of the input data.
It might be that not every data object inside the ordinal scale works with the current linear scale etc.
In those cases, you can attach the below functions to html buttons or other elements to trigger when
'click' or 'touchend' etc event is dispatched.

#### lexiconRainbow.update [:link:](#lexiconrainbowupdate-link)[🔍][lexiconrainbowupdate]

```js
lexiconRainbow.update(type,count) {String, Number} 
//ex: lexiconRainbow.update('linear',2) --> updates the linear scale to match the 3rd data object.
//ex: lexiconRainbow.update('ordinal',5) --> updates the ordinal scale to match the 6th data object.
```

* Calls one of the below methods depending on the `type` argument and fires either
`onrenderLinear` or `onrenderOrdinal` event.
* :+1: Use this method for updating unless you do not want to fire the associated event.

#### ordinalG.update [:link:](#ordinalgupdate-link)[🔍][ordinalgupdate]

```js
lexiconRainbow.orginalG.update(4) --> updates the ordinal scale to match the 5th data object.
```

* Updates the ordinal scale and calls the [`render`](#render-link). Does **NOT** fire the `onrenderOrdinal` event.
* :warning: This method is **NOT** meant to be called by the developer but rather documented for completeness. Do not
call this method unless you deliberately do not want to fire any events. 

#### linearG.update [:link:](#lineargupdate-link)[🔍][lineargupdate]

```js
lexiconRainbow.linearG.update(2) --> updates the linear scale to match the 3rd data object.
```

* Updates the linear scale and calls the [`render`](#render-link). Does **NOT** fire the `onrenderLinear` event.
* :warning: This method is **NOT** meant to be called by the developer but rather documented for completeness. Do not
call this method unless you deliberately do not want to fire any events. 


[README]: https://github.com/IbrahimTanyalcin/lexicon-rainbow/blob/master/docs/README.md
[LEGEND]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#legends
[QUICSTART]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#api
[GUI]: https://github.com/IbrahimTanyalcin/lexicon-rainbow#anatomy
[MUTAFRAME]: http://deogen2.mutaframe.com/ 
[MINIMAL]: http://bl.ocks.org/ibrahimtanyalcin/6e2e775cb954ecf89e6b379b5fa4c510

[w3c-viewbox]: https://www.w3.org/TR/SVG/coords.html#ViewBoxAttribute
[w3c-preserveAspectRatio]: https://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
[w3c-cssSelector]: https://www.w3schools.com/cssref/css_selectors.asp

[str_ordinal]: #ordinal-dataobjects
[str_linear]: #linear-dataobjects
[str_ordinal_name]: #str_ordinal_name
[str_ordinal_categories]: #str_ordinal_categories
[str_ordinal_colors]: #str_ordinal_colors
[str_ordinal_mode]: #str_ordinal_mode
[str_ordinal_extend]: #str_ordinal_extend
[str_linear_name]: #str_linear_name
[str_linear_categories]: #str_linear_categories
[str_linear_domain]: #str_linear_domain
[str_linear_axis]: #str_linear_axis
[str_linear_format]: #str_linear_format
[str_linear_glyph]: #str_linear_glyph
[str_linear_mode]: #str_linear_mode
[str_linear_gmode]: #str_linear_gmode

[what_is_item]:#what_is_item
[what_is_reference]:#what_is_reference

[toggleGUI]: ../dev/lexiconRainbow.d3v4.dev.js#L116
[toggleAxis]: ../dev/lexiconRainbow.d3v4.dev.js#L139
[.GUI]: ../dev/lexiconRainbow.d3v4.dev.js#L2149
[changeScale]: ../dev/lexiconRainbow.d3v4.dev.js#L1750
[append]: ../dev/lexiconRainbow.d3v4.dev.js#L993
[setViewBox]: ../dev/lexiconRainbow.d3v4.dev.js#L149
[setCanvasDims]: ../dev/lexiconRainbow.d3v4.dev.js#L150
[lexID]: ../dev/lexiconRainbow.d3v4.dev.js#L151
[x]: ../dev/lexiconRainbow.d3v4.dev.js#L152
[y]: ../dev/lexiconRainbow.d3v4.dev.js#L153
[w]: ../dev/lexiconRainbow.d3v4.dev.js#L154
[h]: ../dev/lexiconRainbow.d3v4.dev.js#L155
[sW]: ../dev/lexiconRainbow.d3v4.dev.js#L156
[sH]: ../dev/lexiconRainbow.d3v4.dev.js#L157
[position]: ../dev/lexiconRainbow.d3v4.dev.js#L158
[color]: ../dev/lexiconRainbow.d3v4.dev.js#L159
[colorScale]: ../dev/lexiconRainbow.d3v4.dev.js#L160
[opacity]: ../dev/lexiconRainbow.d3v4.dev.js#L161
[container]: ../dev/lexiconRainbow.d3v4.dev.js#L162
[stop]: ../dev/lexiconRainbow.d3v4.dev.js#L163
[sLeft]: ../dev/lexiconRainbow.d3v4.dev.js#L164
[sMargin]: ../dev/lexiconRainbow.d3v4.dev.js#L165
[input]: ../dev/lexiconRainbow.d3v4.dev.js#L166
[handleevent]: ../dev/lexiconRainbow.d3v4.dev.js#L167
[dispersion]: ../dev/lexiconRainbow.d3v4.dev.js#L168
[enableonpick]: ../dev/lexiconRainbow.d3v4.dev.js#L169
[forcestyle]: ../dev/lexiconRainbow.d3v4.dev.js#L172
[render]: ../dev/lexiconRainbow.d3v4.dev.js#L1076
[renderordinal]: ../dev/lexiconRainbow.d3v4.dev.js#L1091
[rendersolidcurve]: ../dev/lexiconRainbow.d3v4.dev.js#L1268
[unwarp]: ../dev/lexiconRainbow.d3v4.dev.js#L2027
[gui_code]: ../dev/lexiconRainbow.d3v4.dev.js#L2149
[version]: ../dev/lexiconRainbow.d3v4.dev.js#L2133
[isappended]: ../dev/lexiconRainbow.d3v4.dev.js#L992
[passivesupported]: ../dev/lexiconRainbow.d3v4.dev.js#L2119
[ordinalgupdate]: ../dev/lexiconRainbow.d3v4.dev.js#L1519
[lineargupdate]: ../dev/lexiconRainbow.d3v4.dev.js#L1526
[shaperendering]: ../dev/lexiconRainbow.d3v4.dev.js#L2134
[lexiconrainbowupdate]: ../dev/lexiconRainbow.d3v4.dev.js#L2144

