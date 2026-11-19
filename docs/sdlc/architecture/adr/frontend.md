<!-- sdlc:auto:start adr -->
# ADR-0001: Use React 19 for Frontend

Status: Accepted  
Date: 2026-11-19

## Context and Problem Statement

Which Frontend technology does the project use? Decided in architecture v1.

## Considered Options

- React 19
- Vue
- Svelte

## Decision Outcome

Chosen option: React 19, because Delivers the role-driven, stateful screens (request form, approval queue, calendar grid, HR admin) as one responsive codebase for desktop and mobile browsers, and stores the opaque session token to send as a bearer header.

## Consequences

A SPA needs the API base URL injected at build/deploy via VITE_API_BASE_URL and relies on server-side role checks since the client cannot be trusted for authorization.
<!-- sdlc:auto:end adr -->