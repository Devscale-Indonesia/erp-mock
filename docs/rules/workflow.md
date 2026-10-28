# Workflow rules

- Branch from `main`. Keep a change to one feature or one fix.
- Before you open a PR, run:
  - `npm run typecheck`
  - `npm run build`
  - `npm run e2e`, then attach the HTML report (`e2e/report`) and its screenshots to the PR as proof
  - `npm run dev`, then open the pages you touched
- Schema change: include the generated migration in the same PR, and run `npm run db:migrate` locally.
- There is no automated test suite yet. Say in the PR how you verified the change.
- Commit messages: imperative, short subject, body explains why. Say in the PR which decision or product doc applies, if any.
- New architectural choice: add a decision record in `docs/decision/` as part of the PR.
- Product behaviour change: update the matching file in `docs/product/` as part of the PR.
