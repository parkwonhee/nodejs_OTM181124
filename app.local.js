'user strict'
//서버 시작 js
const app = require('./app')
const port = process.env.PORT || 3000
var http = require('http');
//gyu

var server = http.createServer(app);


server.listen(port, function(){  
  console.log("Http server listening on port " + port);
});
