#!/usr/bin/env bash

set -u

docker run -p 5194:5194 \
       --platform linux/amd64 \
       -e DATABASE_NAME \
       -e DATABASE_USERNAME \
       -e DATABASE_HOST \
       -e DATABASE_PASSWORD \
       -e NODE_ENV \
       -e PORT=5194 \
       $@
