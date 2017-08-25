# <a id="h1" href="#h1">Lexicon-Rainbow [:rainbow:](MAIN)</a>
<br/>
[<img src="./examples/AminoAcids/aminoAcids.jpg">][MAIN]  
[<img src="./examples/Minimal/minimal.jpg">][MAIN] 
[<img src="./examples/RandomDataset/randomDataset.jpg">][MAIN] 
[<img src="./examples/ServerDownTime/serverDownTime.jpg">][MAIN] 
[<img src="./examples/USvotes/USvotes.jpg">][MAIN] 

### Legends
Phrase | Definition
-------|-----------
:link: |link to related doc, if not then *this*
:mag:  |link to script
xyz.(a)|single argument *a*
xyz.(a[,b[,c]])|optinal arguments *b* and *c*
{x} | a variable *y* with typeof *y* === "x"

## What is it ?
[Lexicon-rainbow](#h1) is a library for visualizing combination of an ordinal scale (top) and a linear scale (bottom). Suppose you have items sorted based on some criteria at the top. From each item, you can define a link (ribbon, arm or whatever name you fancy) that goes to the linear scale. This link can be an integer, float or a range. You can specify as many ordinal and linear scales as you like. Then you either use the inbuit GUI or programmatic access (```lexiconRainbow.ordinalG.update({number})```) to create new *views* of your data.

## Which browsers ? 
Lexicon-rainbow is tested with ie11, safari, chrome and firefox. It should also work on ie10, however svg related bugs maybe present. Report them @IbrahimTanyalcin

## Which version of Javascript ? 
It is written in ES5. You do __NOT__ need Babel and Browserify.

## Which dependencies ? 
There are 2 versions of lexicon-rainbow, one compatible with d3.v3 **(3.5.17)** and the other with
d3.v4 (**latest**).

[MAIN]: https://github.com/IbrahimTanyalcin/LEXICON