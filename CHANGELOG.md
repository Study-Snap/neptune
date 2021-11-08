# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0]

### Modified

- (SSPP-240): Fixed comparison function for note ranking by ratings
- (SSPP-247): Ensured any operations that return a note object also include author (user) data model in the response
- (SSPP-247): Documentation updated
- (SSPP-247): Implemented new tests to ensure proper functionality of user data model being included in note response objects
- (SSPP-285): Implemented new rating model to track ratings on notes

## [Released]

## [0.2.0]

### Added

- (cicd): All Github CI/CD workflows
- (dev): Development strategy using docker-compose with prerequisites
- (notes): Notes module started
- (docs): Added documentation
- (tests): Implemented E2E tests and coverage
- (SSPP-121): Create models for Notes
- (SSPP-133): Added e2e tests for available note CRUD operations
- (SSPP-151): Fixed issue with e2e testing environment due to misconfigured auth endpoint in `test/util/index.ts`.
- (cicd): Implemented test docker publish for the testing of deployments using a branched version of the image instead of production versions
- (SSPP-137): Implemented PDF parsing to extract note body for storage in note database
- (SSPP-148): Basic full-text search using elasticsearch
- (SSPP-148): Development and testing workflows for elasticsearch integration
- (SSPP-148/SSPP-151): Update README available configuration options
- (SSPP-167): Code quality updates and refactor
- (SSPP-192): Added support for classrooms and author information
- (SSPP-192): Implemented new test cases for new features
- (SSPP-242): Added API Tagging for Swagger documentation on all components of the API

### Modified

- (cicd): Fixed name and created `docker-compose.text.yml` for e2e testing environment setup.
- (SSPP-136): Refactored notes and files to be their own modules for better SoC
- (hotfix): Fixed pathing to work better in k8s deployment so as not to conflict with `studysnap/authentication` dependencies
- (SSPP-122): Fix issue pertaining to authentication on production database from neptune
- (REF-WORKFLOWS): Updated workflows to support better development flow and dev-prod separation
- (SSPP-193): Updated note schema to work with new classroom architecture
- (SSPP-208): Refactore scope of note controller functions to match classroom architecture privacy requirements
- (SSPP-192): Updated development and test compose environment configuration for classrooms compatibility

### Removed

- (dev): Removed all the old stuff from bootstrapped project
