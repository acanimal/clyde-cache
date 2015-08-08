"use strict";

var url = require("url"),
    NodeCache = require("node-cache");


/**
 * Redefines methods on the http.ServerResponse object to allows read response
 * content and headers.
 *
 * @param  {http.ServerResponse} res Server response reference
 * @returns {Object}     Object with `getData()` and `getHeaders()` methods.
 */
function wrapResponse(res) {

  var prefix = "clyde_memory_cache_";
  var data = "";
  var headers = {};

  // write
  res[prefix + "write"] = res.write;
  res.write = function(chunk, encoding, cb) {
    data += chunk;
    return res[prefix + "write"].call(res, chunk, encoding, cb);
  };

  // setHeader
  res[prefix + "setHeader"] = res.setHeader;
  res.setHeader = function(k, v) {
    headers[k] = v;
    return res[prefix + "setHeader"].call(res, k, v);
  };

  // removeHeader
  res[prefix + "removeHeader"] = res.removeHeader;
  res.removeHeader = function(k) {
    delete headers[k];
    return res[prefix + "removeHeader"].call(res, k, v);
  };

  // writeHead
  res[prefix + "writeHead"] = res.writeHead;
  res.writeHead = function(statusCode, reason, obj) {
    var hs = (typeof reason === "object") ? reason : obj, k;
    for (k in hs) {
      headers[k] = hs[k];
    }
    return res[prefix + "writeHead"].call(res, statusCode, reason, obj);
  };

  return {
    getData: function() {
      return data;
    },
    getHeaders: function() {
      return headers;
    }
  };
}

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
  // Cache object.
  var cache = new NodeCache(config);

  return function(req, res, next) {

    var parsedUrl = url.parse(req.url),
        key = config.ignoreQuery ? parsedUrl.pathname : parsedUrl.path;

    // Check if the given key exists in the cache
    cache.get(key, function(err, value) {
      if(!err) {
        if(typeof value === "undefined") {
          // Key not found

          // Wrap response to allow get content and headers.
          var resWrap = wrapResponse(res);
          // Set cache header
          res.setHeader("X-Cache", "MISS");

          // Once response is finished store data on cache
          res.on("finish", function() {
            cache.set(key, {
              statusCode: res.statusCode,
              headers: resWrap.getHeaders(),
              data: resWrap.getData()
            });
          });

          // Continue the middleware chain
          next();
        } else {
          // Key found

          // Set cache headers
          value.headers["X-Cache"] = "HIT";
          // Write data on the response stream and return response.
          res.writeHead(value.statusCode, value.headers);
          res.end(value.data);
        }
      }
    });

  };

};
