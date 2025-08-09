# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.2

### 🔄 refactor/test-versioning <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/144"><img src="https://img.shields.io/badge/%23144-blue?style=flat" alt="#144" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

docs(root): reorganize documentation and add comprehensive commit workflow
Added interactive commit-and-documentation workflow
Reorganized documentation structure with enhanced AI guidelines
Updated testing patterns and best practices
Modernized versioning documentation approach
Enhanced development workflows and setup flows

<a href="https://github.com/movahedan/turbo-bun/commit/19940c93978e461563cdff655d960965a2223dfd"><img src="https://img.shields.io/badge/docs-19940c9-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4a858c8fceeb58b9adcfd989c2053c9361b7ae90"><img src="https://img.shields.io/badge/feat-4a858c8-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/52188752c6cabeb99715539964d8a3a1f3b2c555"><img src="https://img.shields.io/badge/refactor-5218875-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/368e1893ffdbb9efff8a20a0b0408aaf1d2ccf0c"><img src="https://img.shields.io/badge/refactor-368e189-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/bbaca2b0130498f3746d0a9763e7ccf40acff9fd"><img src="https://img.shields.io/badge/refactor-bbaca2b-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/e3a1294680fce7c0b2ee763fac7875888a364e3d"><img src="https://img.shields.io/badge/chore-e3a1294-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c83570bd538f6624d5e00333174e013232af76df"><img src="https://img.shields.io/badge/chore-c83570b-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/20923ee3875bba9a8ff3a12c8fecdca58f2f849a"><img src="https://img.shields.io/badge/perf-20923ee-60a5fa?style=flat&logoColor=white" alt="perf" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/7bac340e41199234f0422a91c43ba29b9a7b96a5"><img src="https://img.shields.io/badge/style-7bac340-8B5CF6?style=flat&logoColor=white" alt="style" style="vertical-align: middle;" /></a>

### 📝 Direct Commits

*The following changes were committed directly to the main branch:*

### 🐛 Direct Bug Fixes

