# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [0.3.3]

### Added

- (SSPP-302): Documentation to all functions to make auto-complete more useful when modifying the application

### Fixed

- (SSPP-308): fixed boolean logic on average rating calculation to avoid bad values (*important!*)
- (SSPP-308): Added check to ensure rating is integer
- (SSPP-301): Fixed issue where old note (pre-update) was being returned when a new rating was added or updated on the note. This resulted in potentially old data being used in the response that does not contain the latest known ratings
- (develop): *hotfix* to Dockerfile to support legacy peer dependencies. (Note: will keep looking for real solution this is just a workaround)

## [0.3.2] - Hotfix

### Fixed

- (SSPP-298): Fixed issue where classroom deletion was not able to cascade deletion to notes contained within.
- (SSPP-298): Applied fix to note ratings to also cascade delete when a note is deleted or a user who left the rating is deleted

## [0.3.1] - Hotfix

### Fixed

- (SSPP-300): Fixed validation issues for classroom creation
- (add): Additional fixes for validation issues that may be present on note creation similar to SSPP-300

## [0.3.0]

### Added

- (SSPP-239): Additional fields for Note model

    - note_abstract: A small 120 or less word snippet from the note file

    - note_cdn: The full CDN path including protocol for the note file (pdf) which can be used from client to directly stream the file

- (SSPP-239): Support for Digital Ocean Spaces (S3-compatible object storage)
- (SSPP-239): Configuration options to extend S3 functionality with **optional** classroom thumbnails
- (SSPP-239): Added additional checks to remove any stale files from S3 storage
- (SSPP-263): Implemented destroy classroom on owner leave (automatically)
- (SSPP-285): Implemented new rating model to track ratings on notes
- (SSPP-285): Added note rating controller functions to the note controller that uses the `ratingsService` in conjunction with other note helpers

### Modified

- (SSPP-240): Fixed comparison function for note ranking by ratings
- (SSPP-247): Ensured any operations that return a note object also include author (user) data model in the response
- (SSPP-247): Documentation updated
- (SSPP-247): Implemented new tests to ensure proper functionality of user data model being included in note response objects
- (SSPP-239): A number of note operations and file service functions were impacted.
- (SSPP-239): Refactored note helper/service functions + File service functions
- (SSPP-239): Config options updated to replace local file storage with S3
- (SSPP-294): Fixed bug introduced with rating function in `SSPP-285` in `notes/helper/index.ts`

### Removed

- (SSPP-239): Local file storage is completely remove now and replaced by Cloud S3 storage

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
