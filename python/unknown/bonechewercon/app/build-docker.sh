#!/bin/bash
docker rm -f bonechewercon
docker build --tag=bonechewercon .
docker run -p 1337:80 --rm --name=bonechewercon -it bonechewercon