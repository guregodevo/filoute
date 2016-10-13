"use strict";
var system = require('system'),
    fs = require('fs'),
    page = new WebPage(),
    url = system.args[1],
    headers,
    result,
    redirectURL = null;

page.open(url, function (status) {
    if (status !== 'success') {
      console.log('Error: Cannot load the url' + url);
      phantom.exit();
    } else {
      result = page.evaluate(function(){
          var html, doc;
  
          html = document.querySelector('html');

          return html.outerHTML;
      });
      console.log(result);
    }
    phantom.exit();
});
