# Setup
`npm install`

# Run Docs / Demos / Tests
* `npm start`

Demos:
* Visit http://localhost:4000/all/, Edit `src/scripts/demos.ts`

Tests: 
* See terminal for results, Edit tests

Docs: 
* Visit http://localhost:8080, Edit demo/README.md, then refresh the browser.

# Write Docs
* Edit `demo/README.md`

# Releasing
* Think if your change is `major (breaking api) / minor (potentially breaking but you tried your best not to) / patch (safe)`.
* See current version in `package.json` and update `CHANGELOG.md` adding the *planned release version* notes.
* Commit all your changes (including changelog)
* Run `npm version major|minor|patch`. It will automatically push to github, and travis will publish to npm.
