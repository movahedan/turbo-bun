# Changelog - admin

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.2

<details>
<summary><strong>🔧 Improvements</strong> (Click to expand)</summary>

-  (root) delete logger package and move it to utils ([368e189](https://github.com/movahedan/monobun/commit/368e189))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (root) change biome formatter linewidth => 100 ([7bac340](https://github.com/movahedan/monobun/commit/7bac340))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/monobun/commit/dee8e9a))  by **github-actions[bot]**

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

### 🚀 refactor/remove-remix <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/130"><img src="https://img.shields.io/badge/%23130-blue?style=flat" alt="#130" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/7%20commits-green?style=flat" alt="7 commits" style="vertical-align: middle;" />

This PR removes the Remix-based blog app from the monorepo and refactors the UI package to use Storybook instead of a complex Vite build system. The change simplifies the overall architecture by eliminating the intermediate blog application and repositioning the UI package as a development-focused component library with Storybook for documentation and testing.
Key changes:
Removal of the entire blog application and its dependencies
Replacement of the complex Vite library build system with a simpler Storybook-based development workflow
Addition of new UI components (Card, Input, Label, LoginForm) with comprehensive Storybook stories and tests

<a href="https://github.com/movahedan/monobun/commit/53e5f0b932cd8c5280dcc4b980e06940447cf095"><img src="https://img.shields.io/badge/feat-53e5f0b-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/2479cd9efa6504be4d6c372f8053ccea98eb6813"><img src="https://img.shields.io/badge/feat-2479cd9-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/ca0d900a4d8b9da0d77e878d8292db5105847202"><img src="https://img.shields.io/badge/fix-ca0d900-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/6951a0a7b1e29c37bcfc64772b6036c8e50749f7"><img src="https://img.shields.io/badge/other-6951a0a-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/97c1df1819a890a2698799f2c0d6e778268c1bbb"><img src="https://img.shields.io/badge/other-97c1df1-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/f07da1ef0c41a4d12b4e1d7de3c6635be6839a29"><img src="https://img.shields.io/badge/refactor-f07da1e-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/0cae23cf964c6b97939a70a4135c2fe5657a992b"><img src="https://img.shields.io/badge/refactor-0cae23c-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 refactor/prod-containers <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/98"><img src="https://img.shields.io/badge/%2398-blue?style=flat" alt="#98" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

Refactor/prod containers

<a href="https://github.com/movahedan/monobun/commit/a90f36f15fdb37c85c42d8b676c9359fea39e3d2"><img src="https://img.shields.io/badge/fix-a90f36f-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/f27bf7d0b510762ea017a819a07844107f8a4925"><img src="https://img.shields.io/badge/fix-f27bf7d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/c478addc829a6966015b9da5983c3108dfc77e99"><img src="https://img.shields.io/badge/feat-c478add-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/8fb473b07b3861e2b1cb5bfd2e705b34b629e1c4"><img src="https://img.shields.io/badge/feat-8fb473b-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/1faf557fc2aa0d972803bc7235ed95846330aa35"><img src="https://img.shields.io/badge/feat-1faf557-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/17ac6914f3bf5c156ddfdd8671e3474814c2f4f9"><img src="https://img.shields.io/badge/feat-17ac691-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/5b982a0e845475b7ac94fe4821099e3c31064ca9"><img src="https://img.shields.io/badge/feat-5b982a0-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/deb6d84a1a60d705aa694863d3fd73edd3fc606d"><img src="https://img.shields.io/badge/feat-deb6d84-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 🚀 feature/devcontainer-further-foundings <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/96"><img src="https://img.shields.io/badge/%2396-blue?style=flat" alt="#96" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Pull Request Overview
This PR refactors the development workflow from production Docker Compose to DevContainer-based development with comprehensive configuration improvements and enhanced developer tooling. The changes introduce a complete DevContainer setup with Docker-from-Docker capabilities, streamline package.json scripts, and provide extensive documentation for development workflows.
Key Changes:
Complete DevContainer setup: New VS Code DevContainer configuration with Docker-from-Docker support
Package script reorganization: Simplified and categorized development, container, and production scripts
Enhanced documentation: Added comprehensive guides for Docker, DevContainer, development workflow, and coding conventions

<a href="https://github.com/movahedan/monobun/commit/b35d2d247c26ee5878b08c61af9e6fbac08052f0"><img src="https://img.shields.io/badge/fix-b35d2d2-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/ae933cda622eca8dec01605231b721a472b46438"><img src="https://img.shields.io/badge/fix-ae933cd-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/5e6264b1fda4f7206a58ad3c351a1b8e419275e7"><img src="https://img.shields.io/badge/fix-5e6264b-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/d61077e3d75fff7547ea4a22b3087c6a67f81bd3"><img src="https://img.shields.io/badge/fix-d61077e-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/f59b19a2ea9cd52f59d935d5bc691e711ee2c55d"><img src="https://img.shields.io/badge/fix-f59b19a-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/e56f3ec77121dbf25ebe187a9a0322c70e24f40e"><img src="https://img.shields.io/badge/docs-e56f3ec-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/a2899e093eea3948b00954f3f259fc72cec38883"><img src="https://img.shields.io/badge/docs-a2899e0-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/3e8eb5380a8f400acbcfd7bf70a4fe00b33227e0"><img src="https://img.shields.io/badge/docs-3e8eb53-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/818d215ebdc1b9af6de501274edada6d738a65bf"><img src="https://img.shields.io/badge/docs-818d215-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/ddd30963443ac837653194a12da2ee5641c017f9"><img src="https://img.shields.io/badge/feat-ddd3096-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/7aa039cae9b060b971f12ce9c58166266e449a4e"><img src="https://img.shields.io/badge/feat-7aa039c-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/87d49e1a6562fdd48a3060fee33f2c62b668c2b5"><img src="https://img.shields.io/badge/feat-87d49e1-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/07dc78256403cdc5557c8e292c982922ca7275c5"><img src="https://img.shields.io/badge/feat-07dc782-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/92b8089006371a3bd49bd32437034cc13b04f6bb"><img src="https://img.shields.io/badge/chore-92b8089-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4"><img src="https://img.shields.io/badge/other-d06898c-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/47390853a463c1e904326208a7d6fe07a1587205"><img src="https://img.shields.io/badge/refactor-4739085-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/4157560a2904cc1bf587ec3a054efb086c944495"><img src="https://img.shields.io/badge/refactor-4157560-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 feature/dockerization <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/42"><img src="https://img.shields.io/badge/%2342-blue?style=flat" alt="#42" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

Feature/dockerization

<a href="https://github.com/movahedan/monobun/commit/1e3ae1db93aca2b21e6a827fe0557fa78a724a53"><img src="https://img.shields.io/badge/fix-1e3ae1d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/16d7c742102eee58690f5ec69fb40c6cc598ced4"><img src="https://img.shields.io/badge/fix-16d7c74-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f"><img src="https://img.shields.io/badge/other-fe34ea1-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/755ad952e3fc1390a3610e3214cd78915097820b"><img src="https://img.shields.io/badge/other-755ad95-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/fe90004d6fc68a7a3062fa37f3036b67847888c6"><img src="https://img.shields.io/badge/feat-fe90004-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/5a709470fc276c17010e61c8790a81e5d385792d"><img src="https://img.shields.io/badge/feat-5a70947-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/4794db73818a44a95b01b476863c4aa09472a784"><img src="https://img.shields.io/badge/feat-4794db7-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/0b308eda80c2e7dd0889cf746781333cc4b0cdb3"><img src="https://img.shields.io/badge/ci-0b308ed-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/dff2aa9c8974f629c5999b32ae89a7e8dca95a8f"><img src="https://img.shields.io/badge/feature-dff2aa9-495057?style=flat&logoColor=white" alt="feature" style="vertical-align: middle;" /></a>

### 🔄 refactor/dev-setup <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/137"><img src="https://img.shields.io/badge/%23137-blue?style=flat" alt="#137" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

This PR refactors the development setup to improve containerization and environment configuration management. The changes focus on standardizing port configurations, removing hardcoded values, and streamlining Docker and DevContainer workflows.
Removed hardcoded ports and host configurations from Dockerfiles and configuration files
Standardized environment variable handling using Docker Compose env_file directives and centralized configuration
Updated port mappings with UI service moving from port 3006 to 3004 for consistency

<a href="https://github.com/movahedan/monobun/commit/7f8d42874bb50752593c5032599b3572eef784fa"><img src="https://img.shields.io/badge/docs-7f8d428-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/2c06a882125fbf3dcc977d0f67b1c4cf0a1ed748"><img src="https://img.shields.io/badge/docs-2c06a88-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/d1e9699b3c58eb9ab3ce35f72e760157e44050b0"><img src="https://img.shields.io/badge/chore-d1e9699-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/c6ead2e5f8643f45e073e53934639555220ff5b6"><img src="https://img.shields.io/badge/chore-c6ead2e-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/4a25790eeddf8b5f788389b6a13509ef7660497e"><img src="https://img.shields.io/badge/refactor-4a25790-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/e14a5c4cfb5cf0b5e88b1f4e07996e9349fe88e9"><img src="https://img.shields.io/badge/refactor-e14a5c4-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/571cc9b91cd8611b0d79013069e3194cbc0a6926"><img src="https://img.shields.io/badge/refactor-571cc9b-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/2f55972a0f657053f6619009e19058ebec2e1c7f"><img src="https://img.shields.io/badge/refactor-2f55972-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/jit-and-compiled-packages <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/104"><img src="https://img.shields.io/badge/%23104-blue?style=flat" alt="#104" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor: setup just-in-time and compiled packages correctly
This pull request refactors the monorepo build system by implementing a just-in-time (JIT) compilation approach for packages instead of pre-compiled builds. It replaces the previous prebuild system with a unified build workflow script and switches from bundled TypeScript compilation to direct source imports.
Key changes:
Implements a new build workflow script that automates TypeScript compilation, Vite entry generation, and package.json export updates
Removes prebuild utilities and switches to JIT compilation with direct source imports
Consolidates TypeScript configurations using shared base configurations

<a href="https://github.com/movahedan/monobun/commit/401a8647772c67221c40c052b2d64c1a0eb7ff0e"><img src="https://img.shields.io/badge/fix-401a864-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/2e33ce4422edd74f481b2974d76da884c168b2c4"><img src="https://img.shields.io/badge/fix-2e33ce4-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/8115c51045e1def1ec3b5007919031bbc940fd88"><img src="https://img.shields.io/badge/other-8115c51-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/18b49d28690adaac72adc38bf34be8cf39bd9fa9"><img src="https://img.shields.io/badge/refactor-18b49d2-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔧 feature/devcontainer-first-setup <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/82"><img src="https://img.shields.io/badge/%2382-blue?style=flat" alt="#82" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Adds initial devcontainer and Docker Compose configurations for hot-reload development, along with TypeScript project scaffolding and shared utility/UI packages.
Introduce .devcontainer/devcontainer.json and docker-compose.dev.yml for unified VS Code remote/container setup with hot reload.
Update Docker Compose and Next.js/Vite configs to enable polling-based file watching.
Scaffold @repo/utils and @repo/ui packages with TS configs, build scripts, and exports.
Reviewed Changes
Copilot reviewed 45 out of 47 changed files in this pull request and generated 3 comments.

<a href="https://github.com/movahedan/monobun/commit/1d2158cb03464d560727fd0a10866d3496897895"><img src="https://img.shields.io/badge/fix-1d2158c-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/be88232a8ab25e549c71d63cb4059a13f111769c"><img src="https://img.shields.io/badge/fix-be88232-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/fd9811114d62db9179b72c4da03d45b8eac10c4f"><img src="https://img.shields.io/badge/fix-fd98111-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/72468b1889c67f4f0fe6698b1df28e8f61c1c8f4"><img src="https://img.shields.io/badge/fix-72468b1-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/c0efa5a9236b1d3e839b56ca328fcb617495bb61"><img src="https://img.shields.io/badge/fix-c0efa5a-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/e9905786b0955acb828a5e040a3eddc219df589e"><img src="https://img.shields.io/badge/fix-e990578-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/9b1ff79e0bea2c36ce293fb910751214ad6caa8e"><img src="https://img.shields.io/badge/fix-9b1ff79-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/d2915ef3eb3990e0dc6ec49fa38f09fe272dd965"><img src="https://img.shields.io/badge/fix-d2915ef-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/fb7b5e290fe4c20cf028bfc982f71c15ec579ce3"><img src="https://img.shields.io/badge/fix-fb7b5e2-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/eda1742af90892b4338cc6abf59658dd6b050c35"><img src="https://img.shields.io/badge/fix-eda1742-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/fc95cb68a04df6dfb2a34647a94a94ab595cbed0"><img src="https://img.shields.io/badge/fix-fc95cb6-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/cfd942d5efc79f9058e1d90f77fdb5cd01949edc"><img src="https://img.shields.io/badge/feat-cfd942d-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/eb718b68cec4ab4301fc91eedd486320ad6fd94a"><img src="https://img.shields.io/badge/feat-eb718b6-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/f743e27a075dde96023b1e106116c541005d5c21"><img src="https://img.shields.io/badge/feat-f743e27-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/15dc0dacd97e9e002f45fec7ac5001d82343a46a"><img src="https://img.shields.io/badge/refactor-15dc0da-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/0d2a0a4b649f7a105439624b4cb6f018379cf47d"><img src="https://img.shields.io/badge/refactor-0d2a0a4-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/32b3680965e42587e7646f9691313442ddf54f5d"><img src="https://img.shields.io/badge/refactor-32b3680-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

<details>
<summary><strong>✨ Features</strong> (Click to expand)</summary>

-  (repo) install renovate and pin dependencies ([70cbb66](https://github.com/movahedan/monobun/commit/70cbb66))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) install biome v2.0.0-beta.2 ([b56dfdc](https://github.com/movahedan/monobun/commit/b56dfdc))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (create-turbo) apply package-manager transform ([b28af67](https://github.com/movahedan/monobun/commit/b28af67))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)
-  (create-turbo) create kitchen-sink ([d585c01](https://github.com/movahedan/monobun/commit/d585c01))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)

</details>

<details>
<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>

- dockerfiles ([ab5d976](https://github.com/movahedan/monobun/commit/ab5d976))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 8 package(s) ([548e261](https://github.com/movahedan/monobun/commit/548e261))  by **github-actions[bot]**
-  (repo) add changessets for version management ([0f8fd5c](https://github.com/movahedan/monobun/commit/0f8fd5c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>

### 📦 Dependencies

-  (deps) update react monorepo (#129) ([0d5d249](https://github.com/movahedan/monobun/commit/0d5d249))  by **renovate[bot]**
-  (deps) update react monorepo to v19.1.1 (#127) ([c99b138](https://github.com/movahedan/monobun/commit/c99b138))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.19 (#95) ([7588cfa](https://github.com/movahedan/monobun/commit/7588cfa))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.18 (#80) ([82bf395](https://github.com/movahedan/monobun/commit/82bf395))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.17 (#74) ([253eeac](https://github.com/movahedan/monobun/commit/253eeac))  by **renovate[bot]**
-  (deps) update oven/bun docker tag to v1.2.16 (#67) ([79402b7](https://github.com/movahedan/monobun/commit/79402b7))  by **renovate[bot]**
-  (deps) update dependency vite to v6 ([1a77486](https://github.com/movahedan/monobun/commit/1a77486))  by **renovate[bot]**
-  (deps) lock file maintenance apps (#30) ([c77ce89](https://github.com/movahedan/monobun/commit/c77ce89))  by **renovate[bot]**

### 📦 renovate/apps <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/112"><img src="https://img.shields.io/badge/%23112-blue?style=flat" alt="#112" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update apps

<a href="https://github.com/movahedan/monobun/commit/b3ae83f607f5016dfede7874a667ab26f23b79d8"><img src="https://img.shields.io/badge/fix-b3ae83f-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/110"><img src="https://img.shields.io/badge/%23110-blue?style=flat" alt="#110" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7.0.6

<a href="https://github.com/movahedan/monobun/commit/aa35a7801a768e5d4ae54f87214054fd82fedfb5"><img src="https://img.shields.io/badge/chore-aa35a78-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/106"><img src="https://img.shields.io/badge/%23106-blue?style=flat" alt="#106" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7

<a href="https://github.com/movahedan/monobun/commit/65e18b0b06160f54c31a15f2d29291002830d98e"><img src="https://img.shields.io/badge/chore-65e18b0-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/major-19-react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/100"><img src="https://img.shields.io/badge/%23100-blue?style=flat" alt="#100" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19 (major)

<a href="https://github.com/movahedan/monobun/commit/f071983d01d2691a75fec2b4a0e0cf118b489ce3"><img src="https://img.shields.io/badge/fix-f071983-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/65"><img src="https://img.shields.io/badge/%2365-blue?style=flat" alt="#65" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

Renovate/turbo monorepo

<a href="https://github.com/movahedan/monobun/commit/080630deb09826b97e97f010e0b67b88706b83fe"><img src="https://img.shields.io/badge/chore-080630d-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/22ba1f963013b1d92cbc1d0287eb4846a5a3996b"><img src="https://img.shields.io/badge/chore-22ba1f9-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/51"><img src="https://img.shields.io/badge/%2351-blue?style=flat" alt="#51" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @types/react to v18.3.23

<a href="https://github.com/movahedan/monobun/commit/fa5c795d0ab5e0e93fa70f7b56137cbd43226c2b"><img src="https://img.shields.io/badge/fix-fa5c795-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/55"><img src="https://img.shields.io/badge/%2355-blue?style=flat" alt="#55" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.15

<a href="https://github.com/movahedan/monobun/commit/67c7ebd7a97fb3d524208baa63af062db3cabeb3"><img src="https://img.shields.io/badge/chore-67c7ebd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/cdcc2fd0a5bef213e7a662b3df55aa9977dddbf6"><img src="https://img.shields.io/badge/chore-cdcc2fd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 refactor/optimize-docker-files <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/63"><img src="https://img.shields.io/badge/%2363-blue?style=flat" alt="#63" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/3%20commits-green?style=flat" alt="3 commits" style="vertical-align: middle;" />

This PR refactors and optimizes the Dockerfiles across multiple apps and updates dependency configurations and setup scripts. Key changes include:
Updating base images in Dockerfiles to use the lighter alpine variant.
Adjusting the dependency configuration in the UI package.
Adding a setup script to retrieve runnable packages based on turbo build results.

<a href="https://github.com/movahedan/monobun/commit/ac9122f58e05f76387ee8f5c02e6f87fafcf2983"><img src="https://img.shields.io/badge/ci-ac9122f-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/8f8f856df000444bbf6b7a0451ada160a7dc9d85"><img src="https://img.shields.io/badge/feat-8f8f856-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/monobun/commit/8935fcaf5abfc0c60ec608b3eda6914cc3877d5d"><img src="https://img.shields.io/badge/feat-8935fca-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/44"><img src="https://img.shields.io/badge/%2344-blue?style=flat" alt="#44" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.14

<a href="https://github.com/movahedan/monobun/commit/76d485bb52d5b0627748b5e20c0f74641fab5d49"><img src="https://img.shields.io/badge/chore-76d485b-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/typescript-5.8.3 <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/10"><img src="https://img.shields.io/badge/%2310-blue?style=flat" alt="#10" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore: upgrade typescript to 5.8.3

<a href="https://github.com/movahedan/monobun/commit/15cf1a1d9bdf6cfcdc1a8a7185f5bd3253d082dc"><img src="https://img.shields.io/badge/chore-15cf1a1-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/npm-vite-vulnerability <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/6"><img src="https://img.shields.io/badge/%236-blue?style=flat" alt="#6" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v5.4.19 [security]

<a href="https://github.com/movahedan/monobun/commit/aec36ef3b5fb0dcb2657c4b3635e8e3fa78873fa"><img src="https://img.shields.io/badge/chore-aec36ef-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

</details>


---

*This changelog was automatically generated using our custom versioning script* ⚡