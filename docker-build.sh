#!/usr/bin/env bash

set -u

GIT_SHA=`git rev-parse --short HEAD`
GIT_REV=`git rev-list --count HEAD`

GIT_PORCELAIN=`git status --porcelain`
if [ ! -z "$GIT_PORCELAIN" ]; then
    GIT_DIRTY="-dirty"
else
    GIT_DIRTY=""
fi

GIT_FULL_BRANCH=`git name-rev --name-only HEAD`

GIT_BRANCH=$(echo $GIT_FULL_BRANCH | sed 's|remotes/origin/||')

GIT_PADDED_VERSION_NUMBER=`printf %05d $GIT_REV`

GIT_VERSION=$GIT_PADDED_VERSION_NUMBER-$GIT_BRANCH-$GIT_SHA$GIT_DIRTY

export DOCKER_IMAGE=381491931109.dkr.ecr.us-east-1.amazonaws.com/rcrf/portal-patient-backend:$GIT_VERSION

docker build . \
       -t $DOCKER_IMAGE \
       --platform linux/amd64

