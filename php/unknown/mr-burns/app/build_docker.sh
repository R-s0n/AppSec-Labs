#!/bin/bash
docker rm -f mrburns
docker build -t mrburns . && \
docker run --name=mrburns --rm -p1337:80 -it mrburns