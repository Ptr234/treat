# Dev Environment Setup — treat (OSC Digital Tool)

Set up on 2026-10-09. Open **`D:\treat-fresh`** in VS Code: it's a clean clone of
`github.com/Ptr234/treat` at commit `9e3db32`.

## Installed

| Tool | Version | Used for |
|---|---|---|
| .NET SDK | 8.0.425 | Backend (`backend/OscApi.sln`) |
| dotnet-ef | 8.0.31 | EF Core migrations |
| Node.js | 24.20.0 | Frontend (Next.js 15) |
| Python | 3.12.10 | QA scripts in `.qa/` |
| Docker Desktop | latest | Postgres via `docker-compose.yml` |
| Playwright Chromium | — | `npm run test:e2e` |

VS Code extensions: C# Dev Kit, ESLint, Prettier, Tailwind CSS, Jest, Playwright,
Python, Containers, Postgres, GitLens, GitHub Actions, dotenv, REST Client, Sanity,
EditorConfig, Error Lens, Pretty TS Errors.

## Verified working

- Frontend type-check (`npm run type-check`): 0 errors
- ESLint (`npm run lint`): no warnings or errors
- Jest (`npm test`): 110 of 110 tests passed
- Backend build (`dotnet build backend/OscApi.sln`): 0 errors

## Still to do (needs you as administrator)

1. Open an **administrator** terminal and run:
   ```
   wsl --install --no-distribution
   ```
2. **Restart the PC.**
3. Start **Docker Desktop** once and accept its terms.
4. In VS Code (`Ctrl+Shift+P` → *Tasks: Run Task*):
   1. **db: up (postgres)**: starts Postgres on `localhost:5432`
   2. **backend: ef migrate**: creates the database tables
5. Press `F5` with the **Full stack** debug config to start the API (opens Swagger)
   and the Next.js dev server (http://localhost:3000).

## VS Code tasks & debug configs (`.vscode/`, local only, gitignored)

- **Tasks:** `db: up` / `db: down`, `backend: build` / `test` / `ef migrate`,
  `frontend: dev` / `lint` / `type-check` / `test`
- **Debug:** `Backend: OscApi (.NET)`, `Frontend: Next.js (server)`,
  `Frontend: Chrome`, and the `Full stack` compound

## Manual commands

```bash
# Backend
cd backend/src/OscApi && dotnet run

# Frontend
cd frontend && npm run dev
```

## Notes

- **npm install scripts:** npm 11 blocks package install scripts by default. These
  were approved and recorded under `allowScripts` in `frontend/package.json`:
  esbuild, @tailwindcss/oxide, sharp, unrs-resolver, workerd. If `npm ci` warns
  about new ones after an upgrade, run `npm install-scripts approve <pkg>`.
- **Restart terminals:** open terminals (and VS Code) need a restart to pick up
  `dotnet` and `python` on the PATH.
- **Old folder `D:\treat`:** this copy is broken. Most of the frontend source is
  deleted from the working tree and the git history is corrupted ("Could not read
  a2a79f7…"). Git also listed changes to tracked files there, such as `README.md`
  and `frontend/doc_space/*`. Some may just be line-ending or file-permission
  differences. Check them and copy over anything you want to keep before you
  delete the old folder.
