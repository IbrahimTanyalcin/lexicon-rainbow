var fs = require("fs");
fs.readFile("./test.png","binary",function(err,res){
	if (err) {
		console.log("cannot read file");
	} 
	console.log(res);
});
