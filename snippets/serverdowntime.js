
!function(){
	////////////////////////////////////////////////////////////////////
	//////////////////DAYS OF 2016 BUNDLED INTO WEEKS///////////////////
	////////////////////////////////////////////////////////////////////
	var interval = 24*60*60*1000;
	var start = (new Date(2016,0,1)).getTime();
	var days = [],
		weeks = [[]],
		hours = Array.apply(null,Array(24)).map(function(){return 1});
	for (var i = 0,D,d,W = weeks[weeks.length-1];i<=365;++i){//2016 leap day
		D = new Date(start+i*interval);
		d = D.toDateString();
		days.push(d);
		D.getDay() === 1 && W.length ? (weeks.push([]),W = weeks[weeks.length-1]) : void(0);
		W.push(d);
	}
	////////////////////////////////////////////////////////////////////
	/////////////////////////MAIN DATA STRUCTURE////////////////////////
	////////////////////////////////////////////////////////////////////
	var output = {
		ordinal:[],
		linear:[
			{
				axis:"lightgray",
				name: "Days",
				mode: "stack",
				gMode: "justify",
				domain: [0,24],
				glyph: "./server.png",
				categories:{}
			}
		]
	};
	(function(ordinal,linearCategories){
		weeks.forEach(function(d,i){
			ordinal[i] = {
				name: getDayName(d[0])+"-"+getDayName(d[d.length-1]),
				mode: "stackEqual",
				categories:(function(){
					return Object.defineProperties(
						{},
						d.reduce(function(ac,dd,ii){
							ac[getDayName(dd)] = {
								value: ii,
								configurable: true, 
								writable: true,
								enumerable: true
							}
							return ac;
						},{})
					)
				})(),
				colors: (function(){
					return Object.defineProperties(
						{},
						d.reduce(function(ac,dd,ii){
							var strokeNFill = ii & 1 ? ["Gray"] : ["Black"];
							ac[getDayName(dd)] = {
								value: Array.prototype.concat.apply(
									strokeNFill,
									[hours.map(function(){return Math.random()<0.25 ? "Crimson" : "Lime"}),strokeNFill]
								),
								configurable: true, 
								writable: true,
								enumerable: true
							}
							return ac;
						},{})
					)
				})()
			}
		})
		days.forEach(function(d,i){
			Object.defineProperty(
				linearCategories,
				getDayName(d),
				{
					value: {intervals: hours.slice()},
					configurable: true, 
					writable: true,
					enumerable: true
				}
			)
		})
		function getDayName (dateString){
			return dateString.split(" ").slice(0,-1).join(" ");
		}
	})(output.ordinal,output.linear[0].categories);
	/////////////////////////////////////////////////////////////////////////////
	//3 INSTANCES ON THE SAME DATA, 1 w/ GUI, 1 w/o GUI and 1 w/ CUSTOM VIEWBOX//
	/////////////////////////////////////////////////////////////////////////////
	Array.apply(null,Array(3)).forEach(function(d,i){
		(new LexiconRainbow)
		.container(rootDiv)
		.forceStyle()
		.GUI(
			i % 3 ? false : true,
			[undefined,undefined,{x:-20,w:20,h:-120}][i]
		)
		.w(600)
		.h(200)
		.sW("1000px")
		.sH("auto")
		.position("relative")
		.sTop("0px")
		.sLeft("0px")
		.sMargin("0px auto 0px auto")
		.lexID("lexiconRainbow"+i)
		.input(output)
		.append(true)
		.render();
	})
}()
