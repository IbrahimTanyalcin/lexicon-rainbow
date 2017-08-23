var page = require('webpage').create();
page.viewportSize = {width: 1000,height: 500};
var runner = new taskRunner;
runner
.queue('./tests/index_v3.html')
.queue('./tests/index_v4.html')
.run();

function taskRunner () {
	var that = this;
	var testCount = -1;
	this.tasks = [];
	Object.defineProperty(this,
		"fetch",
		{
			get: function(){
				return this.tasks.pop();
			},
			enumerable:true,
			configurable:false,
		}
	);
	this.queue = function(q){this.tasks.push(q); testCount++; return this;};
	this.run = function(){
		page.open(that.fetch, function(status) {
			console.log("Status: " + status);
			if(status === "success") {
				setTimeout(function(){
					page.render('./test.'+testCount+'.png');
					var base64 = page.renderBase64("PNG");
					console.log(base64);
					console.log("Test rendered successfully..");
					testCount--;
					if (that.tasks.length) {
						that.run();
					} else {
						console.log("Last test was run. Exiting");
						phantom.exit();
					}
				},120000)
			} else {
				phantom.exit(1);
			}
		});
	}
}