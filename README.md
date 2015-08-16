# Memory Cache Filter

Memory cache filter implementation for Clyde API gateway.

> Implementation is based on [node-cache][node-cache] module.

The filter works as an in memory `<key, value>` cache. For each request it caches response content, headers and status code as the *value* and using the `url` as the *key*.

If the property `ignoreQuery=true` the *key* will contain only the `path` part of the `url` and will ignore the `query`, for example, these URLs will be treated as the same: `/some_path?param1=a&param2=b`, `/some_path?abc` or `/some_path`.

<!-- TOC depth:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Memory Cache Filter](#memory-cache-filter)
	- [Installation](#installation)
	- [Configuration](#configuration)
	- [Examples](#examples)
		- [Global cache with default configuration](#global-cache-with-default-configuration)
		- [Provider's cache ignoring URL query part and with a TTL of 5 minutes](#providers-cache-ignoring-url-query-part-and-with-a-ttl-of-5-minutes)
	- [Notes](#notes)
- [License](#license)
<!-- /TOC -->

## Installation

`npm install clydeio-memory-cache --save`

## Configuration

The memory cache filter accepts the next set of configuration options. Note, with the exception of `ignoreQuery` property all the rest properties are the same as the [node-cache][node-cache] module, because of this, the set of properties are passed directly to the internal module reference:

- `ignoreQuery`: *(default: `false`)* ignores the query part of the `url` when computing the cache `key`. Otherwise the full `url` is used.
- `stdTTL`: *(default: `0`)* the standard ttl as number in seconds for every generated cache element.  
`0` = unlimited
- `checkperiod`: *(default: `600`)* The period in seconds, as a number, used for the automatic delete check interval.  
`0` = no periodic check.  
**Note:** If you use `checkperiod > 0` you script will not exit at the end, because a internal timeout will always be active.
- `useClones`: *(default: `true`)* en/disable cloning of variables. If `true` you'll get a copy of the cached variable. If `false` you'll save and get just the reference.  
**Note:** `true` is recommended, because it'll behave like a sever-based caching. You should set `false` if you want to save complex varibale types like functions, promises, regexp, ...


## Examples

### Global cache with default configuration

```javascript
{
  "prefilters" : [
    {
      "id" : "memory-cache",
      "path" : "clydeio-memory-cache"
    }
  ],
  "providers": [
    ...
  ]
}
```

### Provider's cache ignoring URL query part and with a TTL of 5 minutes

```javascript
{
  "providers": [
    {
      "id" : "providerA",
      "context" : "/provider",
      "target" : "http://server_providerA",

      "prefilters" : [
        {
          "id" : "memory-cache",
          "path" : "clydeio-memory-cache",
          "config" : {
            "ignoreQuery" : true,
            "stdTTL" : 300
          }
        }
      ]
    }
  ]
}
```

## Notes

- Memory cache filter must be configured as a prefilter. Its is required to capture the requests before sent to the provider.

# License

The MIT License (MIT)

Copyright (c) 2015 Antonio Santiago (@acanimal)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[node-cache]: https://github.com/tcs-de/nodecache
