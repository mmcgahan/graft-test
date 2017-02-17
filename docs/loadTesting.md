# Load testing

The `tests/` directory contains a `runServer` script that will mock external
network calls to enable load testing. It will not build the server, but after
building the server once, you can run

## Setup

### Set config

The main configuration is in `tests/mockConfig.js` - you can tweak the
performance characteristics of the mock system to test different response
time scenarios.

### Build the app server application

The command to perform the minimal required build is

```sh
$ yarn run build:locales en-US && yarn run build:server
```

_This is not necessary if you've run `yarn start` recently_

### Start the mock app server

Start the mocked server in the current terminal window

```sh
$ yarn run start:mock
```

When you start the server, the console will print a URI that you can open in
Chrome that will allow devtools to monitor the server, including console logs
_code execution profiles_, and breakpoint-based debugging.

```
To start debugging, open the following URL in Chrome:
    chrome-devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:9229/e7fea70f-4cd8-4df4-848b-c660c9208a55
```

### Start the mock API server

In a new terminal window

```sh
$ yarn run start:mockApi
```

## Run the load test

Load testing can be done simply with Apache Bench, which provides a CLI called
`ab` that should be run in a separate terminal window - it is installed by
default in most \*NIX systems. The main flags to use are:

- `-c <number>`: set the number of concurrent connections
- `-n <number>`: set the total number of HTTP requests to make.
- `-l`: ignore variable length responses - content-length problem is not a
  failure

**Example**

```sh
$ ab -l -c 100 -n 500 "http://beta2.dev.meetup.com:8000/"
This is ApacheBench, Version 2.3 <$Revision: 1748469 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

# ...

Concurrency Level:      100
Time taken for tests:   8.791 seconds
Complete requests:      500
Failed requests:        0
Total transferred:      25874018 bytes
HTML transferred:       25412518 bytes
Requests per second:    56.88 [#/sec] (mean)
Time per request:       1758.179 [ms] (mean)
Time per request:       17.582 [ms] (mean, across all concurrent requests)
Transfer rate:          2874.29 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.7      0       2
Processing:  1094 1646 295.3   1615    2096
Waiting:     1094 1646 295.3   1615    2096
Total:       1094 1646 295.5   1616    2097

Percentage of the requests served within a certain time (ms)
  50%   1616
  66%   1700
  75%   1963
  80%   2036
  90%   2058
  95%   2082
  98%   2091
  99%   2094
 100%   2097 (longest request)
```

## TODO

1. Expand mock API server with more endpoints and more accurate responses
2. Vary the response times so that each set of concurrent requests don't all
  start and end at the same time
3. Use `forever` to make it easier to start & stop the two servers
4. Script everything, including `ab`, possibly with an interactive command line

