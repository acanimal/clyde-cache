"use strict";

var path = require("path"),
    request = require("supertest"),
    http = require("http"),
    clyde = require("clydeio");


describe("cache", function() {

  var server;

  afterEach(function() {
    server.close();
  });


  it("should return data from cache", function(done) {
    var options = {
      port: 8888,
      logfile: path.join(__dirname, "..", "tmp", "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "cache",
          path: path.join(__dirname, "../lib/index.js")
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://localhost:4000"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(options.port);

    // Make request which expects a 404 erro
    request("http://localhost:8888")
      .get("/provider?query=1")
      // .expect("X-Cache", "HIT")
      // .expect(200, "cache data")
      .end(function(err, res) {
        if (err) {
          throw err;
        }
        console.log("-> response headers: ", res.headers);

        request("http://localhost:8888")
          .get("/provider?query=1")
          // .expect("X-Cache", "HIT")
          // .expect(200, "cache data")
          .end(function(err2, res2) {
            if (err2) {
              throw err2;
            }
            console.log("-> response headers: ", res2.headers);
            done();
          });
      });
  });

});
