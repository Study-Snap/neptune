# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

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

### Modified

- (cicd): Fixed name and created `docker-compose.text.yml` for e2e testing environment setup.
- (SSPP-136): Refactored notes and files to be their own modules for better SoC
- (hotfix): Fixed pathing to work better in k8s deployment so as not to conflict with `studysnap/authentication` dependencies
- (SSPP-122): Fix issue pertaining to authentication on production database from neptune
- (REF-WORKFLOWS): Updated workflows to support better development flow and dev-prod separation

### Removed

- (dev): Removed all the old stuff from bootstrapped project
