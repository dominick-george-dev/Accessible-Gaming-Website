#!/bin/bash
set -e

IMAGE_NAME=custom-jenkins
CONTAINER_NAME=jenkins-server

# Build the Jenkins image
echo "Building Jenkins Docker image..."
docker build -t $IMAGE_NAME .

# Create network if not exists
NETWORK=ci-network
docker network inspect $NETWORK >/dev/null 2>&1 || docker network create $NETWORK

echo "Starting Jenkins container..."
docker run -d \
  --name $CONTAINER_NAME \
  --network $NETWORK \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd)/id_rsa:/var/jenkins_home/.ssh/id_rsa:ro \
  -v $(pwd)/id_rsa.pub:/var/jenkins_home/.ssh/id_rsa.pub:ro \
  -v $(pwd)/authorized_keys:/var/jenkins_home/.ssh/authorized_keys:ro \
  $IMAGE_NAME

echo "Jenkins started at http://localhost:8080"