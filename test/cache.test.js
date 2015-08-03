"use strict";

var path = require("path"),
    request = require("supertest"),
    http = require("http"),
    clyde = require("clyde");


describe("cache", function() {

  var server;

  afterEach(function() {
    server.close();
  });


  it("should success applying default cors options", function(done) {
    var options = {
      port: 8888,
      logfile: path.join(__dirname, "..", "tmp", "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "cors",
          path: path.join(__dirname, "../lib/index.js")
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://server"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(options.port);

    // Make request which expects a provider not found error
    request("http://localhost:8888")
      .get("/foo")
      .expect("Access-Control-Allow-Origin", "*")
      .expect(404, done);
  });

  it("should success applying cors for a given origin", function(done) {
    var options = {
      port: 8888,
      logfile: path.join(__dirname, "..", "tmp", "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "cors",
          path: path.join(__dirname, "../lib/index.js"),
          config: {
            origin: "http://localhost"
          }
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://server"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(options.port);

    // Make request which expects a provider not found error
    request("http://localhost:8888")
      .get("/foo")
      .expect("Access-Control-Allow-Origin", "http://localhost")
      .expect(404, done);
  });

  it("should success applying cors on preflight operation", function(done) {
    var options = {
      port: 8888,
      logfile: path.join(__dirname, "..", "tmp", "clyde.log"),
      loglevel: "info",

      prefilters: [
        {
          id: "cors",
          path: path.join(__dirname, "../lib/index.js"),
          config: {
            methods: ["POST"]
          }
        }
      ],

      providers: [
        {
          id: "id",
          context: "/provider",
          target: "http://server"
        }
      ]
    };

    // Create server with clyde's middleware options
    var middleware = clyde.createMiddleware(options);
    server = http.createServer(middleware);
    server.listen(options.port);

    // Make request which expects a provider not found error
    request("http://localhost:8888")
      .options("/provider")
      .expect("Access-Control-Allow-Origin", "*")
      .expect("Access-Control-Allow-Methods", "POST")
      .expect(204, done);

  });

});
