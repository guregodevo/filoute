"use strict";
var system = require('system'),
    fs = require('fs'),
    page = new WebPage(),
    url = system.args[1],
    rsces = [],
    har,
    result;

var ajaxMimeType = ["image","css","javascript","font"];


if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}


function createHAR(address, title, startTime, resources)
{
    var entries = [];
    if (resources) {
      resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;
 
        if (!request || !startReply || !endReply) {
            return;
        }
        // Exclude Data URI from HAR file because
        // they aren't included in specification
        if (request.url && request.url.match(/(^data:image\/.*)/i)) {
            return;
	}
        
        for (var i = 0; i < ajaxMimeType.length; i++) { 
          if (resource.contentType && resource.contentType.indexOf(ajaxMimeType[i]) > -1) {
            return;
         }
        }
        
        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            },
            pageref: address
        });
      });
    }
    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: page.endTime - page.startTime
                }
            }],
            entries: entries
        }
    };
}


page.onResourceRequested = function (req) {
   rsces[req.id] = {
       request: req,
       startReply: null,
       endReply: null
   };
};

page.onResourceReceived = function (res) {
   //console.log('Response (#' + res.id + ', stage "' + res.stage + '"): ' + JSON.stringify(res)); 
   if (res.contentType) {
      rsces[res.id].contentType = res.contentType;
   }
   if (res.stage === 'start') {
      rsces[res.id].startReply = res;
   }
   if (res.stage === 'end') {
      rsces[res.id].endReply = res;
   }
};

page.open(url, function (status) {
    if (status !== 'success') {
      console.log('Error: Cannot load the url ' + url);
      phantom.exit();
    } else {
      var startTime = new Date();
      var title = page.evaluate(function () {
        return document.title;
      });
      har = createHAR(url, title, startTime, rsces);
      console.log(JSON.stringify(har, undefined, 4));            
    }
    phantom.exit();
});
