!function(){
	
	/*There are other parts of the DOM that get updated when events are
	triggered. Unfortunaley, that requires creating elements by js manually*/
	
	var script = document.createElement("script");
	setTimeout(function(){
		script.src = "https://rawgit.com/IbrahimTanyalcin/lexicon-rainbow/master/examples/AminoAcids/loadData.js";
		document.head.appendChild(script);
	},0);
	script.onload = function(){
		////////////////////////////////////////////////////////////////////
		/////////////////CREATE INSTANCE OF LEXICON RAINBOW/////////////////
		////////////////////////////////////////////////////////////////////

		(new LexiconRainbow)
			.container(rootDiv)
			.dispersion(0)
			.forceStyle()
			.w(600).h(200)
			.sW("100%").sH("auto")
			.position("relative")
			.sTop("0px")
			.sLeft("0px")
			.sMargin("0px auto 0px auto")
			//.handleEvent(handleEvent)
			.lexID("lexiconRainbow")
			.input(sample)
			.append()
			.render();

		////////////////////////////////////////////////////////////////////
		//////////////////////TO ATTACH THE HANDLER/////////////////////////
		////////////////////////////////////////////////////////////////////
		
		/*var topspan = document.getElementById("topSpan");
		var botspan = document.getElementById("botSpan");
		var moverspan = document.getElementById("moverSpan");
		
		function handleEvent (data,type,eventType) {
			switch (type) {
				case "onload":
					topSpan.textContent = data.ordinal.Info;
					botSpan.textContent = data.linear.Info;
					return;
				case "onhighlight":
					if(eventType==="mouseover") {
						var dd = typeof data.item === "object" ? "Value: "+Math.abs(data.item[1]-data.item[0]) : "Value: "+data.item;
						var name = typeof data.name !== undefined ? "Name: "+data.name+", " : "";
						moverspan.textContent = name+dd;
					} else {
						moverspan.textContent = " ";
					}
					return;
				case "onrenderLinear":
					botSpan.textContent = data.Info;
					return;
				case "onrenderOrdinal":
					topSpan.textContent = data.Info;
					return;
			}
		}*/
	};
}()