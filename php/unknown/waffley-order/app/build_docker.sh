#!/bin/bash
docker build -t web_waffley_order .
docker run --name=web_waffley_order --rm -p1337:80 -it web_waffley_order