<!-- sdlc:auto:start adr -->
# ADR-0004: Use AWS for Cloud

Status: Accepted  
Date: 2026-11-19

## Context and Problem Statement

Which Cloud technology does the project use? Decided in architecture v1.

## Considered Options

- AWS
- Azure
- GCP

## Decision Outcome

Chosen option: AWS, because Pins all personal and health data to one EU region with encryption at rest/in transit and IAM access controls, meeting GDPR-aligned handling while running a small footprint for tens of users.

## Consequences

AWS scale far exceeds the need, so deployment is deliberately minimal (small Fargate tasks, single RDS instance) to control cost.
<!-- sdlc:auto:end adr -->