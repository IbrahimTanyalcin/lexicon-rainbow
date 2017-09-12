
!function(){
	////////////////////////////////////////////////////////////////////
	/////////////////////////DEFINE SOME DATA///////////////////////////
	////////////////////////////////////////////////////////////////////

	function smallToLarge(a,b){return a-b}; //used for sorting

	var AAColors = {R:"#8694fa",K:"#baaafc",E:"#f93333",D:"#fb7979",I:"#ffff4f",L:"#ffff79",V:"#ffffab",A:"#ffffc9",C:"#e3f9ad",H:"#d5f6fb",M:"#c3ed27",N:"#ee72a7",Q:"#f9c3e3",F:"#c7c88a",Y:"#7dafb9",W:"#85b0cd",S:"#ca9ec8",T:"#f0e4ef",G:"#c0c0c0",P:"#f1f2f3"},
		AALetters = Object.keys(AAColors).sort(),
		//protein 1 - 1+Math.random()*5 => at least 1 element
		protein1 = Array.apply(null,Array(1000)).map(function(d,i){return AALetters[Math.random()*20 << 0]}),//random sequence
		protein1_benign = Array.apply(null,Array(1+Math.random()*100 << 0)).map(function(){return Math.random()*1000 << 0}).sort(smallToLarge),//random benign mutations
		protein1_deleterious = Array.apply(null,Array(1+Math.random()*100 << 0)).map(function(){return Math.random()*1000 << 0}).sort(smallToLarge),//random deleterious mutations
		//protein 2
		protein2 = Array.apply(null,Array(500)).map(function(d,i){return AALetters[Math.random()*20 << 0]}),//random sequence
		protein2_benign = Array.apply(null,Array(1+Math.random()*50 << 0)).map(function(){return Math.random()*500 << 0}).sort(smallToLarge),//random benign mutations
		protein2_deleterious = Array.apply(null,Array(1+Math.random()*50 << 0)).map(function(){return Math.random()*500 << 0}).sort(smallToLarge),//random deleterious mutations
		//protein 3 
		protein3 = Array.apply(null,Array(50)).map(function(d,i){return AALetters[Math.random()*20 << 0]}),//random sequence
		protein3_benign = Array.apply(null,Array(1+Math.random()*5 << 0)).map(function(){return Math.random()*50 << 0}).sort(smallToLarge),//random benign mutations
		protein3_deleterious = Array.apply(null,Array(1+Math.random()*5 << 0)).map(function(){return Math.random()*50 << 0}).sort(smallToLarge);//random deleterious mutations

	////////////////////////////////////////////////////////////////////
	/////////////////////////////THE DATASET////////////////////////////
	////////////////////////////////////////////////////////////////////
	
	var sample = {
		"ordinal": [
			{
				"name": "Domains",
				"categories": {
					"Domain-X": 1,
					"Domain-Y": 2,
					"Domain-Z": 3,
					"Domain-T": 4,
					"Domain-\u03b1":5,
					"Domain-\u03b2":6
				}
			},
			{
				"name": "Mutations",
				"categories": {
					"Deleterious": 2,
					"Benign": 1,
				},
				"colors":{
					"Benign":["Green","orange"],
					"Deleterious":["Red","Orange"]
				},
				"mode":"stackEqual"
			},
			{
				"name": "Sequence-1",
				"categories": {
					"Protein-1": 1
				},
				"colors":{
					"Protein-1": Array.prototype.concat.apply(["orange"],[protein1.map(function(d,i){return AAColors[d]}),["orange"]])
				},
				"mode":"stackEqual"
			},
			{
				"name": "Sequence-2",
				"categories": {
					"Protein-2": 1
				},
				"colors":{
					"Protein-2": Array.prototype.concat.apply(["orange"],[protein2.map(function(d,i){return AAColors[d]}),["orange"]])
				},
				"mode":"stackEqual"
			},
			{
				"name": "Sequence-3",
				"categories": {
					"Protein-3": 1
				},
				"colors":{
					"Protein-3": Array.prototype.concat.apply(["orange"],[protein3.map(function(d,i){return AAColors[d]}),["orange"]])
				},
				"mode":"stackEqual"
			}
		],
		"linear": [
			{
				"glyph":"//cdn.rawgit.com/IbrahimTanyalcin/lexicon-rainbow/726908df/img/protein1.jpeg",
				"domain": [0,1000],
				"name": "Protein-1",
				"categories": {
					"Domain-X": {intervals:[[250,350]],names:["Domain-X"]},
					"Domain-Y": {intervals:[[400,700]],names:["Domain-Y"]},
					"Protein-1": {intervals:protein1.map(function(d,i){return [i,i+1]}),names:protein1.map(function(d,i){return d+i})},
					"Benign": {intervals:protein1_benign},
					"Deleterious":{intervals:protein1_deleterious}
				}
			},
			{
				"glyph":"//cdn.rawgit.com/IbrahimTanyalcin/lexicon-rainbow/726908df/img/protein2.jpg",
				"domain": [0,500],
				"name": "Protein-2",
				"categories": {
					"Domain-Z": {intervals:[[50,150]],names:["Domain-Z"]},
					"Domain-T": {intervals:[[300,500]],names:["Domain-T"]},
					"Protein-2": {intervals:protein2.map(function(d,i){return [i,i+1]}),names:protein2.map(function(d,i){return d+i})},
					"Benign": {intervals:protein2_benign},
					"Deleterious":{intervals:protein2_deleterious}
				}
			},
			{
				"glyph":"//cdn.rawgit.com/IbrahimTanyalcin/lexicon-rainbow/726908df/img/protein3.png",
				"domain": [0,50],
				"name": "Protein-3",
				"categories": {
					"Domain-\u03b1": {intervals:[[10,20]],names:["Domain-\u03b1"]},
					"Domain-\u03b2": {intervals:[[30,50]],names:["Domain-\u03b2"]},
					"Protein-3": {intervals:protein3.map(function(d,i){return [i,i+1]}),names:protein3.map(function(d,i){return d+i})},
					"Benign": {intervals:protein3_benign},
					"Deleterious":{intervals:protein3_deleterious}
				}
			}
		]
	};

	////////////////////////////////////////////////////////////////////
	/////////////////////////CREATE AN INSTANCE/////////////////////////
	////////////////////////////////////////////////////////////////////
	(new LexiconRainbow)
	.container(rootDiv)
	.forceStyle()
	.w(600)
	.h(200)
	.sW("90%")
	.sH("auto")
	.position("relative")
	.sTop("0px")
	.sLeft("0px")
	.sMargin("100px auto 0px auto")
	.lexID("lexiconRainbow")
	.input(sample)
	.enableOnPick("noLineAnim")
	.shapeRendering("crispEdges")
	.dispersion(0.003)
	.append(true)
	.render();
}()
