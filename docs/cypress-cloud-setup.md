# Cypress Cloud — setup for testflow-cypress

## Is it free?

Yes — the **Starter** plan (formerly "Free") is **free forever** for personal and small projects.

| Starter (free) | Limit |
|----------------|-------|
| Test results | **500 / month** |
| Users | 50 |
| Parallelization | Yes |
| Test Replay | Yes |
| Data retention | ~30 days |

Paid **Team** starts at ~$67/month (flake detection, Jira, higher limits).

**Open source:** public repos can apply for the **OSS plan** (~100k results/month).  
This repo is **private** — OSS plan does not apply unless you make it public and get approved.

### Will this project fit 500/month?

Rough estimate: ~200+ tests × number of CI runs × parallel jobs.

Example: full regression matrix (10 jobs) × 10 runs/month ≈ 20k+ results → **exceeds Starter**.

**Practical use on Starter:**

- CI records **smoke**, **regression**, **component**, and the full **E2E parallel** run (2 containers)
- Monitor usage at https://cloud.cypress.io — reduce matrix containers or gate jobs if you exceed 500/month
- Keep **Mochawesome** as the HTML report artifact in GitHub Actions (already configured)

Official pricing: https://www.cypress.io/pricing

---

## Integration steps

### 1. Create a Cypress Cloud project

1. Go to https://cloud.cypress.io and sign in (GitHub recommended).
2. **Create project** → link repository `lflucasferreira/testflow-cypress`.
3. Copy **Project ID** and **Record Key**.

### 2. Add secrets (never commit the record key)

**GitHub** → repo → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `CYPRESS_RECORD_KEY` | Record key from Cloud |
| `CYPRESS_PROJECT_ID` | Project ID (optional if set in config) |

### 3. Configured in `cypress.config.js`

```javascript
projectId: 'jb6cfs',
```

Dashboard: https://cloud.cypress.io/projects/jb6cfs

### 4. Record runs

**Local (optional):**

```bash
export CYPRESS_RECORD_KEY=your-record-key

# Smoke only
npm run cy:run:smoke:cloud

# Full suite with Cloud parallel (single machine — use CI for true parallel)
npm run cy:run:cloud
```

**CI:** uses [`cypress-io/github-action@v7`](https://github.com/cypress-io/github-action) with `record: true` and `parallel: true` on the `cypress-run` job (matrix `containers: [1, 2]`). Smoke, regression, and component jobs record via `scripts/cy-run.sh` when `CYPRESS_RECORD_KEY` is set.

Required GitHub secret: `CYPRESS_RECORD_KEY`. The action also needs `GITHUB_TOKEN` (provided automatically).

Dashboard: https://cloud.cypress.io/projects/jb6cfs

### 5. Parallel runs

The `cypress-run` job splits all E2E specs across 2 parallel containers. Cypress Cloud coordinates load balancing when each container uses the same `--record`, `--parallel`, and CI build ID — handled automatically by `cypress-io/github-action`.

---

## Mochawesome vs Cypress Cloud

| | Mochawesome (this repo) | Cypress Cloud |
|--|-------------------------|---------------|
| Cost | Free | Starter free (500 results/mo) |
| HTML report | Yes (`cypress/reports/html/`) | Dashboard UI |
| Test Replay | No | Yes |
| Flake analytics | No | Paid (Team+) |
| Best for | CI artifacts, local HTML | Debug failures, parallelization |

Both can coexist: Mochawesome for HTML artifacts, Cloud for smoke/debug on Starter limits.
