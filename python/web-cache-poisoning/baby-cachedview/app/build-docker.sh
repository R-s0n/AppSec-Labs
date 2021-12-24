#!/bin/bash
docker build --tag=baby_cachedview .
docker run -p 80:80 --name=baby_cachedview --rm baby_cachedview