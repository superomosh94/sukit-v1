# SUKIT Marketplace

Community-contributed modules are hosted here as git submodules.

## Adding a module

1. Fork the marketplace repo
2. Add your module as a submodule: `git submodule add <your-repo-url> ./<module-name>`
3. Submit a PR

## Module requirements

- Must have a `manifest.json` following the SUKIT module spec
- Must have a `package.json` with `@sukit/core` as a peer dependency
- Must export a default `SukitModule`
