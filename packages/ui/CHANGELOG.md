# Changelog - @repo/ui

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.2

<details>
<summary><strong>🔧 Improvements</strong> (Click to expand)</summary>

-  (root) change biome formatter linewidth => 100 ([7bac340](https://github.com/movahedan/turbo-bun/commit/7bac340))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/turbo-bun/commit/dee8e9a))  by **github-actions[bot]**
-  (root) remove chalk form repo, write colorify instead ([20923ee](https://github.com/movahedan/turbo-bun/commit/20923ee))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

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

### 🚀 refactor/remove-remix <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/130"><img src="https://img.shields.io/badge/%23130-blue?style=flat" alt="#130" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/7%20commits-green?style=flat" alt="7 commits" style="vertical-align: middle;" />

This PR removes the Remix-based blog app from the monorepo and refactors the UI package to use Storybook instead of a complex Vite build system. The change simplifies the overall architecture by eliminating the intermediate blog application and repositioning the UI package as a development-focused component library with Storybook for documentation and testing.
Key changes:
Removal of the entire blog application and its dependencies
Replacement of the complex Vite library build system with a simpler Storybook-based development workflow
Addition of new UI components (Card, Input, Label, LoginForm) with comprehensive Storybook stories and tests

<a href="https://github.com/movahedan/turbo-bun/commit/53e5f0b932cd8c5280dcc4b980e06940447cf095"><img src="https://img.shields.io/badge/feat-53e5f0b-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2479cd9efa6504be4d6c372f8053ccea98eb6813"><img src="https://img.shields.io/badge/feat-2479cd9-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ca0d900a4d8b9da0d77e878d8292db5105847202"><img src="https://img.shields.io/badge/fix-ca0d900-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7"><img src="https://img.shields.io/badge/other-6951a0a-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb"><img src="https://img.shields.io/badge/other-97c1df1-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/f07da1ef0c41a4d12b4e1d7de3c6635be6839a29"><img src="https://img.shields.io/badge/refactor-f07da1e-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/0cae23cf964c6b97939a70a4135c2fe5657a992b"><img src="https://img.shields.io/badge/refactor-0cae23c-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 refactor/scripts <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/101"><img src="https://img.shields.io/badge/%23101-blue?style=flat" alt="#101" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/6%20commits-green?style=flat" alt="6 commits" style="vertical-align: middle;" />

Refactor/scripts

<a href="https://github.com/movahedan/turbo-bun/commit/7918ac8c6caeefe363cf84a2ec9c008b87fc0958"><img src="https://img.shields.io/badge/other-7918ac8-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ac5811dc8f75dca974c825f0d8eff9a99f4e6b1d"><img src="https://img.shields.io/badge/other-ac5811d-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ca4d376b6efa1b3235f18d1cfd86c0d5ad4db463"><img src="https://img.shields.io/badge/feat-ca4d376-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/afc4eabc246595f064cfdda1d58655c5eb6aeaae"><img src="https://img.shields.io/badge/docs-afc4eab-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4f67b605c04998a3778ebc7009b30e48f2f6d1e9"><img src="https://img.shields.io/badge/fix-4f67b60-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/b905c9da885644b41c7519efb189115b5bae3645"><img src="https://img.shields.io/badge/refactor-b905c9d-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 refactor/prod-containers <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/98"><img src="https://img.shields.io/badge/%2398-blue?style=flat" alt="#98" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

Refactor/prod containers

<a href="https://github.com/movahedan/turbo-bun/commit/a90f36f15fdb37c85c42d8b676c9359fea39e3d2"><img src="https://img.shields.io/badge/fix-a90f36f-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/f27bf7d0b510762ea017a819a07844107f8a4925"><img src="https://img.shields.io/badge/fix-f27bf7d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c478addc829a6966015b9da5983c3108dfc77e99"><img src="https://img.shields.io/badge/feat-c478add-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8fb473b07b3861e2b1cb5bfd2e705b34b629e1c4"><img src="https://img.shields.io/badge/feat-8fb473b-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/1faf557fc2aa0d972803bc7235ed95846330aa35"><img src="https://img.shields.io/badge/feat-1faf557-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/17ac6914f3bf5c156ddfdd8671e3474814c2f4f9"><img src="https://img.shields.io/badge/feat-17ac691-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5b982a0e845475b7ac94fe4821099e3c31064ca9"><img src="https://img.shields.io/badge/feat-5b982a0-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/deb6d84a1a60d705aa694863d3fd73edd3fc606d"><img src="https://img.shields.io/badge/feat-deb6d84-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 feature/dockerization <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/42"><img src="https://img.shields.io/badge/%2342-blue?style=flat" alt="#42" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

Feature/dockerization

<a href="https://github.com/movahedan/turbo-bun/commit/1e3ae1db93aca2b21e6a827fe0557fa78a724a53"><img src="https://img.shields.io/badge/fix-1e3ae1d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/16d7c742102eee58690f5ec69fb40c6cc598ced4"><img src="https://img.shields.io/badge/fix-16d7c74-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f"><img src="https://img.shields.io/badge/other-fe34ea1-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/755ad952e3fc1390a3610e3214cd78915097820b"><img src="https://img.shields.io/badge/other-755ad95-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fe90004d6fc68a7a3062fa37f3036b67847888c6"><img src="https://img.shields.io/badge/feat-fe90004-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5a709470fc276c17010e61c8790a81e5d385792d"><img src="https://img.shields.io/badge/feat-5a70947-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4794db73818a44a95b01b476863c4aa09472a784"><img src="https://img.shields.io/badge/feat-4794db7-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/0b308eda80c2e7dd0889cf746781333cc4b0cdb3"><img src="https://img.shields.io/badge/ci-0b308ed-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/dff2aa9c8974f629c5999b32ae89a7e8dca95a8f"><img src="https://img.shields.io/badge/feature-dff2aa9-495057?style=flat&logoColor=white" alt="feature" style="vertical-align: middle;" /></a>

### 🔄 refactor/dev-setup <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/137"><img src="https://img.shields.io/badge/%23137-blue?style=flat" alt="#137" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

This PR refactors the development setup to improve containerization and environment configuration management. The changes focus on standardizing port configurations, removing hardcoded values, and streamlining Docker and DevContainer workflows.
Removed hardcoded ports and host configurations from Dockerfiles and configuration files
Standardized environment variable handling using Docker Compose env_file directives and centralized configuration
Updated port mappings with UI service moving from port 3006 to 3004 for consistency

<a href="https://github.com/movahedan/turbo-bun/commit/7f8d42874bb50752593c5032599b3572eef784fa"><img src="https://img.shields.io/badge/docs-7f8d428-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2c06a882125fbf3dcc977d0f67b1c4cf0a1ed748"><img src="https://img.shields.io/badge/docs-2c06a88-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d1e9699b3c58eb9ab3ce35f72e760157e44050b0"><img src="https://img.shields.io/badge/chore-d1e9699-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c6ead2e5f8643f45e073e53934639555220ff5b6"><img src="https://img.shields.io/badge/chore-c6ead2e-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4a25790eeddf8b5f788389b6a13509ef7660497e"><img src="https://img.shields.io/badge/refactor-4a25790-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/e14a5c4cfb5cf0b5e88b1f4e07996e9349fe88e9"><img src="https://img.shields.io/badge/refactor-e14a5c4-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/571cc9b91cd8611b0d79013069e3194cbc0a6926"><img src="https://img.shields.io/badge/refactor-571cc9b-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2f55972a0f657053f6619009e19058ebec2e1c7f"><img src="https://img.shields.io/badge/refactor-2f55972-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔄 refactor/dev-container-again <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/113"><img src="https://img.shields.io/badge/%23113-blue?style=flat" alt="#113" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

refactor(ci): improve dev container and ci infrastructure
This PR refactors CI infrastructure and dev container setup, introducing new Docker compose parsing utilities and improving script organization. Key changes include replacing legacy GitHub output scripts with improved alternatives, adding comprehensive service information extraction tools, and enhancing the development environment with better Docker configuration.
Introduces new docker-compose-parser.ts utility for centralized Docker compose file parsing
Replaces two legacy GitHub output scripts with improved github-attach-* alternatives
Adds comprehensive get-service-info.ts script for service information extraction
Commits:
refactor docker-compose service parsing with new docker-compose-parser utility
replace attach-affected-to-github-output with improved get-affected-services script
replace attach-service-ports-to-github-output with github-attach-service-ports
add comprehensive get-service-info script for service information extraction
enhance dev container setup with improved docker configuration
update package.json dependencies across apps and packages
add test task to ui package turbo configuration
add comprehensive documentation for ai development workflow
improve script organization and error handling throughout

<a href="https://github.com/movahedan/turbo-bun/commit/c9389ce1c4ab7a6263c95807433dac1360fed182"><img src="https://img.shields.io/badge/fix-c9389ce-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/cb007d365a004cac98fde0e0f91c7b7e5d4f1fd8"><img src="https://img.shields.io/badge/fix-cb007d3-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/1e58d9ab5a12cf547d515b063e4d3d14c27a2c32"><img src="https://img.shields.io/badge/fix-1e58d9a-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d78411cc4a47aa55618f63b43a0b207685134dbb"><img src="https://img.shields.io/badge/refactor-d78411c-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/be285b2ff570c8b48c4414ec656a42b9c73a942b"><img src="https://img.shields.io/badge/refactor-be285b2-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/306bfa5ea2c580f34cbb6a2fd6094d1d7d017091"><img src="https://img.shields.io/badge/refactor-306bfa5-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/06df6bb8259c9af8e979357bf3ca4e9f780946f7"><img src="https://img.shields.io/badge/refactor-06df6bb-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/45613c70db6516cd26051614fd3112937787c4e4"><img src="https://img.shields.io/badge/refactor-45613c7-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8156cb38bd4d7628ccdba5a72138d8b6ae9d8536"><img src="https://img.shields.io/badge/docs-8156cb3-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a>

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

### 🔧 fix/sonar-issues <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/11"><img src="https://img.shields.io/badge/%2311-blue?style=flat" alt="#11" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR addresses SonarCloud issues by updating component prop type annotations to use Readonly and refining the environment variable handling for port configuration.
Updated prop types of components in UI, Storefront, and Blog applications
Changed port assignment to use the nullish coalescing operator for improved default handling

<a href="https://github.com/movahedan/turbo-bun/commit/c667136e2f2b93d1dc9221b9fe66e2913e037eac"><img src="https://img.shields.io/badge/fix-c667136-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

<details>
<summary><strong>✨ Features</strong> (Click to expand)</summary>

-  (repo) install renovate and pin dependencies ([70cbb66](https://github.com/movahedan/turbo-bun/commit/70cbb66))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) install biome v2.0.0-beta.2 ([b56dfdc](https://github.com/movahedan/turbo-bun/commit/b56dfdc))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (create-turbo) apply package-manager transform ([b28af67](https://github.com/movahedan/turbo-bun/commit/b28af67))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)
-  (create-turbo) create kitchen-sink ([d585c01](https://github.com/movahedan/turbo-bun/commit/d585c01))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)

</details>

<details>
<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>

-  (ui) linter issues ([a457bd5](https://github.com/movahedan/turbo-bun/commit/a457bd5))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📚 Documentation</strong> (Click to expand)</summary>

-  (repo) add build-vite-library documentation ([6714f9d](https://github.com/movahedan/turbo-bun/commit/6714f9d))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 8 package(s) ([548e261](https://github.com/movahedan/turbo-bun/commit/548e261))  by **github-actions[bot]**
- switch to 'bun test' globally and cleanup configuration ([8342e1a](https://github.com/movahedan/turbo-bun/commit/8342e1a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add changessets for version management ([0f8fd5c](https://github.com/movahedan/turbo-bun/commit/0f8fd5c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>

### 📦 Dependencies

-  (deps) update react monorepo (#129) ([0d5d249](https://github.com/movahedan/turbo-bun/commit/0d5d249))  by **renovate[bot]**
-  (deps) update react monorepo to v19.1.1 (#127) ([c99b138](https://github.com/movahedan/turbo-bun/commit/c99b138))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.19 (#95) ([7588cfa](https://github.com/movahedan/turbo-bun/commit/7588cfa))  by **renovate[bot]**
-  (deps) pin dependency class-variance-authority to 0.7.1 (#83) ([0ce49cf](https://github.com/movahedan/turbo-bun/commit/0ce49cf))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.18 (#80) ([82bf395](https://github.com/movahedan/turbo-bun/commit/82bf395))  by **renovate[bot]**
-  (deps) update dependency bunchee to v6.5.4 (#76) ([7342dea](https://github.com/movahedan/turbo-bun/commit/7342dea))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.17 (#74) ([253eeac](https://github.com/movahedan/turbo-bun/commit/253eeac))  by **renovate[bot]**
-  (deps) update dependency bunchee to v6.5.3 (#68) ([c2810ca](https://github.com/movahedan/turbo-bun/commit/c2810ca))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.16 (#67) ([79402b7](https://github.com/movahedan/turbo-bun/commit/79402b7))  by **renovate[bot]**
-  (deps) lock file maintenance shared packages (#38) ([49a8b60](https://github.com/movahedan/turbo-bun/commit/49a8b60))  by **renovate[bot]**
-  (deps) lock file maintenance shared packages (#31) ([fbfb1ae](https://github.com/movahedan/turbo-bun/commit/fbfb1ae))  by **renovate[bot]**
-  (deps) remove @types/node from package.json files ([09970cb](https://github.com/movahedan/turbo-bun/commit/09970cb))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/132"><img src="https://img.shields.io/badge/%23132-blue?style=flat" alt="#132" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19.1.1

<a href="https://github.com/movahedan/turbo-bun/commit/b3740352cd0b4158b41ebec58be9f8a502ea48e4"><img src="https://img.shields.io/badge/fix-b374035-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/testing-library-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/114"><img src="https://img.shields.io/badge/%23114-blue?style=flat" alt="#114" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update testing-library monorepo

<a href="https://github.com/movahedan/turbo-bun/commit/837f73d353ef194236754eabed548c40b84865ea"><img src="https://img.shields.io/badge/fix-837f73d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/110"><img src="https://img.shields.io/badge/%23110-blue?style=flat" alt="#110" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7.0.6

<a href="https://github.com/movahedan/turbo-bun/commit/aa35a7801a768e5d4ae54f87214054fd82fedfb5"><img src="https://img.shields.io/badge/chore-aa35a78-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/106"><img src="https://img.shields.io/badge/%23106-blue?style=flat" alt="#106" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7

<a href="https://github.com/movahedan/turbo-bun/commit/65e18b0b06160f54c31a15f2d29291002830d98e"><img src="https://img.shields.io/badge/chore-65e18b0-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/bunchee-6.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/84"><img src="https://img.shields.io/badge/%2384-blue?style=flat" alt="#84" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency bunchee to v6.5.4

<a href="https://github.com/movahedan/turbo-bun/commit/4f9083522cdc1b0f782b626e53befd609102b181"><img src="https://img.shields.io/badge/chore-4f90835-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/major-19-react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/100"><img src="https://img.shields.io/badge/%23100-blue?style=flat" alt="#100" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19 (major)

<a href="https://github.com/movahedan/turbo-bun/commit/f071983d01d2691a75fec2b4a0e0cf118b489ce3"><img src="https://img.shields.io/badge/fix-f071983-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/65"><img src="https://img.shields.io/badge/%2365-blue?style=flat" alt="#65" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

Renovate/turbo monorepo

<a href="https://github.com/movahedan/turbo-bun/commit/080630deb09826b97e97f010e0b67b88706b83fe"><img src="https://img.shields.io/badge/chore-080630d-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/22ba1f963013b1d92cbc1d0287eb4846a5a3996b"><img src="https://img.shields.io/badge/chore-22ba1f9-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/51"><img src="https://img.shields.io/badge/%2351-blue?style=flat" alt="#51" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @types/react to v18.3.23

<a href="https://github.com/movahedan/turbo-bun/commit/fa5c795d0ab5e0e93fa70f7b56137cbd43226c2b"><img src="https://img.shields.io/badge/fix-fa5c795-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/55"><img src="https://img.shields.io/badge/%2355-blue?style=flat" alt="#55" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.15

<a href="https://github.com/movahedan/turbo-bun/commit/67c7ebd7a97fb3d524208baa63af062db3cabeb3"><img src="https://img.shields.io/badge/chore-67c7ebd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/cdcc2fd0a5bef213e7a662b3df55aa9977dddbf6"><img src="https://img.shields.io/badge/chore-cdcc2fd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 refactor/optimize-docker-files <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/63"><img src="https://img.shields.io/badge/%2363-blue?style=flat" alt="#63" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/3%20commits-green?style=flat" alt="3 commits" style="vertical-align: middle;" />

This PR refactors and optimizes the Dockerfiles across multiple apps and updates dependency configurations and setup scripts. Key changes include:
Updating base images in Dockerfiles to use the lighter alpine variant.
Adjusting the dependency configuration in the UI package.
Adding a setup script to retrieve runnable packages based on turbo build results.

<a href="https://github.com/movahedan/turbo-bun/commit/ac9122f58e05f76387ee8f5c02e6f87fafcf2983"><img src="https://img.shields.io/badge/ci-ac9122f-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8f8f856df000444bbf6b7a0451ada160a7dc9d85"><img src="https://img.shields.io/badge/feat-8f8f856-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8935fcaf5abfc0c60ec608b3eda6914cc3877d5d"><img src="https://img.shields.io/badge/feat-8935fca-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/44"><img src="https://img.shields.io/badge/%2344-blue?style=flat" alt="#44" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.14

<a href="https://github.com/movahedan/turbo-bun/commit/76d485bb52d5b0627748b5e20c0f74641fab5d49"><img src="https://img.shields.io/badge/chore-76d485b-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/typescript-5.8.3 <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/10"><img src="https://img.shields.io/badge/%2310-blue?style=flat" alt="#10" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore: upgrade typescript to 5.8.3

<a href="https://github.com/movahedan/turbo-bun/commit/15cf1a1d9bdf6cfcdc1a8a7185f5bd3253d082dc"><img src="https://img.shields.io/badge/chore-15cf1a1-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

</details>


---

*This changelog was automatically generated using our custom versioning script* ⚡