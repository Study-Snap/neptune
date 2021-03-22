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

### Modified

- (cicd): Fixed name and created `docker-compose.text.yml` for e2e testing environment setup.
- (SSPP-136): Refactored notes and files to be their own modules for better SoC
- (hotfix): Fixed pathing to work better in k8s deployment so as not to conflict with `studysnap/authentication` dependencies

### Removed

- (dev): Removed all the old stuff from bootstrapped project
