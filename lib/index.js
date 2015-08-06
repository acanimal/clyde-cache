"use strict";

var NodeCache = require("node-cache");


/**
 * Memory cache filter
 *
 * @public
 * @param  {String} id Identifier of the filter
 * @param  {Object} config JavaScript object with filter configuration
 * @returns {Function} Middleware function implementing the filter.
 */
module.exports.init = function(id, config) {

  // Ensure we have a config object
  config = config || {};

  var cache = new NodeCache(config);
  cache = {};

  return function(req, res, next) {

    var key = req.url;
    console.log("-> key: ", key);

    // cache.get(key, function(err, value) {
      // if(!err) {

        var value = cache[key];
        if(typeof value === "undefined") {
          // Key not found
          console.log("---> CACHE (MISS) passing request...");
          res.setHeader("X-Cache", "MISS");

          res.on("finish", function() {
            console.log("--FINISH--");
            console.log("--> Status: ", res.statusCode);
            console.log("--> Arguments: ", arguments);

            // cache.set(key, res);
            cache[key] = res;
          });

          next();
        } else {
          // Key found
          console.log("---> CACHE (HIT) returning value...");
          res = value;
          res.setHeader("X-Cache", "HIT");
          res.end();
        }
    //   }
    // });

  };

};
