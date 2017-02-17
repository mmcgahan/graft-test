# Load testing

The `tests/` directory contains a `runServer` script that will mock external
network calls to enable load testing. It will not build the server, but after
building the server once, you can run

```sh
$ yarn run start:mock
```

to start the mocked server in the current terminal window.

The command to perform the minimal required build is

```sh
$ yarn run build:locales en-US && yarn run build:server
```

Load testing can be done simply with Apache Bench, which provides a CLI called
`ab` that should be run in a separate terminal window - it is installed by
default in most \*NIX systems. The main flags to use
are `-c` to define the number of concurrent connections and `-n` to set the
total number of HTTP requests to make.

**Example**

```sh
$ ab -c 50 -n 500 -H "Accept-Encoding: gzip,deflate" "http://beta2.dev.meetup.com:8000/"

This is ApacheBench, Version 2.3 <$Revision: 1748469 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking beta2.dev.meetup.com (be patient)
Completed 100 requests
Completed 200 requests
Completed 300 requests
Completed 400 requests
Completed 500 requests
Finished 500 requests


Server Software:
Server Hostname:        beta2.dev.meetup.com
Server Port:            8000

Document Path:          /
Document Length:        10048 bytes

Concurrency Level:      50
Time taken for tests:   13.155 seconds
Complete requests:      500
Failed requests:        448
   (Connect: 0, Receive: 0, Length: 448, Exceptions: 0)
Total transferred:      5475879 bytes
HTML transferred:       5024879 bytes
Requests per second:    38.01 [#/sec] (mean)
Time per request:       1315.542 [ms] (mean)
Time per request:       26.311 [ms] (mean, across all concurrent requests)
Transfer rate:          406.49 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.4      0       2
Processing:   735 1312 188.8   1245    1834
Waiting:      735 1306 187.5   1240    1821
Total:        736 1313 189.2   1245    1834

Percentage of the requests served within a certain time (ms)
  50%   1245
  66%   1267
  75%   1355
  80%   1417
  90%   1818
  95%   1826
  98%   1831
  99%   1833
 100%   1834 (longest request)
```

## TODO

1. Change setup so that mock API server runs in a separate process that can be killed

  The current setup uses two connections on a single Hapi instance to simulate
  the app server and the REST API server, which probably reduces performance

2. Expand mock API server with more endpoints and more accurate responses

