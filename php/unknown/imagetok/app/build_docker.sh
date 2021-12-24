#!/bin/bash
docker rm -f imagetok
docker build -t imagetok . && \
docker run --name=imagetok --rm -p1337:80 -it imagetok