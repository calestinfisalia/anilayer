# Contributing

Thank you for considering a contribution to AniLayer.

## Before you start

- For significant changes or new features, open an issue first so the proposed direction can be discussed.
- Check existing issues and pull requests to avoid duplicating work.
- Code contributions must be compatible with GPL-3.0-or-later. For media or visual assets, include the source, owner, and redistribution license or permission; do not assume the code license covers assets.

## Workflow

1. Fork the repository and create a descriptive branch from `main`.
2. Install dependencies with `npm ci`.
3. Keep changes focused and follow the existing JavaScript patterns.
4. Run the relevant checks:

   ```powershell
   npm start
   npm run build
   ```

   Confirm the app opens and the relevant changes work. The project does not currently have automated tests.
5. Open a pull request against `main`. Include a summary, motivation, test steps, and screenshots for UI changes when relevant.

## Pull request guidelines

- Keep unrelated changes separate.
- Do not include `node_modules/`, build output in `dist/`, local configuration, credentials, or personal data.
- Describe changes that affect compatibility, privacy, or user-facing behavior.
- Ensure the CI workflow passes before requesting review.

By submitting a code contribution, you agree to license it under GPL-3.0-or-later. This does not automatically apply to media assets you submit; their permissions and terms must be documented separately.
