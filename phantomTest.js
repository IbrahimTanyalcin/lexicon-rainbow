var page = require('webpage').create();
page.open('./index_v33.html', function(status) {
  console.log("Status: " + status);
  if(status === "success") {
    page.render('test.png');
  }
  phantom.exit();
});