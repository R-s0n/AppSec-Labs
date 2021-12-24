#!/bin/bash
docker rm -f web_analyticalengine
docker build --tag=web_analyticalengine .
docker run -p 1337:80 -it --name=web_analyticalengine web_analyticalengine