- resolve javascript hoisting issue in version-commit script ([5fb4582](https://github.com/movahedan/turbo-bun/commit/5fb4582))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

### 📦 Other Direct Changes

- Releasing 7 package(s) ([dee8e9a](https://github.com/movahedan/turbo-bun/commit/dee8e9a))  by **github-actions[bot]**

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

### 🚀 feature/devcontainer-further-foundings <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/96"><img src="https://img.shields.io/badge/%2396-blue?style=flat" alt="#96" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/17%20commits-green?style=flat" alt="17 commits" style="vertical-align: middle;" />

Pull Request Overview
This PR refactors the development workflow from production Docker Compose to DevContainer-based development with comprehensive configuration improvements and enhanced developer tooling. The changes introduce a complete DevContainer setup with Docker-from-Docker capabilities, streamline package.json scripts, and provide extensive documentation for development workflows.
Key Changes:
Complete DevContainer setup: New VS Code DevContainer configuration with Docker-from-Docker support
Package script reorganization: Simplified and categorized development, container, and production scripts
Enhanced documentation: Added comprehensive guides for Docker, DevContainer, development workflow, and coding conventions

<a href="https://github.com/movahedan/turbo-bun/commit/b35d2d247c26ee5878b08c61af9e6fbac08052f0"><img src="https://img.shields.io/badge/fix-b35d2d2-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ae933cda622eca8dec01605231b721a472b46438"><img src="https://img.shields.io/badge/fix-ae933cd-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5e6264b1fda4f7206a58ad3c351a1b8e419275e7"><img src="https://img.shields.io/badge/fix-5e6264b-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d61077e3d75fff7547ea4a22b3087c6a67f81bd3"><img src="https://img.shields.io/badge/fix-d61077e-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/f59b19a2ea9cd52f59d935d5bc691e711ee2c55d"><img src="https://img.shields.io/badge/fix-f59b19a-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/e56f3ec77121dbf25ebe187a9a0322c70e24f40e"><img src="https://img.shields.io/badge/docs-e56f3ec-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/a2899e093eea3948b00954f3f259fc72cec38883"><img src="https://img.shields.io/badge/docs-a2899e0-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/3e8eb5380a8f400acbcfd7bf70a4fe00b33227e0"><img src="https://img.shields.io/badge/docs-3e8eb53-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/818d215ebdc1b9af6de501274edada6d738a65bf"><img src="https://img.shields.io/badge/docs-818d215-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/ddd30963443ac837653194a12da2ee5641c017f9"><img src="https://img.shields.io/badge/feat-ddd3096-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/7aa039cae9b060b971f12ce9c58166266e449a4e"><img src="https://img.shields.io/badge/feat-7aa039c-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/87d49e1a6562fdd48a3060fee33f2c62b668c2b5"><img src="https://img.shields.io/badge/feat-87d49e1-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/07dc78256403cdc5557c8e292c982922ca7275c5"><img src="https://img.shields.io/badge/feat-07dc782-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/92b8089006371a3bd49bd32437034cc13b04f6bb"><img src="https://img.shields.io/badge/chore-92b8089-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d06898cd9589a9ce4a57e2a48e313ec3a04cf2b4"><img src="https://img.shields.io/badge/other-d06898c-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/47390853a463c1e904326208a7d6fe07a1587205"><img src="https://img.shields.io/badge/refactor-4739085-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4157560a2904cc1bf587ec3a054efb086c944495"><img src="https://img.shields.io/badge/refactor-4157560-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🚀 feature/dockerization <img src="https://img.shields.io/badge/Feature%20Releases-495057?style=flat" alt="Feature Releases" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/42"><img src="https://img.shields.io/badge/%2342-blue?style=flat" alt="#42" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/9%20commits-green?style=flat" alt="9 commits" style="vertical-align: middle;" />

Feature/dockerization

<a href="https://github.com/movahedan/turbo-bun/commit/1e3ae1db93aca2b21e6a827fe0557fa78a724a53"><img src="https://img.shields.io/badge/fix-1e3ae1d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/16d7c742102eee58690f5ec69fb40c6cc598ced4"><img src="https://img.shields.io/badge/fix-16d7c74-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fe34ea1443544e5dd72b7b5829d7bcc6a54c320f"><img src="https://img.shields.io/badge/other-fe34ea1-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/755ad952e3fc1390a3610e3214cd78915097820b"><img src="https://img.shields.io/badge/other-755ad95-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/fe90004d6fc68a7a3062fa37f3036b67847888c6"><img src="https://img.shields.io/badge/feat-fe90004-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5a709470fc276c17010e61c8790a81e5d385792d"><img src="https://img.shields.io/badge/feat-5a70947-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4794db73818a44a95b01b476863c4aa09472a784"><img src="https://img.shields.io/badge/feat-4794db7-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/0b308eda80c2e7dd0889cf746781333cc4b0cdb3"><img src="https://img.shields.io/badge/ci-0b308ed-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/dff2aa9c8974f629c5999b32ae89a7e8dca95a8f"><img src="https://img.shields.io/badge/feature-dff2aa9-495057?style=flat&logoColor=white" alt="feature" style="vertical-align: middle;" /></a>

### 🏗️ refactor/utilize-setup-scripts <img src="https://img.shields.io/badge/Infrastructure%20%26%20Tooling-495057?style=flat" alt="Infrastructure & Tooling" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/61"><img src="https://img.shields.io/badge/%2361-blue?style=flat" alt="#61" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/4%20commits-green?style=flat" alt="4 commits" style="vertical-align: middle;" />

refactor(repo): imrove setup scripts
This PR refactors the repository’s setup scripts to improve maintainability and consistency. Key changes include:
Refactoring start.ts to use a new logging function and dynamic service configuration.
Introducing a new config.ts file to centralize runnable service definitions.
Moving cleanup functionality into scripts/setup/cleanup.ts while removing legacy scripts.

<a href="https://github.com/movahedan/turbo-bun/commit/44a92b36ef5407588981010d0ba54f09b434d3e5"><img src="https://img.shields.io/badge/ci-44a92b3-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/1f4b5cc117d74caa9e498b52298e6063a2b5288e"><img src="https://img.shields.io/badge/ci-1f4b5cc-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/32296b7f9a14d514f07a1bcfe35e3dcfa160f3cf"><img src="https://img.shields.io/badge/ci-32296b7-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2f593fd862486c26f4ed4dbbe9b9ec837958caa3"><img src="https://img.shields.io/badge/refactor-2f593fd-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔄 refactor/dev-setup <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/137"><img src="https://img.shields.io/badge/%23137-blue?style=flat" alt="#137" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/8%20commits-green?style=flat" alt="8 commits" style="vertical-align: middle;" />

This PR refactors the development setup to improve containerization and environment configuration management. The changes focus on standardizing port configurations, removing hardcoded values, and streamlining Docker and DevContainer workflows.
Removed hardcoded ports and host configurations from Dockerfiles and configuration files
Standardized environment variable handling using Docker Compose env_file directives and centralized configuration
Updated port mappings with UI service moving from port 3006 to 3004 for consistency

<a href="https://github.com/movahedan/turbo-bun/commit/7f8d42874bb50752593c5032599b3572eef784fa"><img src="https://img.shields.io/badge/docs-7f8d428-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2c06a882125fbf3dcc977d0f67b1c4cf0a1ed748"><img src="https://img.shields.io/badge/docs-2c06a88-646CFF?style=flat&logoColor=white" alt="docs" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/d1e9699b3c58eb9ab3ce35f72e760157e44050b0"><img src="https://img.shields.io/badge/chore-d1e9699-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/c6ead2e5f8643f45e073e53934639555220ff5b6"><img src="https://img.shields.io/badge/chore-c6ead2e-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/4a25790eeddf8b5f788389b6a13509ef7660497e"><img src="https://img.shields.io/badge/refactor-4a25790-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/e14a5c4cfb5cf0b5e88b1f4e07996e9349fe88e9"><img src="https://img.shields.io/badge/refactor-e14a5c4-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/571cc9b91cd8611b0d79013069e3194cbc0a6926"><img src="https://img.shields.io/badge/refactor-571cc9b-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/2f55972a0f657053f6619009e19058ebec2e1c7f"><img src="https://img.shields.io/badge/refactor-2f55972-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

### 🔄 refactor/121-refactor-docker-compose-parser <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/134"><img src="https://img.shields.io/badge/%23134-blue?style=flat" alt="#134" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR refactors the docker-compose parser and related scripts to improve code organization and API design. The main changes consolidate parsing logic into a more cohesive interface and update consuming scripts to use the new API.
Consolidates multiple docker-compose utility functions into a single parseCompose function
Replaces individual utility functions with methods on a composed object
Updates all consuming scripts to use the new parser API

<a href="https://github.com/movahedan/turbo-bun/commit/2ce0c5e7208429c99387e035956a7d5217dcae3c"><img src="https://img.shields.io/badge/refactor-2ce0c5e-007ACC?style=flat&logoColor=white" alt="refactor" style="vertical-align: middle;" /></a>

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

### 🔧 120-refactor-and-simplify-vscode-sync-code <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/133"><img src="https://img.shields.io/badge/%23133-blue?style=flat" alt="#133" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

<a href="https://github.com/movahedan/turbo-bun/commit/cdb574cc34b0f0953a199258be3b846d979ad534"><img src="https://img.shields.io/badge/fix-cdb574c-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

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

### 🔧 fix/biome <img src="https://img.shields.io/badge/Bug%20Fixes%20%26%20Improvements-495057?style=flat" alt="Bug Fixes & Improvements" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/9"><img src="https://img.shields.io/badge/%239-blue?style=flat" alt="#9" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR makes minor adjustments related to biome configuration.
Reorders import declaration in tsup.config.ts for consistency
Reorganizes and adds biome-related settings in .vscode/settings.json

<a href="https://github.com/movahedan/turbo-bun/commit/2d28e103c5c2070fdec7055dbf8f683ab19cd97e"><img src="https://img.shields.io/badge/fix-2d28e10-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

<details>
<summary><strong>✨ Features</strong> (Click to expand)</summary>

- implement working github actions authentication for versioning ([a21e3fa](https://github.com/movahedan/turbo-bun/commit/a21e3fa))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- implement git tag-based versioning and deployment system ([76f122a](https://github.com/movahedan/turbo-bun/commit/76f122a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add comprehensive technology badges to readme ([a8d1be6](https://github.com/movahedan/turbo-bun/commit/a8d1be6))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) install renovate and pin dependencies ([70cbb66](https://github.com/movahedan/turbo-bun/commit/70cbb66))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) install lefthook as git hooks manager ([38f443f](https://github.com/movahedan/turbo-bun/commit/38f443f))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) install biome v2.0.0-beta.2 ([b56dfdc](https://github.com/movahedan/turbo-bun/commit/b56dfdc))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (create-turbo) apply package-manager transform ([b28af67](https://github.com/movahedan/turbo-bun/commit/b28af67))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)
-  (create-turbo) apply official-starter transform ([0a38eef](https://github.com/movahedan/turbo-bun/commit/0a38eef))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)
-  (create-turbo) create kitchen-sink ([d585c01](https://github.com/movahedan/turbo-bun/commit/d585c01))  by **Turbobot** [turbobot@vercel.com](mailto:turbobot@vercel.com)

</details>

<details>
<summary><strong>🐛 Bug Fixes</strong> (Click to expand)</summary>

- add write permissions to version workflow ([e64caeb](https://github.com/movahedan/turbo-bun/commit/e64caeb))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add version fields to utility packages and update versioning logic ([c27ebfd](https://github.com/movahedan/turbo-bun/commit/c27ebfd))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add auto-ignore logic to version-commit script ([6678a5f](https://github.com/movahedan/turbo-bun/commit/6678a5f))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (root) version pipeline ([0c78b5b](https://github.com/movahedan/turbo-bun/commit/0c78b5b))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- use bunx for biome check in build script to avoid script dependency ([b9e447c](https://github.com/movahedan/turbo-bun/commit/b9e447c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- run check:fix from root directory in build script ([cd4760a](https://github.com/movahedan/turbo-bun/commit/cd4760a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add optional chaining to prevent undefined error in arg parser ([e120b5e](https://github.com/movahedan/turbo-bun/commit/e120b5e))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (ci) add dynamic port detection for docker services ([8bd692f](https://github.com/movahedan/turbo-bun/commit/8bd692f))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (ci) resolve docker dependency issues in github actions ([700635b](https://github.com/movahedan/turbo-bun/commit/700635b))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add out to gitignore ([e9a449f](https://github.com/movahedan/turbo-bun/commit/e9a449f))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- dockerfiles ([ab5d976](https://github.com/movahedan/turbo-bun/commit/ab5d976))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- github actinos ([9bc65cc](https://github.com/movahedan/turbo-bun/commit/9bc65cc))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) update renovate ([151e64c](https://github.com/movahedan/turbo-bun/commit/151e64c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) check-branch-name add dot in the pattern ([a645c33](https://github.com/movahedan/turbo-bun/commit/a645c33))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) update renovate to understand react pacakges ([8346d2a](https://github.com/movahedan/turbo-bun/commit/8346d2a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (chore) update renovate configuration ([2280fe1](https://github.com/movahedan/turbo-bun/commit/2280fe1))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>🔧 Improvements</strong> (Click to expand)</summary>

- version flow ([f4ed6b0](https://github.com/movahedan/turbo-bun/commit/f4ed6b0))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- rename config-typescript to typescript-config for consistency ([716b8aa](https://github.com/movahedan/turbo-bun/commit/716b8aa))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (root) remove arg-parser and move it to create-scripts ([9615791](https://github.com/movahedan/turbo-bun/commit/9615791))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📚 Documentation</strong> (Click to expand)</summary>

- fix broken links and obvious mistakes in documentation ([09add2f](https://github.com/movahedan/turbo-bun/commit/09add2f))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add push prompt to conventional commits rule ([a0892d6](https://github.com/movahedan/turbo-bun/commit/a0892d6))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) improve script development rule with proper exports ([44f323a](https://github.com/movahedan/turbo-bun/commit/44f323a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add comprehensive conventional commits rule ([27337d5](https://github.com/movahedan/turbo-bun/commit/27337d5))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add some planning docs ([5d5987d](https://github.com/movahedan/turbo-bun/commit/5d5987d))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add environment variables documentation ([3192dc3](https://github.com/movahedan/turbo-bun/commit/3192dc3))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) update cursor rules ([990d9bc](https://github.com/movahedan/turbo-bun/commit/990d9bc))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add renovate and sonarcube to readme ([e2b2b3c](https://github.com/movahedan/turbo-bun/commit/e2b2b3c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add build-vite-library documentation ([6714f9d](https://github.com/movahedan/turbo-bun/commit/6714f9d))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- add some cursor rules ([31e0485](https://github.com/movahedan/turbo-bun/commit/31e0485))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- update readme.md ([0014235](https://github.com/movahedan/turbo-bun/commit/0014235))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>🧪 Testing</strong> (Click to expand)</summary>

- add test file for validation ([f38a360](https://github.com/movahedan/turbo-bun/commit/f38a360))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary><strong>📦 Other Changes</strong> (Click to expand)</summary>

- Releasing 8 package(s) ([548e261](https://github.com/movahedan/turbo-bun/commit/548e261))  by **github-actions[bot]**
- improve logs ([5bc59cf](https://github.com/movahedan/turbo-bun/commit/5bc59cf))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- wip ([fc229e1](https://github.com/movahedan/turbo-bun/commit/fc229e1))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- switch to 'bun test' globally and cleanup configuration ([8342e1a](https://github.com/movahedan/turbo-bun/commit/8342e1a))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- improve minor namings ([d5b6676](https://github.com/movahedan/turbo-bun/commit/d5b6676))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
- delete package lock ([855cee3](https://github.com/movahedan/turbo-bun/commit/855cee3))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (config) migrate config renovate.json ([c62ba62](https://github.com/movahedan/turbo-bun/commit/c62ba62))  by **renovate[bot]**
-  (repo) add first GithubActions ([dd7d5d4](https://github.com/movahedan/turbo-bun/commit/dd7d5d4))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) remove renovate.json from biome ([584785d](https://github.com/movahedan/turbo-bun/commit/584785d))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (repo) add changessets for version management ([0f8fd5c](https://github.com/movahedan/turbo-bun/commit/0f8fd5c))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)
-  (config) ignore internal packages in renovate ([b87a30b](https://github.com/movahedan/turbo-bun/commit/b87a30b))  by **Soheil Movahedan** [soheil.movahhedan@gmail.com](mailto:soheil.movahhedan@gmail.com)

</details>

<details>
<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>

### 📦 Dependencies

-  (deps) update dependency typescript to v5.9.2 (#139) ([d080554](https://github.com/movahedan/turbo-bun/commit/d080554))
-  (deps) update dependency next to v15.4.5 (#136) ([4dbaa05](https://github.com/movahedan/turbo-bun/commit/4dbaa05))
-  (deps) update react monorepo (#129) ([0d5d249](https://github.com/movahedan/turbo-bun/commit/0d5d249))
-  (deps) update dependency isbot to v5.1.29 (#128) ([895195c](https://github.com/movahedan/turbo-bun/commit/895195c))
-  (deps) update react monorepo to v19.1.1 (#127) ([c99b138](https://github.com/movahedan/turbo-bun/commit/c99b138))
-  (deps) update dependency supertest to v7.1.4 (#103) ([0686638](https://github.com/movahedan/turbo-bun/commit/0686638))
-  (deps) update oven/bun docker tag to v1.2.19 (#95) ([7588cfa](https://github.com/movahedan/turbo-bun/commit/7588cfa))
-  (deps) update dependency bun-types to v1.2.19 (#94) ([716d27b](https://github.com/movahedan/turbo-bun/commit/716d27b))
-  (deps) update dependency morgan to v1.10.1 (#92) ([b000016](https://github.com/movahedan/turbo-bun/commit/b000016))
-  (deps) update dependency @biomejs/biome to v2.1.2 (#93) ([bf273af](https://github.com/movahedan/turbo-bun/commit/bf273af))
-  (deps) update dependency @biomejs/biome (#91) ([f140483](https://github.com/movahedan/turbo-bun/commit/f140483))
-  (deps) update dependency turbo to v2.5.5 (#90) ([92cc742](https://github.com/movahedan/turbo-bun/commit/92cc742))
-  (deps) update dependency @biomejs/biome to v2.1.1 (#89) ([ecdb4f0](https://github.com/movahedan/turbo-bun/commit/ecdb4f0))
-  (deps) update dependency supertest to v7.1.3 (#88) ([582dc28](https://github.com/movahedan/turbo-bun/commit/582dc28))
-  (deps) pin dependency class-variance-authority to 0.7.1 (#83) ([0ce49cf](https://github.com/movahedan/turbo-bun/commit/0ce49cf))
-  (deps) update dependency next to v15.3.5 (#81) ([bdd2ebc](https://github.com/movahedan/turbo-bun/commit/bdd2ebc))
-  (deps) update dependency lefthook to v1.11.16 (#79) ([d40ef23](https://github.com/movahedan/turbo-bun/commit/d40ef23))
-  (deps) update dependency @biomejs/biome to v2.0.6 (#78) ([d2af3e2](https://github.com/movahedan/turbo-bun/commit/d2af3e2))
-  (deps) update dependency @vercel/remix to v2.16.7 (#77) ([291c3c8](https://github.com/movahedan/turbo-bun/commit/291c3c8))
-  (deps) update dependency bunchee to v6.5.4 (#76) ([7342dea](https://github.com/movahedan/turbo-bun/commit/7342dea))
-  (deps) update dependency @biomejs/biome to v2.0.5 (#75) ([68dc238](https://github.com/movahedan/turbo-bun/commit/68dc238))
-  (deps) update dependency @biomejs/biome to v2.0.4 (#73) ([2f55194](https://github.com/movahedan/turbo-bun/commit/2f55194))
-  (deps) update dependency @changesets/cli to v2.29.5 (#72) ([60a54e0](https://github.com/movahedan/turbo-bun/commit/60a54e0))
-  (deps) update dependency next to v15.3.4 (#71) ([5008284](https://github.com/movahedan/turbo-bun/commit/5008284))
-  (deps) update dependency @biomejs/biome to v2.0.0 (#70) ([bb99f97](https://github.com/movahedan/turbo-bun/commit/bb99f97))
-  (deps) update dependency lefthook to v1.11.14 (#69) ([2a21132](https://github.com/movahedan/turbo-bun/commit/2a21132))
-  (deps) update dependency bunchee to v6.5.3 (#68) ([c2810ca](https://github.com/movahedan/turbo-bun/commit/c2810ca))
-  (deps) update remix monorepo to v2.16.8 (#53) ([e1198ae](https://github.com/movahedan/turbo-bun/commit/e1198ae))
-  (deps) update dependency @types/express to v4.17.23 (#62) ([29844c2](https://github.com/movahedan/turbo-bun/commit/29844c2))
-  (deps) update dependency @types/cors to v2.8.19 (#60) ([77a1aae](https://github.com/movahedan/turbo-bun/commit/77a1aae))
- update readme ([1da50d4](https://github.com/movahedan/turbo-bun/commit/1da50d4))
-  (deps) update dependency @types/body-parser to v1.19.6 (#59) ([49a9280](https://github.com/movahedan/turbo-bun/commit/49a9280))
-  (deps) pin dependency @remix-run/serve to 2.16.7 (#48) ([ceb2685](https://github.com/movahedan/turbo-bun/commit/ceb2685))
-  (deps) update dependency vite to v6 ([1a77486](https://github.com/movahedan/turbo-bun/commit/1a77486))
-  (deps) pin dependencies (#43) ([f7577f4](https://github.com/movahedan/turbo-bun/commit/f7577f4))
-  (deps) update dependency @types/react to v18.3.22 (#41) ([bc8fe1e](https://github.com/movahedan/turbo-bun/commit/bc8fe1e))
-  (deps) update dependency @biomejs/biome to v2.0.0-beta.5 (#40) ([3f7268e](https://github.com/movahedan/turbo-bun/commit/3f7268e))
-  (deps) lock file maintenance shared packages (#38) ([49a8b60](https://github.com/movahedan/turbo-bun/commit/49a8b60))
-  (deps) lock file maintenance apps (#37) ([93c3053](https://github.com/movahedan/turbo-bun/commit/93c3053))
-  (deps) update dependency @biomejs/biome to v2.0.0-beta.4 (#35) ([bfb743b](https://github.com/movahedan/turbo-bun/commit/bfb743b))
-  (deps) update dependency lefthook to v1.11.13 (#36) ([2b7cf77](https://github.com/movahedan/turbo-bun/commit/2b7cf77))
-  (deps) update dependency @biomejs/biome to v2.0.0-beta.4 (#34) ([6c8cac9](https://github.com/movahedan/turbo-bun/commit/6c8cac9))
-  (deps) update dependency @changesets/cli to v2.29.4 (#33) ([dbaf036](https://github.com/movahedan/turbo-bun/commit/dbaf036))
-  (deps) lock file maintenance shared packages (#31) ([fbfb1ae](https://github.com/movahedan/turbo-bun/commit/fbfb1ae))
-  (deps) lock file maintenance apps (#30) ([c77ce89](https://github.com/movahedan/turbo-bun/commit/c77ce89))
-  (deps) update dependency @biomejs/biome to v2.0.0-beta.3 (#13) ([2481661](https://github.com/movahedan/turbo-bun/commit/2481661))
-  (deps) update dependency @biomejs/biome to v2.0.0-beta.3 (#29) ([7de31f8](https://github.com/movahedan/turbo-bun/commit/7de31f8))
-  (deps) remove @types/node from package.json files ([09970cb](https://github.com/movahedan/turbo-bun/commit/09970cb))
-  (deps) update react (#12) ([c7851a5](https://github.com/movahedan/turbo-bun/commit/c7851a5))

### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/132"><img src="https://img.shields.io/badge/%23132-blue?style=flat" alt="#132" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19.1.1

<a href="https://github.com/movahedan/turbo-bun/commit/b3740352cd0b4158b41ebec58be9f8a502ea48e4"><img src="https://img.shields.io/badge/fix-b374035-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/apps <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/118"><img src="https://img.shields.io/badge/%23118-blue?style=flat" alt="#118" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @remix-run/dev to v2.17.0

<a href="https://github.com/movahedan/turbo-bun/commit/a4804379be642010b9c2d1219e90033de5c93c10"><img src="https://img.shields.io/badge/chore-a480437-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/body-parser-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/115"><img src="https://img.shields.io/badge/%23115-blue?style=flat" alt="#115" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency body-parser to v2

<a href="https://github.com/movahedan/turbo-bun/commit/d02f19d0e3395171b589d43f499bd2e6ab9e7254"><img src="https://img.shields.io/badge/fix-d02f19d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/express-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/116"><img src="https://img.shields.io/badge/%23116-blue?style=flat" alt="#116" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency express to v5

<a href="https://github.com/movahedan/turbo-bun/commit/c4a9fc3ea34afb7cd5c65e08ea156d876fbc9a4b"><img src="https://img.shields.io/badge/fix-c4a9fc3-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/testing-library-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/114"><img src="https://img.shields.io/badge/%23114-blue?style=flat" alt="#114" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update testing-library monorepo

<a href="https://github.com/movahedan/turbo-bun/commit/837f73d353ef194236754eabed548c40b84865ea"><img src="https://img.shields.io/badge/fix-837f73d-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/apps <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/112"><img src="https://img.shields.io/badge/%23112-blue?style=flat" alt="#112" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update apps

<a href="https://github.com/movahedan/turbo-bun/commit/b3ae83f607f5016dfede7874a667ab26f23b79d8"><img src="https://img.shields.io/badge/fix-b3ae83f-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-tsconfig-paths-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/107"><img src="https://img.shields.io/badge/%23107-blue?style=flat" alt="#107" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite-tsconfig-paths to v5

<a href="https://github.com/movahedan/turbo-bun/commit/bfb09b02bfb5ec3d579e1caf4385b0902a143930"><img src="https://img.shields.io/badge/chore-bfb09b0-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/tailwind-merge-3.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/111"><img src="https://img.shields.io/badge/%23111-blue?style=flat" alt="#111" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency tailwind-merge to v3

<a href="https://github.com/movahedan/turbo-bun/commit/ed85fae360071e1fdb73746d5a3c97777bfe4c0b"><img src="https://img.shields.io/badge/fix-ed85fae-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/110"><img src="https://img.shields.io/badge/%23110-blue?style=flat" alt="#110" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7.0.6

<a href="https://github.com/movahedan/turbo-bun/commit/aa35a7801a768e5d4ae54f87214054fd82fedfb5"><img src="https://img.shields.io/badge/chore-aa35a78-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/major-18-happy-dom-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/109"><img src="https://img.shields.io/badge/%23109-blue?style=flat" alt="#109" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @happy-dom/global-registrator to v18

<a href="https://github.com/movahedan/turbo-bun/commit/cd10284ee92a92634ce0d1b1c29dd01331e85844"><img src="https://img.shields.io/badge/fix-cd10284-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/vite-7.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/106"><img src="https://img.shields.io/badge/%23106-blue?style=flat" alt="#106" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v7

<a href="https://github.com/movahedan/turbo-bun/commit/65e18b0b06160f54c31a15f2d29291002830d98e"><img src="https://img.shields.io/badge/chore-65e18b0-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-sh-setup-bun-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/108"><img src="https://img.shields.io/badge/%23108-blue?style=flat" alt="#108" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven-sh/setup-bun action to v2

<a href="https://github.com/movahedan/turbo-bun/commit/cb8bcbcc15ee5d33edea0ef2f58e823b00f555a8"><img src="https://img.shields.io/badge/chore-cb8bcbc-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/lefthook-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/105"><img src="https://img.shields.io/badge/%23105-blue?style=flat" alt="#105" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency lefthook to v1.12.2

<a href="https://github.com/movahedan/turbo-bun/commit/6d7fc960c2fc008f3d7f7110b8b15c4e0dc6e506"><img src="https://img.shields.io/badge/chore-6d7fc96-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/bunchee-6.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/84"><img src="https://img.shields.io/badge/%2384-blue?style=flat" alt="#84" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency bunchee to v6.5.4

<a href="https://github.com/movahedan/turbo-bun/commit/4f9083522cdc1b0f782b626e53befd609102b181"><img src="https://img.shields.io/badge/chore-4f90835-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/pin-dependencies <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/102"><img src="https://img.shields.io/badge/%23102-blue?style=flat" alt="#102" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): pin dependencies

<a href="https://github.com/movahedan/turbo-bun/commit/11276fceb1999b20e0dac295a564e7ec5704e6ee"><img src="https://img.shields.io/badge/fix-11276fc-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/major-19-react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/100"><img src="https://img.shields.io/badge/%23100-blue?style=flat" alt="#100" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update react monorepo to v19 (major)

<a href="https://github.com/movahedan/turbo-bun/commit/f071983d01d2691a75fec2b4a0e0cf118b489ce3"><img src="https://img.shields.io/badge/fix-f071983-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/97"><img src="https://img.shields.io/badge/%2397-blue?style=flat" alt="#97" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.19

<a href="https://github.com/movahedan/turbo-bun/commit/00f12720d4c534e2ccc9bb2dcde80ac7b7d2c6e5"><img src="https://img.shields.io/badge/chore-00f1272-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/clsx-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/87"><img src="https://img.shields.io/badge/%2387-blue?style=flat" alt="#87" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency clsx to v2.1.1

<a href="https://github.com/movahedan/turbo-bun/commit/971e5054eaaff211ffb54560545bd4de6739822b"><img src="https://img.shields.io/badge/fix-971e505-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/86"><img src="https://img.shields.io/badge/%2386-blue?style=flat" alt="#86" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.18

<a href="https://github.com/movahedan/turbo-bun/commit/f711f66f35ef0e5b74579e1f35553fba559d9f36"><img src="https://img.shields.io/badge/chore-f711f66-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/lock-file-maintenance <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/66"><img src="https://img.shields.io/badge/%2366-blue?style=flat" alt="#66" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): lock file maintenance

<a href="https://github.com/movahedan/turbo-bun/commit/2570365202148becb062e9a139a0877842d9f830"><img src="https://img.shields.io/badge/chore-2570365-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/morgan-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/64"><img src="https://img.shields.io/badge/%2364-blue?style=flat" alt="#64" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @types/morgan to v1.9.10

<a href="https://github.com/movahedan/turbo-bun/commit/c2aab6798bb01b113e55ebb4636b886134ee402e"><img src="https://img.shields.io/badge/chore-c2aab67-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/nextjs-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/56"><img src="https://img.shields.io/badge/%2356-blue?style=flat" alt="#56" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency next to v15.3.3

<a href="https://github.com/movahedan/turbo-bun/commit/2e058aa5ae682d6a68cdde673163b122ef603955"><img src="https://img.shields.io/badge/fix-2e058aa-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/65"><img src="https://img.shields.io/badge/%2365-blue?style=flat" alt="#65" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

Renovate/turbo monorepo

<a href="https://github.com/movahedan/turbo-bun/commit/080630deb09826b97e97f010e0b67b88706b83fe"><img src="https://img.shields.io/badge/chore-080630d-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/22ba1f963013b1d92cbc1d0287eb4846a5a3996b"><img src="https://img.shields.io/badge/chore-22ba1f9-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/turbo-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/57"><img src="https://img.shields.io/badge/%2357-blue?style=flat" alt="#57" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency turbo to v2.5.4

<a href="https://github.com/movahedan/turbo-bun/commit/8cc868792154b6ae66e21f6607e47f14879b1a7c"><img src="https://img.shields.io/badge/chore-8cc8687-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/react-monorepo <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/51"><img src="https://img.shields.io/badge/%2351-blue?style=flat" alt="#51" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependency @types/react to v18.3.23

<a href="https://github.com/movahedan/turbo-bun/commit/fa5c795d0ab5e0e93fa70f7b56137cbd43226c2b"><img src="https://img.shields.io/badge/fix-fa5c795-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/55"><img src="https://img.shields.io/badge/%2355-blue?style=flat" alt="#55" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.15

<a href="https://github.com/movahedan/turbo-bun/commit/67c7ebd7a97fb3d524208baa63af062db3cabeb3"><img src="https://img.shields.io/badge/chore-67c7ebd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/cdcc2fd0a5bef213e7a662b3df55aa9977dddbf6"><img src="https://img.shields.io/badge/chore-cdcc2fd-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/biomejs-biome-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/58"><img src="https://img.shields.io/badge/%2358-blue?style=flat" alt="#58" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @biomejs/biome to v2.0.0-beta.6

<a href="https://github.com/movahedan/turbo-bun/commit/bf8d3edd1d7ba45c4042fc2caf37cad9b498c28d"><img src="https://img.shields.io/badge/chore-bf8d3ed-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/lefthook-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/52"><img src="https://img.shields.io/badge/%2352-blue?style=flat" alt="#52" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency lefthook to v1.11.13

<a href="https://github.com/movahedan/turbo-bun/commit/a915c9a8a43fe57cf0a46a2dd31742d5c6f641dd"><img src="https://img.shields.io/badge/chore-a915c9a-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 refactor/optimize-docker-files <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/63"><img src="https://img.shields.io/badge/%2363-blue?style=flat" alt="#63" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/3%20commits-green?style=flat" alt="3 commits" style="vertical-align: middle;" />

This PR refactors and optimizes the Dockerfiles across multiple apps and updates dependency configurations and setup scripts. Key changes include:
Updating base images in Dockerfiles to use the lighter alpine variant.
Adjusting the dependency configuration in the UI package.
Adding a setup script to retrieve runnable packages based on turbo build results.

<a href="https://github.com/movahedan/turbo-bun/commit/ac9122f58e05f76387ee8f5c02e6f87fafcf2983"><img src="https://img.shields.io/badge/ci-ac9122f-2496ED?style=flat&logoColor=white" alt="ci" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8f8f856df000444bbf6b7a0451ada160a7dc9d85"><img src="https://img.shields.io/badge/feat-8f8f856-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/8935fcaf5abfc0c60ec608b3eda6914cc3877d5d"><img src="https://img.shields.io/badge/feat-8935fca-00D4AA?style=flat&logoColor=white" alt="feat" style="vertical-align: middle;" /></a>

### 📦 renovate/oven-bun-1.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/44"><img src="https://img.shields.io/badge/%2344-blue?style=flat" alt="#44" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update oven/bun docker tag to v1.2.14

<a href="https://github.com/movahedan/turbo-bun/commit/76d485bb52d5b0627748b5e20c0f74641fab5d49"><img src="https://img.shields.io/badge/chore-76d485b-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/biomejs-biome-2.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/49"><img src="https://img.shields.io/badge/%2349-blue?style=flat" alt="#49" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency @biomejs/biome to v2.0.0-beta.5

<a href="https://github.com/movahedan/turbo-bun/commit/a355e8efd8cc6c719f228001c8748954565e2e97"><img src="https://img.shields.io/badge/chore-a355e8e-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/50"><img src="https://img.shields.io/badge/%2350-blue?style=flat" alt="#50" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<a href="https://github.com/movahedan/turbo-bun/commit/fa2084a1c3ebe1e3ae9ea6b9678aab1de60b8e3e"><img src="https://img.shields.io/badge/other-fa2084a-495057?style=flat&logoColor=white" alt="other" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/cf74db4965ec52917af5bf18c32b124f7734475e"><img src="https://img.shields.io/badge/chore-cf74db4-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/45"><img src="https://img.shields.io/badge/%2345-blue?style=flat" alt="#45" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<a href="https://github.com/movahedan/turbo-bun/commit/de2d2e6ae22ba63fe32ad3e811ffab94f520e20f"><img src="https://img.shields.io/badge/chore-de2d2e6-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a> <a href="https://github.com/movahedan/turbo-bun/commit/5517c141e67a71ab5c1a6153f077d7f0b93b65bc"><img src="https://img.shields.io/badge/fix-5517c14-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/pin-dependencies <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/27"><img src="https://img.shields.io/badge/%2327-blue?style=flat" alt="#27" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): pin dependencies

<a href="https://github.com/movahedan/turbo-bun/commit/a87b240b3f670a5a0d7b17400a6ff761e0e7460c"><img src="https://img.shields.io/badge/chore-a87b240-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/26"><img src="https://img.shields.io/badge/%2326-blue?style=flat" alt="#26" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<a href="https://github.com/movahedan/turbo-bun/commit/71259149e24fdce23e73fa2949d13c125c21a241"><img src="https://img.shields.io/badge/chore-7125914-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/migrate-config <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/25"><img src="https://img.shields.io/badge/%2325-blue?style=flat" alt="#25" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(config): migrate renovate config

<a href="https://github.com/movahedan/turbo-bun/commit/6e4e1a283bcf8d76b335f8ab2a5e3ae740d73b5b"><img src="https://img.shields.io/badge/chore-6e4e1a2-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/node-22.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/22"><img src="https://img.shields.io/badge/%2322-blue?style=flat" alt="#22" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update node.js to v22.15.0

<a href="https://github.com/movahedan/turbo-bun/commit/153c3ef5a1b6869594009c71b7851a09f8bd94f9"><img src="https://img.shields.io/badge/chore-153c3ef-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/dependencies-(non-major) <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/23"><img src="https://img.shields.io/badge/%2323-blue?style=flat" alt="#23" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

fix(deps): update dependencies (non-major)

<a href="https://github.com/movahedan/turbo-bun/commit/dfda47bf8fd80331a6dcfd7418d8d879519aca16"><img src="https://img.shields.io/badge/fix-dfda47b-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

### 📦 renovate/typescript-5.8.3 <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/10"><img src="https://img.shields.io/badge/%2310-blue?style=flat" alt="#10" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore: upgrade typescript to 5.8.3

<a href="https://github.com/movahedan/turbo-bun/commit/15cf1a1d9bdf6cfcdc1a8a7185f5bd3253d082dc"><img src="https://img.shields.io/badge/chore-15cf1a1-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/typescript-5.x <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/7"><img src="https://img.shields.io/badge/%237-blue?style=flat" alt="#7" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency typescript to v5.8.3

<a href="https://github.com/movahedan/turbo-bun/commit/1e974611f501bcb5e4d481ed7e75b73e5c47c872"><img src="https://img.shields.io/badge/chore-1e97461-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/npm-vite-vulnerability <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/6"><img src="https://img.shields.io/badge/%236-blue?style=flat" alt="#6" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

chore(deps): update dependency vite to v5.4.19 [security]

<a href="https://github.com/movahedan/turbo-bun/commit/aec36ef3b5fb0dcb2657c4b3635e8e3fa78873fa"><img src="https://img.shields.io/badge/chore-aec36ef-495057?style=flat&logoColor=white" alt="chore" style="vertical-align: middle;" /></a>

### 📦 renovate/configure <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/turbo-bun/pull/4"><img src="https://img.shields.io/badge/%234-blue?style=flat" alt="#4" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

This PR configures Renovate with a new JSON schema and updates dependency version definitions across multiple package.json files, locking versions to explicit values.
Introduces a new Renovate configuration in renovate.json.
Updates dependency and devDependency versions in UI, Logger, Jest Presets, and various app package.json files.
Adds a new cleanup command and updates the Node engine version in the root package.json.

<a href="https://github.com/movahedan/turbo-bun/commit/f7215bb58c9b14cc4667079b632d8af4f6eabda0"><img src="https://img.shields.io/badge/fix-f7215bb-EF4444?style=flat&logoColor=white" alt="fix" style="vertical-align: middle;" /></a>

</details>