#!/usr/bin/env bash
# run e2e tests with services enabled

# wait for services to be available (elasticsearch primarily)
.github/scripts/service-check.sh localhost:9200 -s -t 30 -- echo "Elasticsearch service is up!"

# check es cluster health (req: green)
curl "http://localhost:9200/_cat/health" &> /dev/null
while [ $? -ne 0 ]; do
  echo "Elasticsearch not ready yet..."
  sleep 5
  curl "http://localhost:9200/_cat/health" &> /dev/null
done

if [ $? -ne 0 ]; then
  echo "Elasticsearch service apparently never started... cannot continue."
  exit 2
fi

# if everything is good we can start the tests
npm run test:e2e