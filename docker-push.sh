#!/usr/bin/env bash

# Ensure the ECR repo exists
aws lambda invoke --cli-binary-format raw-in-base64-out \
    --function-name arn:aws:lambda:us-east-1:381491931109:function:ensure-ecr-repo \
    --payload '{ "repository": "rcrf/portal-patient-backend" }' \
    docker-image.out

# Log in to Docker
aws ecr get-login-password | docker login --username AWS --password-stdin 381491931109.dkr.ecr.us-east-1.amazonaws.com

docker push $@
