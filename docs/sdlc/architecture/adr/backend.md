<!-- sdlc:auto:start adr -->
# ADR-0002: Use FastAPI 0.115 for Backend

Status: Accepted  
Date: 2026-11-19

## Context and Problem Statement

Which Backend technology does the project use? Decided in architecture v1.

## Considered Options

- FastAPI 0.115
- Flask
- Django REST Framework

## Decision Outcome

Chosen option: FastAPI 0.115, because Expresses the leave rules as a small set of typed endpoints -- working-day counting, balance deduction, overlap flagging, manager-only-on-reports, over-balance blocking and audit writes -- with Pydantic validation and automatic OpenAPI docs.

## Consequences

Being async and stateless, session state and all business logic live in PostgreSQL rather than in-process, which is the correct boundary here.
<!-- sdlc:auto:end adr -->