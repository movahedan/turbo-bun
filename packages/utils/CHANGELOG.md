# Changelog - @repo/utils

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.2

<details>
<summary><strong>🔧 Improvements</strong> (Click to expand)</summary>

-  (root) delete logger package and move it to utils ([368e189](https://github.com/movahedan/turbo-bun/commit/368e189))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (root) change biome formatter linewidth => 100 ([7bac340](https://github.com/movahedan/turbo-bun/commit/7bac340))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/turbo-bun/commit/dee8e9a))  by **github-actions[bot]**

</details>

## v0.0.1

### 🚀 feature/auto-version <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/141"><img src="https://img.shields.io/badge/%23141-blue?style=flat" alt="#141" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

Pull Request Overview
This PR implements a comprehensive automated version management system that splits the monolithic version management approach into focused, single-purpose scripts with intelligent changeset creation and CI/CD integration.
Replaces manual version workflow with automated changeset creation based on affected packages
Introduces intelligent deployment analysis that filters packages by version fields
Integrates version management directly into GitHub Actions PR and main branch workflows
Split monolithic version.ts into focused single-purpose scripts
Add version-add-auto.ts for automated changeset creation
Add version-deploy.ts for deployment analysis
Add ci-attach-packages-to-deploy.ts for CI integration
Filter to only packages with version fields (exclude libraries)
Update GitHub Actions workflows to use new scripts
Merge version management documentation into comprehensive guide
Remove version fields from library packages
Update package.json scripts for new workflow
Delete old monolithic scripts and documentation
Implement dynamic scope generation from monorepo structure
Update commitlint to validate scopes against generated list
Update local-vscode.ts to sync scopes to both .vscode and devcontainer
Ensure scopes follow lowercase convention for commitlint compliance

<a href="https://github.com/movahedan/turbo-bun/commit/3f88ffc04e06191bbbd417317c1a835f08dfc31c"><img src="https://img.shields.io/badge/feat-3f88ffc-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 refactor/124-refactor-test-approach-use-bun-as-much-as-possible <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/135"><img src="https://img.shields.io/badge/%23135-blue?style=flat" alt="#135" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR centralizes test dependencies and configurations to improve maintainability and coverage reporting across the monorepo. The changes consolidate test-related dependencies into a centralized test-preset package and remove redundant test scripts.
Centralizes @happy-dom/global-registrator and testing dependencies in the test-preset package
Simplifies package.json scripts by removing redundant test:watch and test:coverage scripts
Adds comprehensive Card component tests achieving 100% coverage

<a href="https://github.com/movahedan/turbo-bun/commit/59b5ca582219cc4a5b1c6dac506dd91bd188175b"><img src="https://img.shields.io/badge/feat-59b5ca5-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 refactor/scripts <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/101"><img src="https://img.shields.io/badge/%23101-blue?style=flat" alt="#101" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/6%20commits-green?style=flat" alt="6 commits" style="vertical-align: middle;" />

Refactor/scripts

<a href="https://github.com/movahedan/turbo-bun/commit/7918ac8c6caeefe363cf84a2ec9c008b87fc0958"><img src="https://img.shields.io/badge/other-7918ac8-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ac5811dc8f75dca974c825f0d8eff9a99f4e6b1d"><img src="https://img.shields.io/badge/other-ac5811d-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ca4d376b6efa1b3235f18d1cfd86c0d5ad4db463"><img src="https://img.shields.io/badge/feat-ca4d376-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/afc4eabc246595f064cfdda1d58655c5eb6aeaae"><img src="https://img.shields.io/badge/docs-afc4eab-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4f67b605c04998a3778ebc7009b30e48f2f6d1e9"><img src="https://img.shields.io/badge/fix-4f67b60-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/b905c9da885644b41c7519efb189115b5bae3645"><img src="https://img.shields.io/badge/refactor-b905c9d-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 refactor/prod-containers <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/98"><img src="https://img.shields.io/badge/%2398-blue?style=flat" alt="#98" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

Refactor/prod containers

<a href="https://github.com/movahedan/turbo-bun/commit/a90f36f15fdb37c85c42d8b676c9359fea39e3d2"><img src="https://img.shields.io/badge/fix-a90f36f-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/f27bf7d0b510762ea017a819a07844107f8a4925"><img src="https://img.shields.io/badge/fix-f27bf7d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c478addc829a6966015b9da5983c3108dfc77e99"><img src="https://img.shields.io/badge/feat-c478add-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8fb473b07b3861e2b1cb5bfd2e705b34b629e1c4"><img src="https://img.shields.io/badge/feat-8fb473b-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/1faf557fc2aa0d972803bc7235ed95846330aa35"><img src="https://img.shields.io/badge/feat-1faf557-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/17ac6914f3bf5c156ddfdd8671e3474814c2f4f9"><img src="https://img.shields.io/badge/feat-17ac691-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5b982a0e845475b7ac94fe4821099e3c31064ca9"><img src="https://img.shields.io/badge/feat-5b982a0-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/deb6d84a1a60d705aa694863d3fd73edd3fc606d"><img src="https://img.shields.io/badge/feat-deb6d84-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🔧 feature/jit-and-compiled-packages <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/104"><img src="https://img.shields.io/badge/%23104-blue?style=flat" alt="#104" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor: setup just-in-time and compiled packages correctly
This pull request refactors the monorepo build system by implementing a just-in-time (JIT) compilation approach for packages instead of pre-compiled builds. It replaces the previous prebuild system with a unified build workflow script and switches from bundled TypeScript compilation to direct source imports.
Key changes:
Implements a new build workflow script that automates TypeScript compilation, Vite entry generation, and package.json export updates
Removes prebuild utilities and switches to JIT compilation with direct source imports
Consolidates TypeScript configurations using shared base configurations

<a href="https://github.com/movahedan/turbo-bun/commit/401a8647772c67221c40c052b2d64c1a0eb7ff0e"><img src="https://img.shields.io/badge/fix-401a864-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2e33ce4422edd74f481b2974d76da884c168b2c4"><img src="https://img.shields.io/badge/fix-2e33ce4-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8115c51045e1def1ec3b5007919031bbc940fd88"><img src="https://img.shields.io/badge/other-8115c51-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/18b49d28690adaac72adc38bf34be8cf39bd9fa9"><img src="https://img.shields.io/badge/refactor-18b49d2-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/migrate-jest-to-bun-test <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/85"><img src="https://img.shields.io/badge/%2385-blue?style=flat" alt="#85" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

This PR refactors the repository’s testing setup to migrate from Jest to Bun’s built-in test runner.
Removed Jest types, presets, dependencies, and scripts across packages.
Updated test files to import from bun:test and leverage Testing Library with Happy DOM.
Added Bun configuration (bunfig.toml) and custom test-preset modules for global setup and matchers.

<a href="https://github.com/movahedan/turbo-bun/commit/883d9e7d0f1697647ff38cad0b51d3461f506fe4"><img src="https://img.shields.io/badge/fix-883d9e7-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d12ed6060271524571583b50c40d6edad2ab3626"><img src="https://img.shields.io/badge/refactor-d12ed60-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/devcontainer-first-setup <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/82"><img src="https://img.shields.io/badge/%2382-blue?style=flat" alt="#82" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Adds initial devcontainer and Docker Compose configurations for hot-reload development, along with TypeScript project scaffolding and shared utility/UI packages.
Introduce .devcontainer/devcontainer.json and docker-compose.dev.yml for unified VS Code remote/container setup with hot reload.
Update Docker Compose and Next.js/Vite configs to enable polling-based file watching.
Scaffold @repo/utils and @repo/ui packages with TS configs, build scripts, and exports.
Reviewed Changes
Copilot reviewed 45 out of 47 changed files in this pull request and generated 3 comments.

<a href="https://github.com/movahedan/turbo-bun/commit/1d2158cb03464d560727fd0a10866d3496897895"><img src="https://img.shields.io/badge/fix-1d2158c-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/be88232a8ab25e549c71d63cb4059a13f111769c"><img src="https://img.shields.io/badge/fix-be88232-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fd9811114d62db9179b72c4da03d45b8eac10c4f"><img src="https://img.shields.io/badge/fix-fd98111-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/72468b1889c67f4f0fe6698b1df28e8f61c1c8f4"><img src="https://img.shields.io/badge/fix-72468b1-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c0efa5a9236b1d3e839b56ca328fcb617495bb61"><img src="https://img.shields.io/badge/fix-c0efa5a-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/e9905786b0955acb828a5e040a3eddc219df589e"><img src="https://img.shields.io/badge/fix-e990578-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/9b1ff79e0bea2c36ce293fb910751214ad6caa8e"><img src="https://img.shields.io/badge/fix-9b1ff79-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d2915ef3eb3990e0dc6ec49fa38f09fe272dd965"><img src="https://img.shields.io/badge/fix-d2915ef-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fb7b5e290fe4c20cf028bfc982f71c15ec579ce3"><img src="https://img.shields.io/badge/fix-fb7b5e2-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/eda1742af90892b4338cc6abf59658dd6b050c35"><img src="https://img.shields.io/badge/fix-eda1742-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fc95cb68a04df6dfb2a34647a94a94ab595cbed0"><img src="https://img.shields.io/badge/fix-fc95cb6-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/cfd942d5efc79f9058e1d90f77fdb5cd01949edc"><img src="https://img.shields.io/badge/feat-cfd942d-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/eb718b68cec4ab4301fc91eedd486320ad6fd94a"><img src="https://img.shields.io/badge/feat-eb718b6-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/f743e27a075dde96023b1e106116c541005d5c21"><img src="https://img.shields.io/badge/feat-f743e27-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/15dc0dacd97e9e002f45fec7ac5001d82343a46a"><img src="https://img.shields.io/badge/refactor-15dc0da-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/0d2a0a4b649f7a105439624b4cb6f018379cf47d"><img src="https://img.shields.io/badge/refactor-0d2a0a4-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/32b3680965e42587e7646f9691313442ddf54f5d"><img src="https://img.shields.io/badge/refactor-32b3680-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

<details>
<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>

- add version fields to utility packages and update versioning logic ([c27ebfd](https://github.com/movahedan/turbo-bun/commit/c27ebfd))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 8 package(s) ([548e261](https://github.com/movahedan/turbo-bun/commit/548e261))  by **github-actions[bot]**
- switch to 'bun test' globally and cleanup configuration ([8342e1a](https://github.com/movahedan/turbo-bun/commit/8342e1a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>

### 📦 renovate/tailwind-merge-3.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/111"><img src="https://img.shields.io/badge/%23111-blue?style=flat" alt="#111" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency tailwind-merge to v3

<a href="https://github.com/movahedan/turbo-bun/commit/ed85fae360071e1fdb73746d5a3c97777bfe4c0b"><img src="https://img.shields.io/badge/fix-ed85fae-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/clsx-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/87"><img src="https://img.shields.io/badge/%2387-blue?style=flat" alt="#87" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency clsx to v2.1.1

<a href="https://github.com/movahedan/turbo-bun/commit/971e5054eaaff211ffb54560545bd4de6739822b"><img src="https://img.shields.io/badge/fix-971e505-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

</details>


---

*This changelog was automatically generated using our custom versioning script* ⚡