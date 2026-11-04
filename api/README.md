w# api

Generated with **nest-project-kit** (NestJS 12).

## Stack

| Option                         | Choice                                 |
| ------------------------------ | -------------------------------------- |
| App type                       | api                                    |
| HTTP adapter                   | bun (third-party: nestjs-platform-bun) |
| Compiler                       | swc                                    |
| Validation                     | arktype                                |
| ORM / database                 | drizzle / PostgreSQL                   |
| Users + auth                   | no                                     |
| Password hashing               | argon2                                 |
| Cache                          | valkey                                 |
| Logger                         | pino                                   |
| Observability                  | none                                   |
| API docs                       | scalar                                 |
| Health / throttling            | yes / yes                              |
| Mail / storage / resilience    | yes / no / no                          |
| WebSockets                     | yes                                    |
| Security headers / CORS / CSRF | yes / yes / no                         |
| Containers / proxy             | podman / none                          |
| Format / lint                  | biome / biome                          |

## Getting started

```bash
bun install
bun run secrets check   # .env was generated for local development; template.env is the reference
bun run start:dev
```

| Command               | What it does                                   |
| --------------------- | ---------------------------------------------- |
| `bun run test`        | unit tests                                     |
| `bun run test:e2e`    | end-to-end tests of the HTTP pipeline          |
| `bun run typecheck`   | type-check without emitting                    |
| `bun run build`       | compile to dist/                               |
| `bun run start:dev`   | run with watch mode                            |
| `bun run start:prod`  | run the compiled app                           |
| `bun run db:generate` | generate migrations / client from the schema   |
| `bun run db:migrate`  | apply migrations                               |
| `bun run check`       | format check + lint (what CI runs)             |
| `bun run secrets`     | manage .env and deployment secrets (see below) |

## Configuration and secrets

- `template.env` lists every variable (committed). `.env` holds real values (ignored by git).
- Variables are validated at startup in `src/config/envs.schema.ts`; the app refuses to start with a bad `.env`.
- `bun run secrets init` creates `.env` with fresh random secrets, `bun run secrets check` validates it, and
  `bun run secrets sync docker|podman` turns it into deployment secrets.

## Bun runtime

This project runs on **Bun** through the third-party adapter
[`nestjs-platform-bun`](https://github.com/Zaki-goumri/nestjs-platform-bun), which is
not maintained by the NestJS team. Third-party pieces use Bun natively where possible
(`Bun.password` for hashing, `Bun.SQL`/`bun:sqlite` for Drizzle, Bun's Redis client for
the cache); official `@nestjs/*` integrations are used as-is.

## API documentation

Scalar is served at `/reference`.

## E-mail

Inject `Mailer` from `@nestjs/mail` and call `mailer.send({ to, subject, html })`. Without `SMTP_URL` e-mails are only logged.

## Podman

Rootless Podman with systemd Quadlet units (`quadlets/`). Replace `__PROJECT_DIR__` with the
absolute path of this project, then:

```bash
bun run secrets init          # once: .env with generated secrets
bun run secrets sync podman   # creates/replaces the podman secrets
mkdir -p ~/.config/containers/systemd && cp quadlets/* ~/.config/containers/systemd/
systemctl --user daemon-reload && systemctl --user start app
```
