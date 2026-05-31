# Contributing to SUKIT

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## Development Setup

```bash
git clone https://github.com/your-org/sukit.git
cd sukit
pnpm install
cp .env.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Code Style

- **TypeScript** strict mode enabled
- **ESLint** and **Prettier** — run `pnpm lint` before committing
- **Conventional commits** — see commit conventions below
- **Tests** — write tests for all new features and bug fixes

## PR Process

1. Ensure your code passes all checks: `pnpm lint && pnpm test`
2. Update documentation if adding new features
3. Add changeset: `pnpm changeset` (if applicable)
4. Request review from maintainers
5. Squash merge with a clean commit message

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, semicolons)
- `refactor:` — Code change that neither fixes nor adds
- `test:` — Adding or updating tests
- `chore:` — Build process, dependencies, tooling
- `perf:` — Performance improvement

Examples:

```
feat(builder): add responsive column resizing
fix(export): handle missing media files gracefully
docs: update deployment guide with Docker instructions
test(api): add integration tests for pages endpoint
```

## Code of Conduct

Be kind, respectful, and constructive. We welcome contributors of all levels.
