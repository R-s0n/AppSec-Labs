#!/bin/bash
docker rm -f web_slippy
docker build --tag=web_slippy .
docker run -p 1337:1337 --rm --name=web_slippy web_slippy