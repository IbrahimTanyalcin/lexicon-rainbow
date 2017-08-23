var fs = require("fs");
fs.readFile("./test.png","utf8",function(err,res){
	if (err) {
		console.log("cannot read file");
	} 
	var base64 = new Buffer(res,"binary").toString("base64");
	console.log(base64);
});
