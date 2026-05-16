# Contributing to Open Tanggan

Thank you for your interest in contributing to Open Tanggan! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in Issues
- Provide a clear description of the bug
- Include steps to reproduce
- Specify your environment (Node version, OS, browser)

### Suggesting Features

- Check if the feature has already been suggested
- Explain the use case and why it would be useful
- Link to related issues if applicable

### Code Contributions

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feat/your-feature`
3. **Install dependencies**: `pnpm install`
4. **Make your changes** following the code style (see below)
5. **Test locally**: `pnpm dev`
6. **Commit with clear message**: `git commit -m "feat: add new feature"`
7. **Push and create a Pull Request**

## Code Style

- Use **TypeScript** for all new code
- Follow **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `test:`
- Keep components under 150 lines
- No premature abstractions — write code once before refactoring
- Use Zod schemas for validation
- Use TanStack Query for client data fetching

## Project Structure

- `/types/index.ts` — Shared types (one file)
- `/schemas/index.ts` — Zod validation (one file)
- `/server/utils/` — Data access layer (families.ts, members.ts, etc.)
- `/server/api/` — API endpoints
- `/queries/` — TanStack Query hooks
- `/components/` — Vue components
- `/pages/` — Routes

## KISS Principles

This project prioritizes clarity over cleverness:

- One way to do things
- Flat structure over nested
- No "BaseX" or generic abstractions
- Each entity has exactly one place for: types, schemas, server utils, queries
- Boring code wins

## Testing

Before submitting a PR:

- [ ] Code runs without errors
- [ ] No TypeScript warnings
- [ ] Tested locally with `pnpm dev`
- [ ] Tested in mobile view (360px width)
- [ ] Form validation works
- [ ] Error handling works

## PR Checklist

- [ ] Tests pass
- [ ] No console errors
- [ ] Commit messages follow Conventional Commits
- [ ] Changes are documented (README, comments if needed)
- [ ] No breaking changes (or clearly noted)

## Questions?

- Open an issue or discussion
- Ask in GitHub Discussions (preferred for questions)

---

**Made with ❤️ for Indonesian RW communities**
