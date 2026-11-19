# Runbook

> Maintained by QuorQ AI SDLC. Text between `sdlc:auto` markers is regenerated; anything outside them is yours and is kept.

<!-- sdlc:auto:start health -->
- Backend: `https://32-190-6-179.sslip.io/apps/2719c341de04/health`
- Frontend: https://p2719c341de04.d3j61xaup4zgrx.amplifyapp.com
<!-- sdlc:auto:end health -->

<!-- sdlc:auto:start deploy -->
Push to `main` to run `.github/workflows/deploy.yml`, or start a deployment from the platform's Deployment tab.
<!-- sdlc:auto:end deploy -->

<!-- sdlc:auto:start rollback -->
Redeploy the last good version from the platform's Deployment tab, or revert the offending commit on `main` — the workflow redeploys.

**Last live version:** 9ebe10f9dc8c (`9ebe10f`)
<!-- sdlc:auto:end rollback -->

<!-- sdlc:auto:start recent-failures -->
| Date | Version | Summary |
|---|---|---|
| 2026-11-19 | b509746a3384 | The container could not be started: `docker run -d --name aisdlc-2719c341de04-api --network ai-sdlc_ai_sdlc --restart unless-stopped --memory 512m --cpus 0.5 --env-file /var/folders/q1/l2zsbxkd5v7175b8yz675bt80000gp/T/aisdlc-env-8dlno6j0 030157669144.dkr.ecr.us-east-1.amazonaws.com/aisdlc-2719c341de04:b509746a3384af201913850cadcef6be8cd77294` failed (125): WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested 7b7b469bbaadbee5be544440fce51de851955fa4aa06f2a6348dc2015a948ad6 docker: Error response from daemon: failed to set up container networking: network ai-sdlc_ai_sdlc not found  Run 'docker run --help' for more information |
<!-- sdlc:auto:end recent-failures -->

## Contacts and escalation

_Add on-call contacts here — this section is never overwritten._
