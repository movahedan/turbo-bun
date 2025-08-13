# Changelog - @repo/test-preset

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.2

<details>
<summary><strong>🔧 Improvements</strong> (Click to expand)</summary>

-  (root) change biome formatter linewidth => 100 ([7bac340](https://github.com/movahedan/monobun/commit/7bac340))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/monobun/commit/dee8e9a))  by **github-actions[bot]**
-  (root) remove chalk form repo, write colorify instead ([20923ee](https://github.com/movahedan/monobun/commit/20923ee))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

## v0.0.1

### 🚀 feature/auto-version <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/141"><img src="https://img.shields.io/badge/%23141-blue?style=flat" alt="#141" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

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

<a href="https://github.com/movahedan/monobun/commit/3f88ffc04e06191bbbd417317c1a835f08dfc31c"><img src="https://img.shields.io/badge/feat-3f88ffc-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 refactor/124-refactor-test-approach-use-bun-as-much-as-possible <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/135"><img src="https://img.shields.io/badge/%23135-blue?style=flat" alt="#135" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR centralizes test dependencies and configurations to improve maintainability and coverage reporting across the monorepo. The changes consolidate test-related dependencies into a centralized test-preset package and remove redundant test scripts.
Centralizes @happy-dom/global-registrator and testing dependencies in the test-preset package
Simplifies package.json scripts by removing redundant test:watch and test:coverage scripts
Adds comprehensive Card component tests achieving 100% coverage

<a href="https://github.com/movahedan/monobun/commit/59b5ca582219cc4a5b1c6dac506dd91bd188175b"><img src="https://img.shields.io/badge/feat-59b5ca5-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 refactor/scripts <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/101"><img src="https://img.shields.io/badge/%23101-blue?style=flat" alt="#101" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/6%20commits-green?style=flat" alt="6 commits" style="vertical-align: middle;" />

Refactor/scripts

<a href="https://github.com/movahedan/monobun/commit/7918ac8c6caeefe363cf84a2ec9c008b87fc0958"><img src="https://img.shields.io/badge/other-7918ac8-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/ac5811dc8f75dca974c825f0d8eff9a99f4e6b1d"><img src="https://img.shields.io/badge/other-ac5811d-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/ca4d376b6efa1b3235f18d1cfd86c0d5ad4db463"><img src="https://img.shields.io/badge/feat-ca4d376-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/afc4eabc246595f064cfdda1d58655c5eb6aeaae"><img src="https://img.shields.io/badge/docs-afc4eab-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/4f67b605c04998a3778ebc7009b30e48f2f6d1e9"><img src="https://img.shields.io/badge/fix-4f67b60-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/b905c9da885644b41c7519efb189115b5bae3645"><img src="https://img.shields.io/badge/refactor-b905c9d-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/jit-and-compiled-packages <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/104"><img src="https://img.shields.io/badge/%23104-blue?style=flat" alt="#104" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor: setup just-in-time and compiled packages correctly
This pull request refactors the monorepo build system by implementing a just-in-time (JIT) compilation approach for packages instead of pre-compiled builds. It replaces the previous prebuild system with a unified build workflow script and switches from bundled TypeScript compilation to direct source imports.
Key changes:
Implements a new build workflow script that automates TypeScript compilation, Vite entry generation, and package.json export updates
Removes prebuild utilities and switches to JIT compilation with direct source imports
Consolidates TypeScript configurations using shared base configurations

<a href="https://github.com/movahedan/monobun/commit/401a8647772c67221c40c052b2d64c1a0eb7ff0e"><img src="https://img.shields.io/badge/fix-401a864-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/2e33ce4422edd74f481b2974d76da884c168b2c4"><img src="https://img.shields.io/badge/fix-2e33ce4-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88"><img src="https://img.shields.io/badge/other-8115c51-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/18b49d28690adaac72adc38bf34be8cf39bd9fa9"><img src="https://img.shields.io/badge/refactor-18b49d2-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/migrate-jest-to-bun-test <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/85"><img src="https://img.shields.io/badge/%2385-blue?style=flat" alt="#85" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

This PR refactors the repository’s testing setup to migrate from Jest to Bun’s built-in test runner.
Removed Jest types, presets, dependencies, and scripts across packages.
Updated test files to import from bun:test and leverage Testing Library with Happy DOM.
Added Bun configuration (bunfig.toml) and custom test-preset modules for global setup and matchers.

<a href="https://github.com/movahedan/monobun/commit/883d9e7d0f1697647ff38cad0b51d3461f506fe4"><img src="https://img.shields.io/badge/fix-883d9e7-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/d12ed6060271524571583b50c40d6edad2ab3626"><img src="https://img.shields.io/badge/refactor-d12ed60-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

<details>
<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>

- add version fields to utility packages and update versioning logic ([c27ebfd](https://github.com/movahedan/monobun/commit/c27ebfd))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 8 package(s) ([548e261](https://github.com/movahedan/monobun/commit/548e261))  by **github-actions[bot]**

</details>

<details>
<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>

### 📦 renovate/testing-library-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/114"><img src="https://img.shields.io/badge/%23114-blue?style=flat" alt="#114" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update testing-library monorepo

<a href="https://github.com/movahedan/monobun/commit/837f73d353ef194236754eabed548c40b84865ea"><img src="https://img.shields.io/badge/fix-837f73d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/major-18-happy-dom-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/109"><img src="https://img.shields.io/badge/%23109-blue?style=flat" alt="#109" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @happy-dom/global-registrator to v18

<a href="https://github.com/movahedan/monobun/commit/cd10284ee92a92634ce0d1b1c29dd01331e85844"><img src="https://img.shields.io/badge/fix-cd10284-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/pin-dependencies <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/102"><img src="https://img.shields.io/badge/%23102-blue?style=flat" alt="#102" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): pin dependencies

<a href="https://github.com/movahedan/monobun/commit/11276fceb1999b20e0dac295a564e7ec5704e6ee"><img src="https://img.shields.io/badge/fix-11276fc-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

</details>


---

*This changelog was automatically generated using our custom versioning script* ⚡