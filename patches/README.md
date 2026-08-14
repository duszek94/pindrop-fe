# pindrop-be editorial day plan

This cloud workspace only has write access to `pindrop-fe`. The matching backend change lives in this patch because pushing to `duszek94/pindrop-be` returned 403.

Apply on a checkout of `pindrop-be`:

```bash
git checkout -b cursor/editorial-day-plan-42aa
git am patches/pindrop-be-editorial-day-plan.patch
```

Copy the patch into the backend repo first, or run `git am` with the absolute path to this file.

What it adds:

- Flyway `V9__editorial_day_plan.sql` (`trip_day_plan`, `trip_day_block`, `trip_day_pin`, `trip_day_link`)
- `GET /api/trips/{id}/days`, `GET /api/trips/{id}/days/{n}`, `POST .../days/{n}/regenerate`
- Claude-first deep generation with playbooks, concreteness validator, Places enricher per pin
- Light proposals no longer persist template `Meal in {city}` slots
