#!/usr/bin/env bash
# run e2e tests with services enabled

set -e pipefail

# wait for services to be available (elasticsearch primarily)
.github/scripts/service-check.sh localhost:9200 -s -t 30 -- echo "Elasticsearch service is up!"

if [ curl "http://localhost:9200/_cat/health" >/dev/null 2>&1 ]; then
  sleep 15
fi

if [ $? -ne 0 ]; then
  echo "Elasticsearch service apparently never started... cannot continue."
  exit 2
fi

# if everything is good we can start the tests
npm run test:e2e