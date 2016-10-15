# filoute
Filoute is a simple static server that uses phantomjs to create static HTML out of a javascript page.

##Getting started
To run the server simply place the server.js and render.js files in the root of your web application and issue the command 

`$ node server.js `

or 

`$ node server.js 1234 `

with "1234" being a custom port number"

Your web application will be served at http://localhost:8888 by default or http://localhost:1234 with "1234" being the custom port you passed.

`$ wget  http://localhost:1234/http://www.example.com/ `

##Requirement
 PhantomJs
 


