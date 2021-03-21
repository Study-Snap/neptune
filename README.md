<p align="center">
  <a href="#" target="blank"><img src="./.github/docs/media/studysnap.png" width="320" alt="StudySnap Logo" /></a>
</p>

<p align="center">Neptune</p>
    <p align="center">

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Lint and Unit Tests](https://github.com/Study-Snap/neptune/actions/workflows/test-unit-source.yml/badge.svg)](https://github.com/Study-Snap/neptune/actions/workflows/test-unit-source.yml)
[![Build and Push Docker](https://github.com/Study-Snap/neptune/actions/workflows/build-push-docker.yml/badge.svg)](https://github.com/Study-Snap/neptune/actions/workflows/build-push-docker.yml)
[![Lint and Scan Docker](https://github.com/Study-Snap/neptune/actions/workflows/lint-scan-docker.yml/badge.svg)](https://github.com/Study-Snap/neptune/actions/workflows/lint-scan-docker.yml)
[![E2E and Coverage](https://github.com/Study-Snap/neptune/actions/workflows/test-e2e-cov-source.yml/badge.svg)](https://github.com/Study-Snap/neptune/actions/workflows/test-e2e-cov-source.yml)
[![License](https://img.shields.io/badge/license-Apache2.0-blue.svg)](/LICENSE)

</div>

---

<p align="center">StudySnap's Primary Resource Service</p>
    <p align="center">

## Description

Neptune for StudySnap is the primary resource service for the StudySnap application. Use this to handle all sorts of note operations and also to provide searches through the note index.

## Useful Links

- The [Neptune Helm Chart](https://github.com/Study-Snap/charts/studysnap/neptune)
- This project tracks changes through its [CHANGELOG](/CHANGELOG)

## Prerequisites

This project requires some extra things to work on in development. In production, however, it should function on it's own given that you have the `studysnap_notedb` running in a postgres instance that is available to this application. In development, you will need

- **Preferrably** [Docker](http://docker.com) and/or [docker-compose](https://docs.docker.com/compose/). Note: Can be run without docker.
- Configured `.env` or `exported` environment variables according to the available configurations listed below.

### For production

- Suggested to use the associated [Helm Chart](https://github.com/Study-Snap/charts/studysnap/neptune) to deploy to k8s environment

## Available Configurations

Below is a list of available configuration options to customize the project. **Note:** These configuration options are available to be individually configured as per your environment (`development`, `test`, and `production`)

| Option                  | Description                                                                                              | Default                   | Optional |
|-------------------------|----------------------------------------------------------------------------------------------------------|---------------------------|----------|
| PORT             | Defines the port for the API to listen on                                                                | `5555`                    | Y        |
| MAX_REQUESTS            | Defines the maximum number of requests per 15 minutes (rate limiting)                                    | `250`                    | Y        |
| DB_DIALECT       | Specifies the type of database you wish to use in your implementation. Thanks to NestJS, this is optional, however there will be some limited extra setup required for anything other than `postgreSQL` | `postgres`                      | Y        |
| DB_HOST                | Specifies the database host address (IP or Domain) to reach the database                                | `localhost`               | N        |
| DB_PORT                | Specifies the port to reach the database host application                                                                    | `5432`                    | Y        |
| DB_USER                | The database user to authenticate to the database host                                                    | `NONE`                     | N        |
| DB_PASS            | The password to authenticate `$DB_USER`                                                             | `NONE`                     | N        |
| DB_NOTE_DATABASE       | The name of the Studysnap notes database where you will store your notes.                                                 | `studysnap_notedb`               | Y        |
| DB_RETRY_ATTEMPTS             | Number of times to retry a failed connection to the database configured.                                                                              | `2`                   | Y        |
| JWT_SECRET      | Used to cryptographically decode authentication (JWT) tokens sent to the Neptune service from clients.                                                                              | `NONE`                     | N        |
| FILE_STORE      | Specifies the location in the container/storage volume where to store and retrieve uploaded note data                                                                              | `/tmp`                     | N        |

> The current dev environment setup I have convieniently included in the `.env` file at the root of this project.

## Running the App

There are several ways to run Neptune, but these are the main ones

### Docker

From the project root, run the following.

```bash
# Run from published image
$ docker run -d -p 7777:7777 <config_other_options> studysnap/neptune:<version_tag>

# Build & Run Locally
$ docker build -t local/studysnap-neptune:latest .
$ docker run -d -p 7777:7777 <other_options> local/studysnap-neptune:latest

```
> Note: This will fail if you do not have the required [prerequisites](#prerequisites) running

### Standalone / Development

To set up this project for development, I have found a particular pattern to be most efficient and simple.

To start, I find that it's easiest to use [docker-compose](https://docs.docker.com/compose/) to start up the required dependencies such as the studysnap development authentication service (which is important over the use of production version in development of Neptune since we do not wish to clone the production secret for decoding Auth tokens in this development version).

```bash

# start the required services in a detached state
docker-compose -f docker-compose.dev.yml up -d

```

Once those are running as usual, prepare a `.env` file to handle some development properties

```raw

PORT=7777
DB_USER=studysnap
DB_PASS=snapstudy
DB_PORT=8888
JWT_SECRET=dev
FILE_STORE=./tmp/

```
> Note this is a really, REALLY weak JWT_SECRET, ensure in production to generate a much stronger secret.

After this, be sure to install the required project dependencies

```bash
$ npm install
```

then, run the project

```bash
# development
$ npm run start

# development with watch mode (recommended)
$ npm run start:dev

# production mode
$ npm run start:prod
```

Finally, with the services up and running, you can make changes and test using [postman](https://www.postman.com) or something similar to test authenticated/non-authenticated requests to Neptune.

## Running Tests

Running tests is automated through our CI/CD pipeline process, however, running them manually during development is super helpful! Here's how.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

We are currently using Helm to handle our deployment to our K8s Cluster. To manually deploy, we need to execute the following commands.

```bash

# Add the studysnap helm repository & Update
helm repo add studysnap https://study-snap.github.io/charts/
helm repo update

# Now install the neptune chart from the repository
helm install neptune studysnap/neptune [optional_flags]

```

> I personally recommend using [k8s Lens](http://k8slens.dev) to help visualize the deployment on the cluster

## Support

Create an **issue** in the StudySnap [Jira](http://studysnap.atlassian.net)

## Authors

- [Benjamin Sykes](https://sykesdev.ca)
- [Liam Stickney](https://github.com/LiamStickney)
- [Malik Sheharyaar Talhat](https://github.com/orgs/Study-Snap/people/maliksheharyaar)

## License

StudySnap is [Apache licensed](/LICENSE)
