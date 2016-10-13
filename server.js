var http = require("http"),
    url = require("url"),
    spawn = require('child_process').spawn,
    port = (process.argv[2] || 8888);

http.createServer(function(request, response) {

  var uri = url.parse(request.url, true).query.url;

  if (uri) {
    //user told us their uri in the GET request, ex: http://localhost:8888/?url=http%3A%2F%2Fwww.example.com 
    console.log('Request at ' + new Date());
    console.log('url ' + uri);
    response.headers = {
     'Cache': 'no-cache',
     'Content-Type': 'text/html'
    };
  
    phantom = spawn('phantomjs', ['--ssl-protocol=any','--load-images=false','render.js', uri]);

    phantom.stdout.on('data', function (data) {
     response.write(data, "utf8");
    });
    phantom.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });

    phantom.on('exit', function (code) {
      response.end();
      console.log('child process exited with code ' + code);
    });
  } else {
     response.statusCode = 403;
     response.write('bad request'); 
     response.end();

  }
}).listen(parseInt(port, 10));


console.log("Running on http://localhost:" + port + " \nCTRL + C to shutdown");

