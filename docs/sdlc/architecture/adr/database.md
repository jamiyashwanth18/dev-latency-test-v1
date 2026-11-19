<!-- sdlc:auto:start adr -->
# ADR-0003: Use PostgreSQL 16 for Database

Status: Accepted  
Date: 2026-11-19

## Context and Problem Statement

Which Database technology does the project use? Decided in architecture v1.

## Considered Options

- PostgreSQL 16
- MySQL
- SQLite

## Decision Outcome

Chosen option: PostgreSQL 16, because Enforces the relational model (users, reporting lines, requests, per-year balances, append-only audit) with transactional correctness for balance adjustments, and restricts sensitive sick-leave reasons to authorised roles.

## Consequences

A relational schema requires Alembic migrations as the model evolves, acceptable for the correctness guarantees it provides.
<!-- sdlc:auto:end adr -->