#!/bin/bash
DOCKER_HOST=ssh://root@165.22.124.250 docker stack deploy -c docker-compose.yaml --with-registry-auth macro-tracker
