
!function(){
	////////////////////////////////////////////////////////////////////
	/////////////////////////A MINIMAL DATASET//////////////////////////
	////////////////////////////////////////////////////////////////////

	var sample = {
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
	};

	////////////////////////////////////////////////////////////////////
	/////////////////////////CREATE AN INSTANCE/////////////////////////
	////////////////////////////////////////////////////////////////////
	(new LexiconRainbow)
	.container(rootDiv)
	.forceStyle()
	.w(600)
	.h(200)
	.sW("1000px")
	.sH("auto")
	.position("relative")
	.sTop("0px")
	.sLeft("0px")
	.sMargin("100px auto 0px auto")
	.lexID("lexiconRainbow")
	.input(sample)
	.append(true)
	.render();
}()
