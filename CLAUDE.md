# Notes for Claude

- Use Bun for everything. Node is not set up on this machine.
- The game is 2.5D survival in the browser: three.js, fixed isometric camera, low-poly art made in code.
- Run it with `preview_start` and the name `this-day`. It serves on http://localhost:5174.
- Code is split into small files, in folders by domain. See [CODING_STANDARDS.md](CODING_STANDARDS.md).
- Build test-first. Run `bun run check` and `bun test` before you finish. The pre-commit hook runs both.
