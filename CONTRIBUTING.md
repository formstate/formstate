# Setup
`npm install`

# Run Demos
* `npm start`
* visit http://localhost:4000/demos/
* Edit `src/scripts/demos.ts`

# Write Docs
* Edit `demo/README.md`

# Releasing
* Think if your change is `major (breaking api) / minor (potentially breaking but you tried your best not to) / patch (safe)`.
* See current version in `package.json` and update `CHANGELOG.md` adding the *planned release version* notes.
* Commit all your changes (including changelog)
* Run `npm version major|minor|patch`. It will automatically push to bamboo and bamboo will pulish to nexus.
