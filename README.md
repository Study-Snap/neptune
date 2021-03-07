# Neptune

Neptune for StudySnap is the primary resource server for the StudySnap application. Use this to handle all sorts of note operations and also to provide searches through the note index.

## Getting Started

### Development

To set up this project for development, I have found a particular pattern to be most efficient and simple.

To start, I find that it's easiest to use [docker-compose](https://docs.docker.com/compose/) to start up the required dependencies such as the studysnap development authentication server (which is important over the use of production version in development of Neptune since we do not wish to clone the production secret for decoding Auth tokens in this development version).

```bash

# start the required services in a detached state
docker-compose -f docker-compose-dev.yml up -d

```

Once those are running as usual, prepare a `.env` file to handle some development properties

```raw

PORT=7777
DB_USER=studysnap
DB_PASS=snapstudy
DB_PORT=8888
JWT_SECRET=dev

```
> Note this is a really, REALLY weak JWT_SECRET, ensure in production to generate a much stronger secret.

After this, start Neptune in development mode

```bash

npm run start:dev

```

Finally, with the services up and running, you can make changes and test using [postman](https://www.postman.com) or something similar to test authenticated/non-authenticated requests to Neptune.

