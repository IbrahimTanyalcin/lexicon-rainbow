(function (root,factory) {
	if(typeof root.window === "object" || root.document === "object" ) {
	} else {
		var __f = function(){};
		var __o = {};
		root.window = {
			requestAnimationFrame: __f,
			addEventListener: __f,
			document: {
				getElementById: __f,
				querySelector: __f,
				querySelectorAll: __f,
				elementFromPoint: __f,
				head: __o,
				body: __o
			}
		}
	}
	if (typeof define === "function" && define.amd) {
		define(["d3"], factory);
	} else if (typeof exports === "object") {
		module.exports = factory(require("d3"),root.window,root.window.document);
	} else {
		root.LexiconRainbow = factory(root.d3,root,root.document);
    }
}(this, function (d3,window,document){
	function LexiconRainbow () {
		var documentById = document.getElementById.bind(document);
		var documentQuery = document.querySelector.bind(document);
		var ceil = Math.ceil;
		var floor = Math.floor;
		var round = Math.round;
		var abs = Math.abs;
		var max = Math.max;
		var min = Math.min;
		var ID = ID || "lexicon_"+round(Math.random()*100);
		var viewport = undefined;
		var viewportBackground = undefined;
		var viewportFront = undefined;
		var viewportTemporary = undefined;
		var viewportOrdinal = undefined;
		var viewportLinear = undefined;
		var gStackObj = {};
		var gModeCondition = undefined;
		var scaleInTransition = false;
		var scaleTimeout = false;
		var _input_ = undefined;
		var attrX = attrX || 0;
		var attrY = attrY || 0;
		var attrW = attrW || 100;
		var attrH = attrH || 100;
		var styleW = styleW || "100px";
		var styleH = styleH || "100px";
		var styleMargin = styleMargin || "0px";
		var bColor = bColor || "DimGray";
		var bOpacity = bOpacity || 0;
		var gradientColors = ["Black","Black","Black"]; //start, merge, stop
		var _tagColors_ = ["Black","AntiqueWhite"]; //[backgroundColor,textColor]
		var guiColor = "Black";
		var guiIsOn = true;
		var axisSelectorText = "svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes .tick line,"
			+"svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes path,"
			+"svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes .tick text,"
			+"svg[data-lexType='lexiconRainbow'] .global_lexScaleAxes text";
		var _container_ = _container_ || document.body;
		var position = position || "relative"
		var top = top || "0px";
		var left = left || "0px";
		var offset = 0;
		var line = d3.line();
		var basis = d3.line().curve(d3.curveBasis);
		var colorScale20 = d3.scaleOrdinal(d3.schemeCategory20);
		var _this_ = this; 
		var ordinalID = 0;
		var linearID = 0;
		var ordinalRect = undefined;
		var handleEvent = (function(){}).bind(_this_);
		var dispersion = 0.01;
		var currentHovered = null;
		var glyphBlurStd = 0.01;
		var enableOnPick = true;
		var canvas = undefined;
		////////////////////////////////////////////////////////////////////
		//////////////////INNER VARIABLE ACCESS FROM PROTO//////////////////
		////////////////////////////////////////////////////////////////////
		this.getNSet = {};
		!function(obj){
			var list = {"guiColor":function(g,v){if(g){return guiColor}else{return guiColor = v;}},
						"guiIsOn":function(g,v){if(g){return guiIsOn}else{return guiIsOn = v;}},
						"attrX":function(g,v){if(g){return attrX}else{return attrX = v;}},
						"attrY":function(g,v){if(g){return attrY}else{return attrY = v;}},
						"attrW":function(g,v){if(g){return attrW}else{return attrW = v;}},
						"attrH":function(g,v){if(g){return attrH}else{return attrH = v;}},
						"canvas":function(g,v){if(g){return canvas}else{return canvas = v;}}
						};
			for (var i in list) {
				getNSet(obj,i);
			}
			function getNSet(o,p){ 
				getNSet.desc = getNSet.desc || {
					configurable: true,
					enumerable: true,
				}
				getNSet.desc.get = function(){return list[p](true)}
				getNSet.desc.set = function(v){return list[p](false,v)} //should always return but just to be explicit
				Object.defineProperty(o,p,getNSet.desc);
			}
		}(this.getNSet);
		////////////////////////////////////////////////////////////////////
		//////////////////INNER VARIABLE ACCESS FROM PROTO//////////////////
		////////////////////////////////////////////////////////////////////
		this.toggleGUI = function(bool){
			/*there are 11 GUI elements with GUI class that needs to be taken into account, their order in document TRAVERSAL:
			(!opacity = do not change opacity;!fill = do not change fill; !!deprc = depreciated) 
			0- large RECT behind containerImage with linear gradient fill -!fill;!!deprc
			1- top right long RECT gradient background -!fill;!!deprc
			2(0)- top right long RECT 
			3- bottom right long RECT gradient background -!fill;!!deprc
			4(1)- bottom right long RECT
			5(2)- ordinal G controller -!fill
			6(3)- ordinal g RECT -!opacity
			7(4)- linear G controller -!fill
			8(5)- linear g RECT -!opacity
			9(6)- image G controller -!fill
			10(7)- image g RECT -!opacity
			*/
			guiIsOn = bool ? true : false;
			var selection = d3.selectAll("#"+ID+" .GUI");
			selection.filter(function(d,i){return !~[3,5,7].indexOf(i)}).transition("fade").attr("fill-opacity",function(){return bool ? 0.8 : 0})
			.on("start",function(){bool ? this.style.visibility = "visible" : void(0);})
			.on("end",function(){!bool ? this.style.visibility = "hidden" : void(0);})
			.delay(0).duration(1000);
			selection.filter(function(d,i){return !~[2,4,6].indexOf(i)}).transition("color").attr("fill",guiColor).delay(0).duration(1000);
		}
		this.toggleAxis = function(bool){
			var axis = documentById(ID).querySelectorAll(axisSelectorText);
			if (bool) {
				typeof bool === "string" ?
					Array.prototype.forEach.call(axis,function(d){d.style.fill = bool; d.style.opacity = 0.8;})
					: Array.prototype.forEach.call(axis,function(d){d.style.opacity = 0.8;})
			} else {
				Array.prototype.forEach.call(axis,function(d){d.style.opacity = 0;})
			}
		}	
		this.setViewBox = function(x,y,w,h){return x+" "+y+" "+(x+w)+" "+(y+h)}
		this.setCanvasDims = function(w,h){this.getNSet.canvas.attr("width",w).attr("height",h)}
		this.lexID = function (u){if(arguments.length !== 0){ID=u; return this;}else{return ID;}}
		this.x = function (u){attrX=u; return this;}
		this.y = function (u){attrY=u; return this;}
		this.w = function (u){attrW=u;return this;}
		this.h = function (u){attrH=u;return this;}
		this.sW = function (u){styleW=u; return this;}
		this.sH = function (u){styleH=u; return this;}
		this.position = function (u){position=u; return this;}
		this.color = function(u){bColor=u;return this;}
		this.colorScale = function(f){colorScale20 = f;return this;}
		this.opacity = function(u){bOpacity=u;return this;}
		this.container = function(u){_container_ = u;return this;}
		this.sTop = function(u){top = u; return this;}
		this.sLeft = function(u){left = u; return this;}
		this.sMargin = function(u){styleMargin = u; return this;}
		this.input = function(input){if(arguments.length !== 0){_input_ = input; return this;}else{return _input_;}}
		this.handleEvent = function(f){if(typeof f === "function"){handleEvent = f.bind(_this_);return this;}else if (arguments.length === 0){return handleEvent}else{console.log("Argument is not a function, ignored.");return this;}};
		this.dispersion = function(u){dispersion = u; return this;}
		this.enableOnPick = function(u){enableOnPick = u; return this;}
		var _objSync_ = [];//needed because synctor recursively checks 
		this.sync = function(){return _objSync_;}////needed because synctor recursively checks 
		this.forceStyle = function(){
			if(document.querySelector("head style[data-lexType='lexiconRainbow']")){
				return this;
			}
			d3.select(document.head).append("style").attr("type","text/css").attr("data-lexType","lexiconRainbow").node().innerHTML = 
			"svg[data-lexType='lexiconRainbow'] text {"
				+"-webkit-user-select: none;"
				+"-moz-user-select: none;"
				+"-ms-user-select: none;"
				+"user-select: none;"
				+"}"
			+axisSelectorText+"{"
				+"font: 10px sans-serif;"
				+"fill: AntiqueWhite;"
				+"stroke: AntiqueWhite;"
				+"opacity:0.8;"
				+"shape-rendering: crispEdges;"
				+"stroke-width: 0px;"
				+"transition: fill 0.5s ease, opacity 0.5s ease;"
			+"}"
			+"svg[data-lexType='lexiconRainbow'] g[class $= '_ordinalSolidCurves'] path{"
				+"stroke-linejoin: round;"
			+"}"
			return this;
		}
		this.isAppended = false;
		this.append = function (ieScale) {
			this.isAppended = true;
			var coordinates = [0,0];
			var container = d3.select(_container_);
			if(ieScale){
				container = container.append("div")
					.style("width",styleW)
					.style("height",styleH)
					.style("padding","0px")
					.style("display","block")
					.style("position",position)
					.style("top",top)
					.style("left",left)
					.style("overflow","hidden")
					.style("line-height","normal")
					.style("margin",styleMargin);
				canvas = container.append("canvas") //default css values for canvas are none
					.style("width","100%")
					.style("height","auto")
					.style("visibility","hidden");
				this.setCanvasDims(attrW,attrH);
			}
			var svg = container.append("svg")
				.attr("preserveAspectRatio","none")
				.attr("data-lexType","lexiconRainbow")
				.attr("id",ID)
				.attr("viewBox",function(){return _this_.setViewBox(attrX,attrY,attrW,attrH)})
				.style("width",ieScale ? "100%" :styleW)
				.style("height",ieScale ? "auto" : styleH)
				.style("padding","0px")
				.style("display","block")
				.style("position",ieScale ? "absolute" : position)
				.style("top",ieScale ? "0px" : top)
				.style("left",ieScale ? "0px" : left)
				.style("overflow","hidden")
				.style("line-height","normal")
				.style("margin",ieScale ? "0px" : styleMargin);
			d3.select("#"+ID).append("svg:rect").attr("id",function(){return ID+"_rect";}).attr("x",function(){return (attrX+attrW)/2;}).attr("y",function(){return (attrY+attrH)/2;}).attr("width",0).attr("height",0).attr("rx",15).attr("ry",15).attr("fill-opacity",bOpacity).attr("fill",bColor);
			warp(ID+"_rect",attrW,attrH);
			//viewport = d3.select("#"+ID).append("g"); items in back
			
			//***Defs***
				//linear gradient red-blue
			var def = d3.select("#"+ID).append("svg:defs").attr("id",ID+"_extras");
			var gradient = def.append("linearGradient").attr("x1","0%").attr("y1","0%").attr("x2","0%").attr("y2","100%").attr("spreadMethod","pad").attr("id",ID+"_linearGradient");
			gradient.append("stop").attr("stop-color",gradientColors[0]).attr("offset","0%").attr("stop-opacity",0.9);
			gradient.append("stop").attr("stop-color",gradientColors[0]).attr("offset","20%").attr("stop-opacity",0.2);
			gradient.append("stop").attr("stop-color",gradientColors[1]).attr("offset","20%").attr("stop-opacity",0.2);
			gradient.append("stop").attr("stop-color",gradientColors[1]).attr("offset","80%").attr("stop-opacity",0.9);
			gradient.append("stop").attr("stop-color",gradientColors[2]).attr("offset","80%").attr("stop-opacity",0.9);
			gradient.append("stop").attr("stop-color",gradientColors[2]).attr("offset","100%").attr("stop-opacity",0.2);
				//blur
			def.append("filter").attr("id",ID+"_blurFilter").attr("primitiveUnits","objectBoundingBox").attr("x",-0.05).attr("y",-0.05).attr("width",1.25).attr("height",1.25).append("feGaussianBlur").attr("id",ID+"_gaussianBlur").attr("stdDeviation","0").attr("in","SourceGraphic");
				//clipPath for image
			def.append("clipPath").attr("id",ID+"_clipperImage").append("circle").attr("cx",0).attr("cy",0).attr("r",min(0.8*0.25*attrW,0.6*0.8*attrH)/2);
			def.append("clipPath").attr("id",ID+"_clipperRect").append("rect").attr("x",-50).attr("y",0).attr("width",attrW*0.75+50).attr("height",0.2*attrH).attr("rx",min(attrW,attrH)/50).attr("ry",min(attrW,attrH)/50);
			def.append("clipPath").attr("id",ID+"_clipperLeftPanel").append("rect").attr("x",0).attr("y",0).attr("width",attrW).attr("height",attrH).attr("rx",min(attrW,attrH)/50).attr("ry",min(attrW,attrH)/50);
			ordinalRect = d3.select("#"+ID+"_extras").append("clipPath").attr("id",ID+"_clipperOrdinalRect").append("rect").attr("x",0).attr("y",0).attr("width",0).attr("height",0.9*attrH).attr("rx",min(attrW,attrH)/30).attr("ry",min(attrW,attrH)/30);//height is bit bigger to make bottom of the rects flat
				//neon
			var neon = def.append("filter").attr("id","NeonGlow").attr("x",0).attr("y",0).attr("width",1).attr("height",1);
			neon.append("feColorMatrix").attr("in","SourceGraphic").attr("type","matrix").attr("values","1 0 0 0 0.5, 0 1 0 0 0.5, 0 0 1 0 0.5, 0 0 0 16 -10").attr("result","feColorMatrixOut");
			neon.append("feGaussianBlur").attr("in","feColorMatrixOut").attr("stdDeviation",0.5).attr("result","feGaussianBlurOut");
			neon.append("feBlend").attr("in","SourceGraphic").attr("in2","feGaussianBlurOut").attr("result","feBlendOut").attr("mode","screen");
			//***Defs***
			
			viewportBackground = d3.select("#"+ID).append("g").attr("clip-path","url(#"+ID+"_clipperLeftPanel"+")");
			viewport = d3.select("#"+ID).append("g"); //items in here
			viewportOrdinal = viewport.append("g");
			viewportLinear = viewport.append("g");
			viewportFront = d3.select("#"+ID).append("g"); //overlay items here
			
			renderLeftPanel(viewportBackground,viewportBackground,viewportFront);
			renderScale(viewportBackground);
		
			return this;
		}

		var scaleMainBot;
		var axisMainBot;
		//resusable arrays for AA reference
		var AAColors = {R:"#8694fa",K:"#baaafc",E:"#f93333",D:"#fb7979",I:"#ffff4f",L:"#ffff79",V:"#ffffab",A:"#ffffc9",C:"#e3f9ad",H:"#d5f6fb",M:"#c3ed27",N:"#ee72a7",Q:"#f9c3e3",F:"#c7c88a",Y:"#7dafb9",W:"#85b0cd",S:"#ca9ec8",T:"#f0e4ef",G:"#c0c0c0",P:"#f1f2f3"};
		
		this.render = function (scale) {
			!this.loaded ? (this.loaded = true,handleEvent({linear:_input_.linear[linearID],ordinal:_input_.ordinal[ordinalID]},"onload",null)) : void(0);
			var ordinalData = sortObject(_input_.ordinal[ordinalID].categories);
			var temporary = documentById(ID+"_temporary");
			temporary ? temporary.parentNode.removeChild(temporary) : void(0);
			viewportTemporary = viewportFront.append("g").attr("id",ID+"_temporary");
			gStackObj = {};
			gModeCondition = undefined;
			scaleInTransition = true;
			scaleTimeout ? clearTimeout(scaleTimeout) : void(0);
			scaleTimeout = setTimeout(function(){scaleInTransition = false; scaleTimeout = false;},1000);
			cleanHover();
			_this_.renderOrdinal(ordinalData,viewportOrdinal,scale);
			_this_.renderSolidCurve(ordinalData,viewportLinear,scale);
		}
		this.renderOrdinal = function (ordinalData,container,scale) {
			var width = 0.70*attrW/Object.keys(_input_.ordinal[ordinalID].categories).length,
				cOrdinal = _input_.ordinal[ordinalID],//current ordinal
				cColors = cOrdinal.colors, //current colors
				cState = "colors" in cOrdinal, //current color state
				partition = cOrdinal.partition;
			ordinalRect.attr("width",width);
			//enter
			var selection = container.selectAll("."+ID+"_ordinalBoxes").data(ordinalData,function(d,i){return d});
			var merged = selection
			.enter()
			.append("g")
			.style("opacity",0)
			.attr("clip-path","url(#"+ID+"_clipperOrdinalRect)")
			.attr("transform",function(d,i){return "translate("+(0.25*attrW+i*width)+","+(0.10*attrH)+")"})
			.attr("class",ID+"_ordinalBoxes")
			.each(function(d,i){
				var thisG = d3.select(this);
				//rectangles
				thisG
				.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("height",0.10*attrH)
				.attr("stroke-width",0)
				.attr("fill", returnColor("ordinal",cState,undefined,cColors,undefined,i,d)) //necessary to prevent initially black curves during transition
				.attr("fill-opacity",0.8)
				.attr("class","main")
				.property("__lexiconIndex__",i)
				.style("cursor","pointer");
				//texts 
				thisG
				.append("text")
				.text(d.length > 10 ? d.slice(0,10)+".." : d)
				.attr("x",0)
				.attr("dx",width/8)
				.attr("y",0)
				.attr("dy",0.05*attrH)
				.attr("font-family","advent-pro")
				.attr("font-weight",800)
				.attr("text-anchor","start")
				.attr("textLength",width*0.75)
				//.attr("lengthAdjust","spacing")
				.attr("font-size",min(0.05*attrH,width/2))
				.attr("fill",_tagColors_[1])
				.attr("stroke-width",0)
				.style("cursor","pointer");
				if(!partition){
					return;
				}
				//partition
				makePartition(thisG,d,i);
			})
			.transition("fadein")
			.style("opacity",1)
			.delay(0)
			.duration(500)
			.selection()
			
			
			//update
				//g
			.merge(selection)
			.on("mouseenter",function(d,i){
				if(!enableOnPick){return}
				/*clientX and clientY can result in rounding errors so adding +1 solves that. Sometimes accidentally rect 
				with GUI is taken as elementFromPoint*/
				if(d3.select(document.elementFromPoint(d3.event.clientX+1,d3.event.clientY)).classed("partition")){return}
				var thisG = d3.select(this);
				thisG.transition("draw").ease(d3.easeLinear).attr("transform",function(){return "translate("+(0.25*attrW+i*width)+",0)"}).delay(0).duration(250);
				thisG.select("rect.main").transition("extend").ease(d3.easeLinear).attr("height",0.20*attrH).delay(0).duration(250);
				thisG.select("rect.partition").transition("pushDown").ease(d3.easeLinear).attr("transform","translate(0,"+(0.20*attrH)+")").delay(0).duration(250);
				scaleInTransition ? void(0) : window.requestAnimationFrame(function(){highlightSolidCurve(container,i,d,undefined).__lexiconExtend__()});
				handleEvent({name:d,item:_input_.linear[linearID].categories[d]},"onpick",d3.event.type);
			})
			.on("mouseleave",function(d,i){
				if(!enableOnPick){return}
				if(d3.select(document.elementFromPoint(d3.event.clientX+1,d3.event.clientY)).classed("partition")){return}
				//event.relatedTarget or elementFromPoint is completely wrong in ie11 --> gives you the ownerSVG (???!)
				//combining user space coordinates with getBBox wont work effectively either. setTimeout above is a mundane solution for only ie11.
				//if(this.contains(d3.event.relatedTarget)){return} Kunkkaaaaaa..!?, ow sorry Exploraaaaaaaaarrrr!!!
				//if(~Array.prototype.indexOf.call(this.childNodes,d3.event.relatedTarget)){return} //this still wont work propertly with ie11 either.
				/*###DISCLAIMER###
					After dealing about 1 month to solve the ie11 flicker issue, I have unfortunately concluded that:
					ie is INDEED not a decent browser... I apologize from all the developers and the hours they put to make it,
					I would want to say no hard feelings but I really dont care at this point, you guys at MS did a bad job 
					at making a decent browser. Your priority should not be creating an inhouse implementation
					that looks ok to you, THATS MY JOB, your job at MS is to IMPLEMENT THE SPEC.
					Your second priority should be to check your competitors browser implementation and see how
					freqeuent they dispatch the browser events, if your average competitor dispatches events
					more frequently, GUESS WHAT, maybe you should too...
				*/
				var thisG = d3.select(this);
				thisG.transition("draw").attr("transform",function(){return "translate("+(0.25*attrW+i*width)+","+(0.10*attrH)+")"}).delay(0).duration(500);
				thisG.select("rect.main").transition("extend").attr("height",0.10*attrH).delay(0).duration(500);
				thisG.select("rect.partition").transition("pushDown").attr("transform","translate(0,"+(0.10*attrH)+")").delay(0).duration(250);
				scaleInTransition ? void(0) : window.requestAnimationFrame(function(){highlightSolidCurve(container,i,d,undefined).__lexiconShrink__()});
				handleEvent({name:d,item:_input_.linear[linearID].categories[d]},"onpick",d3.event.type);
			})
			.transition()
			.attr("transform",function(d,i){return "translate("+(0.25*attrW+i*width)+","+(0.10*attrH)+")"})
			.delay(0)
			.duration(500)
			.selection();
				//rect
			merged
			.selectAll("rect.main")
			.transition()
			.attr("fill",function(d,i){return returnColor("ordinal",cState,undefined,cColors,undefined,this.__lexiconIndex__,d)})
			.attr("width",width)
			.delay(0)
			.duration(500);
				//text
			merged
			.selectAll("text")
			.transition()
			.attr("fill-opacity",0)
			.delay(0)
			.duration(125)
			.transition()
			.text(function(d,i){return d.length > 10 ? d.slice(0,10)+".." : d;})
			.transition()
			.attr("fill-opacity",1)
			.attr("dx",width/8)
			.attr("textLength",width*0.75)
			.duration(125);
				//partition
			var partitions = merged.selectAll("rect.partition");
			switch(+!!partitions.node() + (2*+!!partition)){
				case 0:
					void(0);
					break;
				case 1:
					partitions
					.classed("partition",false)
					.transition("fadeout")
					.style("opacity",0)
					.on("end",function(){d3.select(this).remove();})
					.delay(0)
					.duration(750);
					break;
				case 2:
					merged.each(function(d,i){
						makePartition(d3.select(this),d,i)
						.transition("fadein")
						.attr("width",width)
						.attr("fill-opacity",0.6)
						.delay(0)
						.duration(500);
					})
					break;
				case 3:
					merged.each(function(d,i){
						var partitionNode = this.querySelector(".partition");
						if(partitionNode) {
							partitionNode.__lexiconIndex__ = i;
						} else {
							makePartition(d3.select(this),d,i);
						}
					});
					merged.selectAll("rect.partition")
					.transition()
					.attr("fill",function(d){return returnColor("partition",partition === "color" ? cState : false,undefined,cColors,undefined,this.__lexiconIndex__,d)})
					.attr("width",width)
					.attr("fill-opacity",0.6)
					.delay(0)
					.duration(500);
					break;
			}
			//exit
			selection
			.exit()
			.classed(ID+"_ordinalBoxes",false)
			.transition("remove")
			.style("opacity",0)
			.on("end",function(){d3.select(this).remove()})
			.delay(0)
			.duration(750);
			
			function makePartition (thisG,d,i) {
				return thisG
				.append("rect")
				.attr("x",0)
				.attr("y",0)
				.attr("transform","translate(0,"+(0.10*attrH)+")")
				.attr("height",0.60*attrH)
				.attr("width",0)
				.attr("stroke-width",0)
				.property("__lexiconIndex__",i)
				.attr("fill", returnColor("partition",partition === "color" ? cState : false,undefined,cColors,undefined,i,d)) //necessary to prevent initially black curves during transition
				.attr("fill-opacity",0)
				.attr("class","partition")
				.style("cursor","pointer");
			}
		}
		this.renderSolidCurve = function (ordinalData,container,scale) {
			var selection = container.selectAll("."+ID+"_ordinalSolidCurves").data(ordinalData,function(d,i){return d}),
				cOrdinal = _input_.ordinal[ordinalID],//current ordinal
				cColors = cOrdinal.colors, //current colors
				cState = "colors" in cOrdinal, //current color state
				cOrdinalModeValue = cOrdinal.mode,
				cOrdinalMode = !!cOrdinal.mode,
				/* Modify#1 taken from renderCurves */
				linear$ID$ = _input_.linear[linearID],
				mode = linear$ID$.mode,
				doExistMode = !!mode,
				sort = linear$ID$.sort,
				doExistSort = !!sort,
				offset = doExistMode ? typeof mode === "object" ? mode[1] : 0 : undefined,
				mode = doExistMode ? typeof mode === "object" ? mode[0] : mode : undefined,
				/* Modify#1 taken from renderCurves */
				gMode = linear$ID$.gMode,
				gModeBool = !!gMode,
				gStackContext = 0;
			gModeCondition = +gModeBool+((gMode === "justify")<<1)+(doExistMode<<2);
			var scaleStep = undefined;
			gMode === "justify" ? 
				(scale = linear$ID$.domain.map(function(d,i,a){return i === 0 ? d : a[i-1]+ordinalData.length*abs(d-a[i-1])}),
				scaleStep = abs(scale[0] - scale[1])/ordinalData.length,
				_this_.changeScale(scale,linear$ID$.format)):
				void(0);
			//enter
			selection
			.enter()
			.append("g")
			.style("opacity",0)
			.attr("class",ID+"_ordinalSolidCurves")
			.transition()
			.style("opacity",1)
			.delay(0)
			.duration(500)
			.selection()
			//update
			.merge(selection)
			.each(function(d,i){
				if(!_input_.linear[linearID].categories[d]){
					d3.select(this).selectAll("path").attr("toBeRemoved","").transition().attr("fill-opacity",0).delay(0).duration(750).remove();
					return;
				}
				renderCurves.bind(this,d,i)();
			})
			//exit
			selection
			.exit()
			.classed(ID+"_ordinalSolidCurves",false)
			.transition("remove")
			.style("opacity",0)
			.on("end",function(){d3.select(this).remove()})
			.delay(0)
			.duration(750);
			
			for (var u = container.node().querySelectorAll("."+ID+"_ordinalSolidCurves"),j=0,k=u.length;j<k;++j){
				if(u[j].querySelectorAll("path:not([toBeRemoved])").length !== 0){return}
			}
			handleEvent(null,"onmismatch",null);
		
		
			function renderCurves (d,i) {
				var refPath = undefined,
					isRef = undefined,
					indexPlaceHolder = {},
					/* Modify#1 removed some decleration up one scope*/
					categories$d$ = linear$ID$.categories[d],
					categories$d$names = categories$d$.names,
					doExistNames = !!categories$d$names,
					categories$d$intervals = categories$d$.intervals,
					categories$d$intervals = categories$d$intervals ? categories$d$intervals : (isRef = true,refPath = _input_.linear[+categories$d$].categories[d],refPath.intervals), 
					names = doExistNames ? 
					typeof categories$d$names === "string" ? [categories$d$names] : categories$d$names
					: isRef ? typeof refPath.names === "string" ? [refPath.names] : refPath.names
					: undefined,
					namesBool = !!names,
					isObjIntervals = typeof categories$d$intervals === "object",
					intervals = isObjIntervals ? categories$d$intervals.slice() : [categories$d$intervals],
					intervals = coerceToNumber(intervals),//coerce all to number
					intervals = doExistSort ? sortInterval(sort,indexPlaceHolder,names,intervals) : intervals,
					isObjColors = cState ? typeof cColors[d] === "object" : false,
					colorsLength = isObjColors ? cColors[d].length : undefined,
					stackingContext = intervals.map(function(d,i,a){var x = a.slice(0,i).reduce(function(ac,d,i,a){return typeof d === "object" ? ac+(d[1]-d[0]) : ac+d},0); return [x,typeof d === "object" ? x+(d[1]-d[0]) : x+d]}),
					stackingContextLength = stackingContext.length,
					stackingSpan = stackingContext[stackingContext.length-1][1],
					stackingStep = stackingSpan/stackingContextLength,
					stackingContextOrdinal = cOrdinalModeValue === "stackEqual" ? stackingContext.map(function(d,i){return [i*stackingStep,(i+1)*stackingStep]}) : restackOrdinal(stackingContext,stackingStep,stackingSpan),
					stackingContextLinear = mode === "intervalize" ? intervals.map(function(d,i,a){return [0,typeof d === "object" ? (d[1]-d[0]) : d]}) : stackingContext,
					stackingSpanLinear = mode === "intervalize" ? max.apply(this,Array.prototype.concat.apply([],stackingContextLinear).map(function(d){return +d})) : stackingSpan;
					doExistMode ? offset ? intervals = stackingContextLinear.map(function(d,i){return [d[0]+offset+gStackContext,d[1]+offset+gStackContext]}) : intervals = stackingContextLinear.map(function(d,i){return [d[0]+gStackContext,d[1]+gStackContext]}) : void(0);
				
					switch (gModeCondition) {
						case 0://no gMode,
							void(0);
							break;
						case 1://gMode, stack, no mode,
							gStackObj[d] = gStackContext;
							gStackContext += max.apply(this,Array.prototype.concat.apply([],intervals).map(function(d){return +d}));
							intervals = intervals.map(function(u,w){return typeof u === "object" ? [u[0]+gStackObj[d],u[1]+gStackObj[d]] : u+gStackObj[d]});
							break;
						case 5://gMode, stack, mode,
							gStackObj[d] = gStackContext;
							gStackContext += stackingSpanLinear;
							break;
						case 3://gMode, justify, no mode,
							gStackObj[d] = gStackContext;
							gStackContext += scaleStep;
							intervals = intervals.map(function(u,w){return typeof u === "object" ? [u[0]+gStackObj[d],u[1]+gStackObj[d]] : u+gStackObj[d]});
							break;
						case 7://gMode, justify, mode,
							gStackObj[d] = gStackContext;
							gStackContext += scaleStep;
							break;
					}
				
				
				//var	selection = d3.select(this).selectAll("path").data(intervals);
				var	selection = d3.select(this).selectAll("path:not([toBeRemoved])."+ID+"_entered").data(intervals,function(dd,ii){
					//var isEl = "nodeType" in this; works in v3
					var isEl = this.tagName.toUpperCase() === "PATH" ? true : false; //key arguments changed in v4
					var key = isEl ? this.__keyLexicon : undefined;
					var nKey;
					switch((+(namesBool)+(doExistSort))*+(namesBool)) {
						case 2:
							if(key && isEl) {
								return key
							} else {
								nKey = names ? names[indexPlaceHolder[ii]] || ii : ii
								isEl ? this.__keyLexicon = nKey : void(0);
								return nKey;
							}
						case 1:
							if(key && isEl) {
								return key
							} else {
								nKey = names? names[ii] || ii : ii;
								isEl ? this.__keyLexicon = nKey : void(0);
								return nKey;
							}
						case 0:
							isEl ? delete this.__keyLexicon : void(0);
							return ii;
						default:
							isEl ? delete this.__keyLexicon : void(0);
							return ii;
					}
				});
				//enter
				selection
				.enter()
				.append("path")
				.attr("class",ID+"_entered")
				.attr("fill",function(dd,ii){return returnColor("linear",cState,isObjColors,cColors,colorsLength,i,d,ii,dd)}) //necessary to prevent initially black curves during transition
				.attr("fill-opacity",0)
				//update
				.merge(selection)
				.order()
				.on("mouseover",function(dd,ii){
					cleanHover();
					var clonedNode = currentHovered = this.cloneNode(false);//attributes are already taken deep is for children
					clonedNode.removeAttribute("class");clonedNode.setAttribute("id",ID+"_hovered");clonedNode.setAttribute("stroke-width",2);
					clonedNode.setAttribute("stroke", returnColor("stroke",cState,isObjColors,cColors,colorsLength,i,d,ii,dd) );
					clonedNode.setAttribute("filter", "url(#NeonGlow)");
					clonedNode.gesture = function(event){
						event.preventDefault();
						event.stopPropagation();
						cleanHover();
						handleEvent({name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,item:dd,parent:categories$d$,index: isObjIntervals ? ii : undefined},"onhighlight",event.type);
					};
					clonedNode.addEventListener("mouseout",clonedNode.gesture,false);
					clonedNode.addEventListener("touchend",clonedNode.gesture,false);
					this.parentNode.appendChild(clonedNode);
					handleEvent({name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,item:dd,parent:categories$d$,index: isObjIntervals ? ii : undefined},"onhighlight",/*d3.event.type*/"mouseover");
				})
				.on("touchstart",function(dd,ii){
					d3.select(this).on("mouseover").bind(this,dd,ii)();
				})
				.on("touchend",function(){
					d3.event.preventDefault();
				})
				/*.on("touchcancel",function(){
					//d3.event.preventDefault();
				})
				.on("mouseout",function(dd,ii){
					//d3.event.relatedTarget === currentHovered ? void(0) : cleanHover();
					//handleEvent({name: names ? isRef && doExistSort ? names[indexPlaceHolder[ii]] : names[ii] : names,item:dd,parent:categories$d$,index: isObjIntervals ? ii : undefined},"onhighlight",d3.event.type);
				})*/
				.transition("fadeInOut")
				.attr("d",function(dd,ii){return drawSolidCurve(i,dd,undefined,scale,(cOrdinalMode ? stackingContextOrdinal[ii] : undefined),stackingSpan)})
				.attr("fill",function(dd,ii){return returnColor("linear",cState,isObjColors,cColors,colorsLength,i,d,ii,dd)})
				.attr("fill-opacity",0.8)
				.delay(0)
				.duration(500);
				//exit
				selection
				.exit()
				.classed(ID+"_entered",false)
				.transition("fadeInOut")
				.attr("fill-opacity",0)
				.on("end",function(){d3.select(this).remove();})
				.delay(0)
				.duration(750);
			}
		}
				
		//left panel
		function renderLeftPanel (containerOrdinal,containerLinear,containerImage) {
			function getIndexOf(node){
				node = node.node();
				var length = node.parentNode.childNodes.length;
				for(var pNode = node.parentNode,cNodes=pNode.childNodes,i=0;i<length;++i){
					if (cNodes[i]===node){
						break;
					}
				}
				return i;
			}
			function containerWithSmallestIndex(){
				var args = Array.prototype.slice.call(arguments);
				var base = args.length;
				return args.map(function(d,i){return [d,getIndexOf(d),i]}).sort(function(a,b){return a[1]*base+a[2]-b[1]*base-b[2]})[0][0];
			}
			var obj = {subject:undefined,
						dim:function(){this.subject.transition().attr("fill-opacity",0.9).delay(0).duration(1000);if(this.hasImage()){this.subject.selectAll("image").transition().style("opacity",1).delay(0).duration(1000)}},
						undim:function(){this.subject.transition().attr("fill-opacity",0.8).delay(0).duration(1000);if(this.hasImage()){this.subject.selectAll("image").transition().style("opacity",0.6).delay(0).duration(1000)}},
						hasImage:function(){return Array.prototype.some.call(this.subject.node().childNodes,function(d,i){return d.nodeName.match(/image/gi)})},
						hasText:function(){return Array.prototype.some.call(this.subject.node().childNodes,function(d,i){return d.nodeName.match(/text/gi)})},
						changeImage:function(){
							/*TODO: empty string is valid URI reference, but there is a risk browser request
							javascript:void(0) doesnt work in chrome, it is replaced by default placeholder*/
							if(!this.hasImage()){return;}
							var selection = this.subject.select("image");
							if(selection.attr("xlink:href") === (_input_.linear[linearID].glyph || "")){return;} 
							selection.transition("changeImage")
							.on("end",function(){selection.attr("xlink:href",_input_.linear[linearID].glyph || "")})
							.style("opacity",0).delay(0).duration(250)
							.transition().style("opacity",0.7).duration(250);
						},
						changeText:function(nText){if(!this.hasText()){return;} this.subject.select("text").transition("changeText").on("end",function(){d3.select(this).text(nText)}).attr("fill-opacity",0).delay(0).duration(250)
						.transition().attr("fill-opacity",0.6).duration(250);},
				};
			//containerWithSmallestIndex.apply(_this_,Array.prototype.slice.call(arguments)).append("rect").classed("GUI",true).attr("x",0).attr("y",0).attr("width",attrW*0.25).attr("height",attrH).attr("fill","url(#"+ID+"_linearGradient)").attr("fill-opacity",0.6);
			var topRightRect = containerOrdinal.append("rect").classed("GUI",true).attr("x",0).attr("y",0).attr("width",attrW*0.75).attr("height",0.2*attrH).attr("fill",guiColor).attr("fill-opacity",guiIsOn ? 0.8 : 0).style("visibility",guiIsOn ? "visible" : "hidden").attr("transform","translate("+(0.25*attrW)+","+(0)+")").attr("clip-path","url(#"+ID+"_clipperRect)").node();
			var botRightRect = containerLinear.append("rect").classed("GUI",true).attr("x",0).attr("y",0).attr("width",attrW*0.75).attr("height",0.2*attrH).attr("fill",guiColor).attr("fill-opacity",guiIsOn ? 0.8 : 0).style("visibility",guiIsOn ? "visible" : "hidden").attr("transform","translate("+(0.25*attrW)+","+(0.8*attrH)+")").attr("clip-path","url(#"+ID+"_clipperRect)").node();
			//topRightRect.parentNode.insertBefore((function(o){o.setAttribute("fill","url(#"+ID+"_linearGradient)");return o})(topRightRect.cloneNode()),topRightRect);
			//botRightRect.parentNode.insertBefore((function(o){o.setAttribute("fill","url(#"+ID+"_linearGradient)");return o})(botRightRect.cloneNode()),botRightRect);
			var ordinalG = containerOrdinal.append("g").classed("GUI",true).attr("fill-opacity",guiIsOn ? 0.8 : 0).style("visibility",guiIsOn ? "visible" : "hidden");
			var linearG = containerLinear.append("g").classed("GUI",true).attr("fill-opacity",guiIsOn ? 0.8 : 0).style("visibility",guiIsOn ? "visible" : "hidden");
			var imageG = containerImage.append("g").classed("GUI",true).attr("fill-opacity",guiIsOn ? 0.8 : 0).style("visibility",guiIsOn ? "visible" : "hidden");
			_this_.ordinalG = function(){return ordinalG};
			_this_.ordinalG.update = function(count){
				ordinalID = count;
				_this_.ordinalG.changeText(_input_.ordinal[ordinalID].name);
				_this_.render();
			}
			_this_.ordinalG.counter = function(){return ordinalID}
			_this_.linearG = function(){return linearG};
			_this_.linearG.update = function(count){
				linearID = count;
				_this_.imageG.changeImage(_input_.linear[linearID].glyph);
				_this_.linearG.changeText(_input_.linear[linearID].name);
				_this_.changeScale(_input_.linear[linearID].domain,_input_.linear[linearID].format);
				_this_.render(_input_.linear[linearID].domain);
			}
			_this_.linearG.counter = function(){return linearID}
			_this_.imageG = function(){return imageG};
			createInstance(_this_.ordinalG,ordinalG);
			createInstance(_this_.linearG,linearG);
			createInstance(_this_.imageG,imageG);
			ordinalG.append("rect").classed("GUI",true).attr("x",0).attr("y",0).attr("width",attrW*0.25).attr("height",attrH*0.2).attr("fill",guiColor);
			linearG.append("rect").classed("GUI",true).attr("x",0).attr("y",0.8*attrH).attr("width",attrW*0.25).attr("height",attrH*0.2).attr("fill",guiColor);
			imageG.append("rect").classed("GUI",true).attr("x",0).attr("y",0.2*attrH).attr("width",attrW*0.25).attr("height",attrH*0.6).attr("fill",guiColor);
			ordinalG.append("text").text(_input_.ordinal[0].name).attr("x",0).attr("dx",0.125*attrW).attr("y",0).attr("dy",0.15*attrH).attr("font-family","advent-pro").attr("font-weight",300).attr("text-anchor","middle").attr("font-size",0.2*attrH*0.4).attr("fill",_tagColors_[1]).attr("stroke",_tagColors_[1]).attr("stroke-width",0).style("cursor","pointer");
			linearG.append("text").text(_input_.linear[0].name).attr("x",0).attr("dx",0.125*attrW).attr("y",0.8*attrH).attr("dy",0.15*attrH).attr("font-family","advent-pro").attr("font-weight",300).attr("text-anchor","middle").attr("font-size",0.2*attrH*0.4).attr("fill",_tagColors_[1]).attr("stroke",_tagColors_[1]).attr("stroke-width",0).style("cursor","pointer");
			imageG.append("image").attr("xlink:href",_input_.linear[0].glyph).attr("alt","droplet").attr("x",-0.4*0.25*attrW).attr("y",-0.4*0.6*attrH).attr("height",0.8*0.6*attrH).attr("width",0.8*0.25*attrW).style("opacity",0.7).attr("clip-path","url(#"+ID+"_clipperImage)").attr("transform","translate("+(0.5*0.25*attrW)+","+(0.5*0.6*attrH+0.2*attrH)+")");
			//slider
			var slider = imageG.append("g").attr("transform","translate(0,"+attrH*0.2+")");
			slider.node().ordinal = Array.prototype.concat.call(["__mock__","__mock__"],_input_.ordinal.map(function(d,i){return d.name}),["__mock__","__mock__"]);
			slider.node().linear = Array.prototype.concat.call(["__mock__","__mock__"],_input_.linear.map(function(d,i){return d.name}),["__mock__","__mock__"]);
			slider.node().__on__ = 0;
			slider.node().__ready__ = true;
			slider.node().render = function(type,count,offset){
				if(!this.__ready__){return}
				var that = this;
				window.requestAnimationFrame(function(){
					that.__type__ = type;
					count = count || 0;
					offset = offset || 0;
					var current = max(0,min(_input_[type].length-1,round(count+offset)));
					var length = _input_[type].length+4;
					var countMax = max(1,length-5); //prevent division by 0
					if(!that.__on__){
						imageG.select("image").attr("filter","url(#"+ID+"_blurFilter)").transition("blur").tween("blur",function(){var interpolator = d3.interpolate(0,glyphBlurStd);return function(t){document.getElementById(ID+"_gaussianBlur").setAttribute("stdDeviation",interpolator(t))}}).delay(0).duration(1500);
						var rect = slider.append("rect").attr("fill","LightGray").attr("width",attrW*0.01).attr("height",function(){this.__knobLengthReal__ = attrH*0.6*5/length; this.__knobLength__ = max(this.__knobLengthReal__,attrH*0.03);this.__knobLengthSurplus__ = this.__knobLength__ - this.__knobLengthReal__; this.__yMax__ = attrH*0.6-this.__knobLength__; return this.__knobLength__}).attr("rx",attrW*0.005).attr("ry",attrW*0.005).attr("x",attrW*0.24).attr("y",function(){return (count+offset)/countMax*this.__yMax__});
						//rect.__date__ = undefined;
						rect.node().__count___ = undefined;
						rect.node().__dCount__ = undefined;
						rect.node().__timer__ = new (function(arg){
							this.parent = rect.node();
							this.startTime = undefined;
							this.elapsed = undefined;
							this.dragEnded = true;
							this.dragStarted = function(){
								this.dragEnded = false;
								function keepTime(timeStamp){
									if(this.dragEnded){
										this.startTime = undefined;
										return;
									}
									if(!this.startTime){
										this.startTime = timeStamp;
									}
									this.elapsed = timeStamp-this.startTime;
									this.elapsed >= 350 ? this.parent.__dCount__ = 0 : void(0);
									window.requestAnimationFrame(keepTime.bind(this));
								}
								window.requestAnimationFrame(keepTime.bind(this));
							}
						});
						
						var drag = d3.drag().subject(function(){var x = +d3.select(this).attr("x"); var y = +d3.select(this).attr("y"); return {"x":x,"y":y};}).on("drag", dragFunc).on("start",function (){this.__count__ = this.__count__ || count;this.__dCount__ = 0;this.__timer__.dragStarted();d3.event.sourceEvent.stopPropagation();}).on("end",dragEnd);
						function dragFunc() {
							var pos = max(0,min(this.__yMax__,d3.event.y));
							var rawCount = pos/this.__yMax__*(this.__yMax__+this.__knobLengthSurplus__)/(attrH*0.6)*length || 0; //when this.__yMax__ is 0, that when there is only 1 item __count__ and __dCount__ will become NaN because of division by 0, logical or necessary
							var count = floor(rawCount);
							var offset = rawCount-count;
							this.__timer__.elapsed >= 350 ? (this.__count__ = count,this.__timer__.startTime = undefined) : void(0);
							this.__dCount__ = count - this.__count__;
							d3.select(this).attr("y",pos);
							slider.node().render(type,count,offset);
							//console.log("count:"+count+","+"this.count:"+this.__count__+",this.dCount:"+this.__dCount__+",elapsed:"+elapsed);
						}
						function dragEnd(){
							this.__timer__.dragEnded = true;
							if(abs(this.__dCount__) <= 2){return}
							d3.select(this).transition().ease(d3.easeCubicOut).tween("friction",function(){
								//var interpolator = d3.interpolate(this.__count__+this.__dCount__,this.__count__+this.__dCount__+Math.floor(this.__dCount__/2));
								var interpolator = d3.interpolate(this.__count__+this.__dCount__,this.__count__+this.__dCount__*2);
								var thisNode = this;
								return function(t){
									var real = interpolator(t);
									var whole = floor(real);
									thisNode.setAttribute("y",max(0,min(thisNode.__yMax__,real/countMax*thisNode.__yMax__)));
									thisNode.__count__ = max(0,min(whole,length-5));
									slider.node().render(type,thisNode.__count__,real-whole);
								}
							})
							/*.each("end",function(){this.__count__ = this.__count__+this.__dCount__+Math.floor(this.__dCount__/3)})*/
							.delay(0).duration(500);
						}
						rect.on("touchmove",function(){disableScroll(this)}).on("touchend",function(){enableScroll(this)}).call(drag);
						that.__on__ = 1;
					}
					var selection = slider.selectAll("."+ID+"_sliderTexts").data(that[type].slice(count,count+5));
					selection
					.enter()
					.append("text")
					.attr("font-family","advent-pro")
					.attr("font-weight",300)
					.attr("text-anchor","middle")
					.attr("class",ID+"_sliderTexts")
					.style("cursor","pointer")
					.merge(selection)
					.text(function(d,i){return d === "__mock__" ? "" : d})
					.attr("fill",function(d,i){/*console.log("i:"+i+",offset:"+offset+",current:"+current+",count:"+count);*/ var corrected = offset !== 0.5 ? round(i-offset) : floor(i-offset); return corrected !== 2 ? "AntiqueWhite" : "Red"})
					.attr("fill-opacity",function(d,i){return 1-0.4*abs(2-i+offset)})
					.attr("transform",function(d,i){return "translate("+(0.125*attrW)+","+((i+1-offset)*attrH*0.12)+") scale(1,"+(1-0.4*abs(2-i+offset))+")"});
					selection
					.exit()
					.remove();
					_this_[type+"G"].counter() !== current ? (handleEvent(_input_[type][current],"onrender"+type.charAt(0).toUpperCase()+type.slice(1),null),_this_[type+"G"].update(current)) : void(0);
					
					that.__ready__ = true;
				})
				this.__ready__ = false;
			}
			slider.node().remove = function() {
				this.__on__ = 0;
				imageG.select("image").attr("filter","url(#"+ID+"_blurFilter)").transition("blur").tween("blur",function(){var interpolator = d3.interpolate(glyphBlurStd,0);return function(t){document.getElementById(ID+"_gaussianBlur").setAttribute("stdDeviation",interpolator(t))}})
				.on("end",function(){/*console.log(this);*/d3.select(this).attr("filter","none")}).delay(0).duration(1500);
				slider.select("rect").remove();
				slider.selectAll("."+ID+"_sliderTexts").classed(ID+"_sliderTexts",false)
				.transition()
				.attr("fill-opacity",0)
				.on("end",function(){d3.select(this).remove()})
				.delay(0).duration(500);
			}
			slider.on("touchmove",function(){disableScroll(this)}).on("touchend",function(){enableScroll(this)});
			d3.drag()
			.on("start",function (){
				d3.event.sourceEvent.stopPropagation();
				var rect = this.querySelector("rect");
				var length = this.__length__ = _input_[this.__type__].length+4;
				var yMax = this.__yMax__ = rect.__yMax__;
				var knobLengthSurplus = this.__knobLengthSurplus__ = rect.__knobLengthSurplus__;
				this.__rawCount__ = (+rect.getAttribute("y"))/yMax * (yMax + knobLengthSurplus)/(attrH*0.6)*length || 0;
			})
			.on("drag", function dragFunc() {
				this.__rawCount__ = max(0,min(this.__rawCount__ += d3.event.dy/attrH/0.12,this.__length__-5));
				var pos = this.__rawCount__*(attrH*0.6)*this.__yMax__/this.__length__/(this.__yMax__+this.__knobLengthSurplus__) || 0;
				var count = floor(this.__rawCount__);
				var offset = this.__rawCount__ - count;
				this.querySelector("rect").setAttribute("y",pos);
				this.render(this.__type__,count,offset);
			})
			.on("end",function dragEnd(){
				this.__length__ = undefined;
				this.__yMax__ = undefined;
				this.__knobLengthSurplus__ = undefined;
				this.__rawCount__ = undefined;
			}).bind(slider)(slider);
			
			//slider
			
			//attach event handlers
			ordinalG
			.on("mouseover",function(){
				if(!guiIsOn){return}
				_this_.ordinalG.dim();
			})
			.on("mouseout",function(){
				if(!guiIsOn){return}
				_this_.ordinalG.undim();
			})
			.on("click",function(){
				if(!guiIsOn){return}
				if(slider.node().__on__ && slider.node().__type__ === "ordinal"){
					slider.node().remove();
				} else if (slider.node().__on__) {
					slider.node().remove();
					slider.node().render("ordinal",ordinalID);
				} else {
					slider.node().render("ordinal",ordinalID);
				}
			});
			linearG
			.on("mouseover",function(){
				if(!guiIsOn){return}
				_this_.linearG.dim();
			})
			.on("mouseout",function(){
				if(!guiIsOn){return}
				_this_.linearG.undim();
			})
			.on("click",function(){
				if(!guiIsOn){return}
				if(slider.node().__on__ && slider.node().__type__ === "linear"){
					slider.node().remove();
				} else if (slider.node().__on__) {
					slider.node().remove();
					slider.node().render("linear",linearID);
				} else {
					slider.node().render("linear",linearID);
				}
			});
			imageG
			.on("mouseover",function(){
				if(!guiIsOn){return}
				_this_.imageG.dim();
			})
			.on("mouseout",function(){
				if(!guiIsOn){return}
				_this_.imageG.undim();
			})
			//attach event handlers
			function createInstance(instance,subject) {
				for (var i in obj) {
					if (i !== "subject"){
						instance[i] = obj[i];
					}
				}
				instance.subject = subject;
			}
		}
		function renderScale (container) {
			//##############################################################SCALE###################################################################################
			scaleMainBot = d3.scaleLinear().domain(_input_.linear[0].domain).range([0,0.70*attrW]);
			axisMainBot = d3.axisBottom().scale(scaleMainBot).ticks(5).tickSize(-0.025*attrH,0).tickPadding(4).tickFormat(_input_.linear[0].format ? d3.format(_input_.linear[0].format) : null);
			
			var axisG = container.append("g").attr("id",ID+"_lexMainAxisBot").attr("class","global_lexMainAxes").attr("class","global_lexScaleAxes").attr("transform","translate("+(0.25*attrW-0.5)+","+(0.8*attrH+5)+")").call(axisMainBot);
			//##############################################################SCALE###################################################################################
			_this_.changeScale = function(domain,format){
				format = format || null;
				axisMainBot.tickFormat(format ? d3.format(format) : null);
				container.select("#"+ID+"_lexMainAxisBot").transition()
				.tween("scaleChange",function(){var interpolator = d3.interpolateArray(scaleMainBot.domain(),domain); return function(t){scaleMainBot.domain(interpolator(t));axisG.call(axisMainBot);}})
				.on("end",function(){
					var axis = _input_.linear[linearID].axis;
					axis !== undefined ? _this_.toggleAxis(axis) : _this_.toggleAxis(true);
				})
				.delay(0).duration(1000);
			}
		}
		
		function drawSolidCurve (order,domain,side,scale,stackingContext,stackingSpan) {
			stackingSpan = stackingSpan || 1;
			var currentScale = scale ? d3.scaleLinear().domain(scale).range([0,0.70*attrW]) : scaleMainBot;
			var epsilon = dispersion*attrW;
			var delta = 0.1*0.6*attrH;
			var offset = 0.25*attrW;
			var length = Object.keys(_input_.ordinal[ordinalID].categories).length;
			var tabLength = attrW*0.70/length;
			var start1 = stackingContext ? [tabLength*(order+stackingContext[0]/stackingSpan)+offset,0.2*attrH] :[order*tabLength+offset,0.2*attrH];
			var start2 = stackingContext ? [tabLength*(order+stackingContext[1]/stackingSpan)+offset,0.2*attrH] :[(order+1)*tabLength+offset,0.2*attrH];
			var end1 = [typeof domain === "object" ? currentScale(+domain[0])+offset: currentScale(+domain)+offset-epsilon,0.8*attrH];
			var end2 = [typeof domain === "object" ? currentScale(+domain[1])+offset : currentScale(+domain)+offset+epsilon,0.8*attrH];
			if (arguments[2] === undefined) {
				return basis([[start1[0],start1[1]],[start1[0],start1[1]+delta],[start1[0]*0.75+0.25*end1[0],attrH*0.5],[end1[0],end1[1]-delta],[end1[0],end1[1]]])
				+"L"+line([[end1[0],end1[1]],[end2[0],end2[1]]]).slice(1)
				+"L"+(basis([[end2[0],end2[1]],[end2[0],end2[1]-delta],[start2[0]*0.75+0.25*end2[0],attrH*0.5],[start2[0],start2[1]+delta],[start2[0],start2[1]]])).slice(1)
				+"Z";
			} else if (arguments[2] === "left") {
				return basis([[start1[0],start1[1]],[start1[0],start1[1]+delta],[start1[0]*0.75+0.25*end1[0],attrH*0.5],[end1[0],end1[1]-delta],[end1[0],end1[1]]]);
			} else if (arguments[2] === "right") {
				return basis([[end2[0],end2[1]],[end2[0],end2[1]-delta],[start2[0]*0.75+0.25*end2[0],attrH*0.5],[start2[0],start2[1]+delta],[start2[0],start2[1]]].reverse());
			}
		}
		
		function highlightSolidCurve (container,order,data,scale) {
			var dataU = data.replace(/\s+/g,"_"); //ex: New York --> New_York
			if(documentQuery("."+ID+"_ordinalSolidHighlights_"+dataU)) {
				return viewportTemporary[data];
			}
			var linear$ID$ = _input_.linear[linearID],
				refPath = undefined,
				isRef = undefined,
				operateOn = data ? linear$ID$.categories[data] : undefined;
			if (!data || !operateOn){return {__lexiconExtend__:function(){void(0)},__lexiconShrink__:massShrink}}
			var operateOnIntervals = operateOn.intervals,
				operateOnIntervals = operateOnIntervals ? operateOnIntervals : (isRef = true,refPath = _input_.linear[+operateOn].categories[data],refPath.intervals);
			if (!operateOnIntervals){return {__lexiconExtend__:function(){void(0)},__lexiconShrink__:massShrink}}
			
			var mode = linear$ID$.mode,
				doExistMode = !!mode,
				sort = linear$ID$.sort,
				doExistSort = !!sort,
				offset = doExistMode ? typeof mode === "object" ? mode[1] : 0 : undefined,
				mode = doExistMode ? typeof mode === "object" ? mode[0] : mode : undefined,
				operateOnNames = operateOn.names,
				doExistNames = !!operateOnNames,
				names = doExistNames ? 
				typeof operateOnNames === "string" ? [operateOnNames] : operateOnNames
				: isRef ? typeof refPath.names === "string" ? [refPath.names] : refPath.names
				: undefined,
				converted = typeof operateOnIntervals === "object" ? operateOnIntervals.slice() : [operateOnIntervals],
				converted = coerceToNumber(converted),//coerce all to number
				converted = doExistSort ? sortInterval(sort,undefined,names,converted) : converted,
				cOrdinal = _input_.ordinal[ordinalID],//current ordinal
				cColors = cOrdinal.colors, //current colors
				cState = "colors" in cOrdinal, //current color state
				isObjColors = cState ? typeof cColors[data] === "object" : false,
				colorsLength = isObjColors ? cColors[data].length : undefined,
				cOrdinalModeValue = cOrdinal.mode,
				cOrdinalMode = !!cOrdinalModeValue,
				stackingContext = converted.map(function(d,i,a){var x = a.slice(0,i).reduce(function(ac,d,i,a){return typeof d === "object" ? ac+(d[1]-d[0]) : ac+d},0); return [x,typeof d === "object" ? x+(d[1]-d[0]) : x+d]}),
				stackingContextLength = stackingContext.length,
				stackingSpan = stackingContext[stackingContext.length-1][1],
				stackingStep = stackingSpan/stackingContextLength,
				stackingContextOrdinal = cOrdinalModeValue === "stackEqual" ? stackingContext.map(function(d,i){return [i*stackingStep,(i+1)*stackingStep]}) : restackOrdinal(stackingContext,stackingStep,stackingSpan),
				stackingContextLinear = mode === "intervalize" ? converted.map(function(d,i,a){return [0,typeof d === "object" ? (d[1]-d[0]) : d]}) : stackingContext,
				stackingSpanLinear = mode === "intervalize" ? max.apply(this,Array.prototype.concat.apply([],stackingContextLinear).map(function(d){return +d})) : stackingSpan,
				gStackContext = gStackObj[data] || 0;
				doExistMode ? offset ? converted = stackingContextLinear.map(function(d,i){return [d[0]+offset+gStackContext,d[1]+offset+gStackContext]}) : converted = stackingContextLinear.map(function(d,i){return [d[0]+gStackContext,d[1]+gStackContext]}) : void(0);

				switch (gModeCondition) {
						case 0://no gMode,
							void(0);
							break;
						case 1://gMode, stack, no mode,
							converted = converted.map(function(u,w){return typeof u === "object" ? [u[0]+gStackObj[data],u[1]+gStackObj[data]] : u+gStackObj[data]});
							break;
						case 5://gMode, stack, mode,
							break;
						case 3://gMode, justify, no mode,
							converted = converted.map(function(u,w){return typeof u === "object" ? [u[0]+gStackObj[data],u[1]+gStackObj[data]] : u+gStackObj[data]});
							break;
						case 7://gMode, justify, mode,
							break;
				}
			
			var expanded = [].concat.apply([],converted.map(function(d,i){return [[d,"left"],[d,"right"]]}));
			var selection = viewportTemporary.selectAll("."+ID+"_ordinalSolidHighlights_"+dataU).data(expanded)
			.enter()
			.append("path")
			.attr("fill","none")
			.attr("stroke",function(){return returnColor("stroke",cState,isObjColors,cColors,colorsLength,order,data)})
			.attr("stroke-opacity",0.9)
			.attr("stroke-width",2)
			.attr("stroke-linecap","round")
			.attr("class",ID+"_ordinalSolidHighlights_"+dataU)
			.each(function(dd,ii){
				this.extend = extend.bind(this,order,dd,(cOrdinalMode ? stackingContextOrdinal[floor(ii/2)] : undefined),stackingSpan);
				this.shrink = shrink.bind(this,order,dd);
			});
			function extend(order,domainExpanded,$stackingContext,$stackingSpan) {
				if(!this.__pointData__) {
					var node = this.cloneNode();
					node.setAttribute("d",drawSolidCurve(order,domainExpanded[0],domainExpanded[1],scale,$stackingContext,$stackingSpan));
					var totalLength = node.getTotalLength();
					this.__pointData__ = [];
					this.__pointData__.totalLength = totalLength;
					for (var i=0,sampleD=3,point=node.getPointAtLength(0);i*sampleD<=totalLength;++i,point=node.getPointAtLength(i*sampleD)){
						this.__pointData__.push([point.x,point.y])
					}
				}
				var overhang = floor(((this.hasAttribute("d") ? this.getTotalLength() : 0)/this.__pointData__.totalLength)*this.__pointData__.length) || 1;
				d3.select(this)
				.attr("visibility","visible")
				.transition()
				.attrTween("d",function(){var length = this.__pointData__.length;return (function(t){return basis(this.__pointData__.slice(0,ceil(t*length+(1-t)*overhang)))}).bind(this)})
				.delay(0)
				.duration(250);
			}
			function shrink(order,domainExpanded){
				if(!this.__pointData__){return}
				var overhang = this.__pointData__.slice(0,floor((this.getTotalLength()/this.__pointData__.totalLength)*this.__pointData__.length) || 1);
				d3.select(this)//.classed(ID+"_ordinalSolidHighlights",false)
				.transition()
				.attrTween("d",function(){var length = overhang.length;return function(t){return basis(overhang.slice(0,ceil((1-t)*length+1)))}})
				.on("end",function(){
					d3.select(this).attr("visibility","hidden");
					//d3.select(this).remove()
				})
				.delay(0)
				.duration(round(overhang.length/this.__pointData__.length*1000));
			}
			function massExtend(){
				selection.each(function(){
					this.extend();
				})
			}
			function massShrink(){
				d3.selectAll("."+ID+"_ordinalSolidHighlights_"+dataU).each(function(){
					this.shrink();
				})
			}
			selection.__lexiconExtend__ =  massExtend;
			selection.__lexiconShrink__ =  massShrink;
			return viewportTemporary[data] = selection;
		}
		
		function sortObject (obj) {
			var arr = [];
			for (var i in obj) {
				var j = obj[i].intervals ? 
					typeof obj[i].intervals === "object" ? 
						reduceObj(obj[i].intervals) 
						: +obj[i].intervals 
					: typeof obj[i] === "object" ?
						reduceObj(obj[i])
						: +obj[i];
				arr.push([i,j]);
			}
			return arr.sort(function(a,b){return a[1]-b[1]}).map(function(d,i){return d[0]});
			
			function reduceObj (obj) {
				var objectified = obj.map(function(d,i){return typeof d === "object" ? d : [+d,+d]});
				var flattened = [].concat.apply([],objectified);
				for (var i = 0, total = 0;i<flattened.length;total += +flattened[i], ++i){}
				return total/i;
			}
		}
		
		function sortInterval (sortOpt,indexPlaceHolder,names,intervals) {
			var base = intervals.length;
			/*
			Below is an explanation of sort parameters, indexes are preserved, so the sorting should be stable.
				">" : sort ascending based on the maximum value of the array or the value.
				"<" : sort descending based on the maximum value of the array or the value.
				"|>|": sort ascending based on the interval of the array or 0 if primitive value.
				"|<|": sort descending based on the interval of the array or 0 if primitive value.
			*/
			switch(sortOpt) {
				case ">":
					return intervals
					.map(function(d,i){
						return typeof d === "object" ? [max.apply(this,d)*base+i,i,d] : [d*base+i,i,d];
					})
					.sort(function(a,b){
						return a[0] - b[0];
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
				case "<":
					return intervals
					.map(function(d,i){
						return typeof d === "object" ? [max.apply(this,d)*base+i,i,d] : [d*base+i,i,d];
					})
					.sort(function(a,b){
						return -a[0] + b[0];
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
				case "|>|":
					return intervals
					.map(function(d,i){
						return typeof d === "object" ? [abs(d[1]-d[0])*base+i,i,d] : [i,i,d];
					})
					.sort(function(a,b){
						return a[0] - b[0];
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
				case "|<|":
					return intervals
					.map(function(d,i){
						return typeof d === "object" ? [abs(d[1]-d[0])*base+i,i,d] : [i,i,d];
					})
					.sort(function(a,b){
						return -a[0] + b[0];
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
				case "s>":
					return intervals
					.map(function(d,i){
						return [names ? names[i] : names,i,d];
					})
					.sort(function(a,b){
						return +(a[0]>b[0]) || +(a[0]===b[0])-1;
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
				case "s<":
					return intervals
					.map(function(d,i){
						return [names ? names[i] : names,i,d];
					})
					.sort(function(a,b){
						return +(a[0]<b[0]) || +(a[0]===b[0])-1;
					})
					.map(function(d,i){
						indexPlaceHolder ? indexPlaceHolder[i] = d[1] : void(0);
						return d[2];
					})
			}
		}
		
		//subs, mostly from I-PV
		function warp (ID,width,height) {
			//console.log(ID+" "+width+" "+height+" !");
			d3.select("#"+ID).transition("adjustX").attr("x",function(){var x = parseInt(d3.select(this).attr("x"));return x-width/2;}).delay(0).duration(500);
			d3.select("#"+ID).transition("adjustY").attr("y",function(){var y = parseInt(d3.select(this).attr("y"));return y-height/2;}).delay(0).duration(500);
			d3.select("#"+ID).transition("adjustW").attr("width",width).delay(0).duration(500);
			d3.select("#"+ID).transition("adjustH").attr("height",height).delay(0).duration(500);
			//d3.select("#"+ID).transition("adjustFO").attr("fill-opacity",0.6).delay(0).duration(1000);
		}
		//bound unwarp, anti-warp
		this.unwarp = function (f) {
			var viewBox = d3.select("#"+ID).attr("viewBox");
			var viewBoxFinal = viewBox.split(" ").map(function(d,i){return d*100}).join(" ");
			d3.select("#"+ID).transition("shrink").on("end",function(){d3.select(this).remove();if(typeof f === "function"){return f.bind(_this_)();}}).tween("unwarp",function(){var thisNode = this; var interpolator = d3.interpolate(viewBox,viewBoxFinal);return function(t){thisNode.setAttribute("viewBox",interpolator(t))}}).delay(0).duration(3000);
			d3.select("#"+ID).transition("fadeAway").style("opacity",0).delay(0).duration(1000);
		}
		//disable iOS touchmove
		function disableScroll(el){
			d3.event.preventDefault();
			d3.event.stopPropagation();
		}
		//reEnable iOS touchmove
		function enableScroll(el){
		}
		//cleanHover
		function cleanHover(){
			if(currentHovered) {
				currentHovered.parentNode.removeChild(currentHovered);
				currentHovered = null;
			}
		}
		//return Color - I know function calls are expensive but I needed it for maintainability
		function returnColor(whatToReturn,cState,isObjColors,cColors,cColorsLength,i,d,ii,dd) {
			isObjColors = isObjColors || (cState ? typeof cColors[d] === "object" : false); 
			switch(whatToReturn) {
				case "ordinal":
					switch(((+cState)+(+isObjColors))*(+cState)) {
						case 0:
							return colorScale20(i,d);
						case 1:
							return cColors[d];
						case 2:
							return cColors[d][0];
					}
				case "linear":
					switch(((+cState)+(+isObjColors))*(+cState)) {
						case 0:
							return colorScale20(i,d,ii,dd);
						case 1:
							return cColors[d];
						case 2:
							var temp = cColors[d].slice(1,cColorsLength-1),
								tempLength = temp.length;
							return tempLength ? temp[ii % tempLength] : cColors[d][0];
					}
				case "stroke":
					switch(((+cState)+(+isObjColors))*(+cState)) {
						case 0:
							return colorScale20(i,d,ii,dd);
						case 1:
							return cColors[d];
						case 2:
							return cColors[d][cColorsLength-1];
					}
				case "partition":
					switch(((+cState)+(+isObjColors))*(+cState)) {
						case 0:
							return i & 1 ? "DarkGray" : "LightGray";
						case 1:
							return cColors[d];
						case 2:
							return cColors[d][0];
					}
			}
		}
		//coerce to number
		function coerceToNumber (arr){
			var l = arr.length;
			var v = undefined;
			for (var i = 0;i<l;++i){
				v = arr[i];
				typeof v === "object" ? 
					//v = [+v[0],+v[1]] : 
					(v[0] -= 0, v[1] -= 0) :
					arr[i] = +v;
			}
			return arr;
		}
		//restack Ordinal for negative values 
		function restackOrdinal (arr,step,span) {
			var l = arr.length;
			var v = undefined;
			var arr2 = [];
			for (var i = 0;i<l;v = arr[i],arr2[i] = abs(v[0]-v[1]),++i){}
			var c = 1/max.apply(this,arr2)*step;
			for (var i = 0, o = 0;i<l;v=arr2[i],arr2[i] = [o,o+v*c],o+= v*c,++i){}
			for (var i = 0, j = span/o;i<l;v=arr2[i],arr2[i] = [v[0]*j,v[1]*j],++i){}
			return arr2;
		}
		//run tests
		(function(){
			//DECLARE DEFAULTS
			_this_.passiveSupported = false;
		
			//test 1 - check if passive supported
			(function(){
				var options = Object.defineProperty({},"passive",{
					get: function(){
						_this_.passiveSupported = true;
					}
				})
				window.addEventListener("queryMakerTest",null,options);
			})();
		})()
	}
	var prt = LexiconRainbow.prototype;
	prt.version = "v0.0.8";
	prt.GUI = function(bool,o){
		switch(this.isAppended) {
			case false:
				if(!bool){
					this.getNSet.guiIsOn = false;
					this.setViewBox = guiOff;
					this.setCanvasDims = guiOffCanvas;
				} else {
					typeof bool !== "boolean" ? this.getNSet.guiColor = bool
					:void(0);
					this.setViewBox = guiOn;
					this.setCanvasDims = guiOnCanvas;
				}
				return this;
			case true:
				if(!bool){
					this.getNSet.guiIsOn = false;
					this.toggleGUI(false);
					this.setViewBox = guiOff;
					this.setCanvasDims = guiOffCanvas;
				} else {
					this.getNSet.guiIsOn = true;
					typeof bool !== "boolean" ? this.getNSet.guiColor = bool
					:void(0);
					this.toggleGUI(true);
					this.setViewBox = guiOn;
					this.setCanvasDims = guiOnCanvas;
				}
				var x = this.getNSet.attrX,
					y = this.getNSet.attrY,
					w = this.getNSet.attrW,
					h = this.getNSet.attrH,
					nViewBox = this.setViewBox(x,y,w,h);
					this.getNSet.canvas ? this.setCanvasDims(w,h) : void(0);
					d3.select("#"+this.lexID()).transition().attr("viewBox",nViewBox).delay(0).duration(1000);
				return this;
		}
		function guiOff (x,y,w,h){
			return (x+0.25*w+(o ? o.x || 0 : 0))+" "+(y+(o ? o.y || 0 : 0))+" "+(x+w*0.70+(o ? o.w || 0 : 0))+" "+(y+h+(o ? o.h || 0 : 0))
		}
		function guiOn (x,y,w,h){
			return (x+(o ? o.x || 0 : 0))+" "+(y+(o ? o.y || 0 : 0))+" "+(x+w+(o ? o.w || 0 : 0))+" "+(y+h+(o ? o.h || 0 : 0))
		}
		function guiOffCanvas(w,h){
			this.getNSet.canvas.attr("width",(w*0.70+(o ? o.w || 0 : 0))).attr("height",(h+(o ? o.h || 0 : 0)))
		}
		function guiOnCanvas(w,h){
			this.getNSet.canvas.attr("width",w).attr("height",h)
		}
	}
	return LexiconRainbow;
}));