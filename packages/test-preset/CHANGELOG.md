## Changelog (@repo/test-preset)

[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-$E05735)](https://keepachangelog.com)
[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.0.3

### 📦 [object Object] <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/173"><img src="https://img.shields.io/badge/%23173-blue?style=flat" alt="#173" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/7%20commits-green?style=flat" alt="7 commits" style="vertical-align: middle;" />

#### 🎯 Overview
This PR refactors the intershell package to improve performance, code quality, and maintainability through several key improvements.
#### ✨ Key Changes
- **Package Management**: Convert EntityPackages.readJson() from async to sync operations
- **Changelog System**: Refactor changelog generation with improved range calculation methods
- **Entity Improvements**: Enhanced branch, commit, and tag entity functionality
- **Script Automation**: Add automatic dependency installation in version scripts
- **Dependency Management**: Properly categorize test dependencies as devDependencies
- **Code Quality**: Remove unused types, improve error handling, and clean up interfaces
#### 🔧 Technical Notes
- **Breaking Changes**: Some methods changed from async to sync (e.g., readJson, generateMergedChangelog)
- **Performance**: Synchronous file operations replacing async operations
- **Maintainability**: Cleaner APIs and better error handling
- **Automation**: Version scripts now automatically run bun install after updates

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/564bfb446a7b52c92748422e682a72c0efd681bf"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add automatic dependency installation to version-prepare ([564bfb4](https://github.com/movahedan/monobun/commit/564bfb446a7b52c92748422e682a72c0efd681bf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0140afd816343beed7ad32cfeb9355da4beefd84"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve commit-check with EntityBranch.getCurrentBranch() ([0140afd](https://github.com/movahedan/monobun/commit/0140afd816343beed7ad32cfeb9355da4beefd84)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1b3ba809e3b2599139d9c400306e7c6e92ead2b7"><img src="https://img.shields.io/badge/fix-(@repo/test%20preset)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> move test dependencies to devDependencies ([1b3ba80](https://github.com/movahedan/monobun/commit/1b3ba809e3b2599139d9c400306e7c6e92ead2b7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b97258df9c2376b0c0a9caf89d5b672e6eba617b"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update version scripts for new changelog methods ([b97258d](https://github.com/movahedan/monobun/commit/b97258df9c2376b0c0a9caf89d5b672e6eba617b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/24331b330041e8672bde381470c0651200187c0e"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> supporting entities with improved validation ([24331b3](https://github.com/movahedan/monobun/commit/24331b330041e8672bde381470c0651200187c0e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cd5f0ea0bd57e90e26287f02b3922309335748cf"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> changelog system with improved range calculation ([cd5f0ea](https://github.com/movahedan/monobun/commit/cd5f0ea0bd57e90e26287f02b3922309335748cf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b7b535c761276bc40fbce2f1d5726cf760dcc521"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> package reader funcs with synch operations ([b7b535c](https://github.com/movahedan/monobun/commit/b7b535c761276bc40fbce2f1d5726cf760dcc521)) by **Soheil Movahedan**

</details>

## v0.0.2

### 🔄 custom-version-management <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/154"><img src="https://img.shields.io/badge/%23154-blue?style=flat" alt="#154" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/37%20commits-green?style=flat" alt="37 commits" style="vertical-align: middle;" />

Merge pull request #154 from feature/custom-version-management

Refactors the version management system from a monolithic approach to a modular, 
entity-based architecture for better maintainability and separation of concerns.
- New Entity System: Implemented modular entities for changelog management, 
  package operations, and workspace handling
- Streamlined Scripts: Replaced 5 old version scripts with 3 focused scripts 
  (prepare, apply, ci)
- Better Architecture: Separated concerns between version preparation, 
  application, and CI workflows
- Secure Commit Validation: Built comprehensive validation system to replace 
  external commitlint dependencies
- Security Fixes: Resolved ReDoS vulnerabilities and implemented secure regex practices
- Code Quality: Eliminated duplication across CLI tools and commit types
- Interactive CLI: Added modern CLI with callback-based key handling
- Git Integration: Fixed commit message parsing and scope validation
- Updated Documentation: Synchronized all docs to reflect the new architecture
This completes the transformation from legacy version management to a robust, 
secure, and maintainable system.

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/ffbaf81441d032858ecee772fab304d54e220c38"><img src="https://img.shields.io/badge/feat-(scripts)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add scripts as valid commit scope ([ffbaf81](https://github.com/movahedan/monobun/commit/ffbaf81441d032858ecee772fab304d54e220c38)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cc167a0abf140e447879ede6cfb2f5e2e16e7a6c"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> handle trailing newlines in commit message validation ([cc167a0](https://github.com/movahedan/monobun/commit/cc167a0abf140e447879ede6cfb2f5e2e16e7a6c)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/1fca8463b4c7f57b77145874b9480efc83420bdf"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate duplication in CLI tools ([1fca846](https://github.com/movahedan/monobun/commit/1fca8463b4c7f57b77145874b9480efc83420bdf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f1f23be1a4e90452c336d9b570b6431d327fba1d"><img src="https://img.shields.io/badge/refactor-(types)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate duplication in commit types ([f1f23be](https://github.com/movahedan/monobun/commit/f1f23be1a4e90452c336d9b570b6431d327fba1d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/197b1a39903f1a4e04022c9dafca2c7a2e0a2f76"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove duplicate quickActions arrays ([197b1a3](https://github.com/movahedan/monobun/commit/197b1a39903f1a4e04022c9dafca2c7a2e0a2f76)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8205f95562cf1fe4999f81c2d50d59b97e27cc49"><img src="https://img.shields.io/badge/refactor-(scripts)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> eliminate commit type duplication ([8205f95](https://github.com/movahedan/monobun/commit/8205f95562cf1fe4999f81c2d50d59b97e27cc49)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d1283fd5607f9e0de661f55185aee6543128686d"><img src="https://img.shields.io/badge/fix-(scripts)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> secure regex patterns to prevent ReDoS attacks ([d1283fd](https://github.com/movahedan/monobun/commit/d1283fd5607f9e0de661f55185aee6543128686d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/53bcc994019d0ef71d23609ad756aa330c0d397b"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> optimize getAffectedServices with single-pass processing ([53bcc99](https://github.com/movahedan/monobun/commit/53bcc994019d0ef71d23609ad756aa330c0d397b)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/17f60c848b868f1b0373ea96c68da0ee783d4bc9"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update commit validation and check logic ([17f60c8](https://github.com/movahedan/monobun/commit/17f60c848b868f1b0373ea96c68da0ee783d4bc9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d5f212f53ce012bc1b9ba40452e200d998a0092f"><img src="https://img.shields.io/badge/perf-(root)-60a5fa?style=flat" alt="perf" style="vertical-align: middle;" /></a> optimize package operations and simplify version management ([d5f212f](https://github.com/movahedan/monobun/commit/d5f212f53ce012bc1b9ba40452e200d998a0092f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/491c9af7a51a8c19b01367777254d1ead511eb5e"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance changelog generation and management ([491c9af](https://github.com/movahedan/monobun/commit/491c9af7a51a8c19b01367777254d1ead511eb5e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3c542c44a0d6a1ae42bd93a5765e87a32cf7d59a"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> extract PR handling and enhance commit types ([3c542c4](https://github.com/movahedan/monobun/commit/3c542c44a0d6a1ae42bd93a5765e87a32cf7d59a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/463d9e3bc403426596f962c82f8ec114989cbcb8"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> improve changelog and commit management entities ([463d9e3](https://github.com/movahedan/monobun/commit/463d9e3bc403426596f962c82f8ec114989cbcb8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/65c7cf5ef3ebff992698629d6c545bbaf1893699"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> changelog ([65c7cf5](https://github.com/movahedan/monobun/commit/65c7cf5ef3ebff992698629d6c545bbaf1893699)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3f17cb554a4a29e7e4a19e683455ab050bf806d7"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update branch name check command in CI configuration ([3f17cb5](https://github.com/movahedan/monobun/commit/3f17cb554a4a29e7e4a19e683455ab050bf806d7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/837d60c2bb29ac2605704a6040da8d09092321ca"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> regex vulnerability to super-linear runtime due to backtracking ([837d60c](https://github.com/movahedan/monobun/commit/837d60c2bb29ac2605704a6040da8d09092321ca)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926"><img src="https://img.shields.io/badge/merge-(noscope)-6B7280?style=flat" alt="merge" style="vertical-align: middle;" /></a> Merge branch 'main' into feature/custom-version-management ([b37e159](https://github.com/movahedan/monobun/commit/b37e15986ae58fd721675826fde24742afcab926)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/108e8b7a31f920b9986cc0f46642f68afc172ee8"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> attach affected script for turbo ([108e8b7](https://github.com/movahedan/monobun/commit/108e8b7a31f920b9986cc0f46642f68afc172ee8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/bd76b9a0661473c6934c6849152e976e29559a18"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove old version management scripts and utilities ([bd76b9a](https://github.com/movahedan/monobun/commit/bd76b9a0661473c6934c6849152e976e29559a18)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c1dae1ef11b73d4f96472aca4a3e1cb98f173c58"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependencies and configuration for new architecture ([c1dae1e](https://github.com/movahedan/monobun/commit/c1dae1ef11b73d4f96472aca4a3e1cb98f173c58)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9ef9a2626f03bba09fb94e81ce1c3e7807603df6"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update existing scripts for new entity-based architecture ([9ef9a26](https://github.com/movahedan/monobun/commit/9ef9a2626f03bba09fb94e81ce1c3e7807603df6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/e76fa8f4dd4857d616bec0f1fd090153046b8ac8"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add new version management scripts with entity-based architecture ([e76fa8f](https://github.com/movahedan/monobun/commit/e76fa8f4dd4857d616bec0f1fd090153046b8ac8)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0c927e8cf7f8e238d4ecbf1f0446e8a4a47bee15"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> implement entity-based architecture for version management ([0c927e8](https://github.com/movahedan/monobun/commit/0c927e8cf7f8e238d4ecbf1f0446e8a4a47bee15)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/459a77a3e90d94d7fc1b3c336c6e02bcdb53efdb"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation for new entity-based version management ([459a77a](https://github.com/movahedan/monobun/commit/459a77a3e90d94d7fc1b3c336c6e02bcdb53efdb)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/3791f6cc6a25f067d29c84386e041b5faefd7458"><img src="https://img.shields.io/badge/fix-(noscope)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> replace vulnerable regex patterns with trimEnd() to prevent ReDoS attacks ([3791f6c](https://github.com/movahedan/monobun/commit/3791f6cc6a25f067d29c84386e041b5faefd7458)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/12f1c895bd556e04c38d5b8725eaf5fda04e3daf"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> exclude scripts directory from test coverage ([12f1c89](https://github.com/movahedan/monobun/commit/12f1c895bd556e04c38d5b8725eaf5fda04e3daf)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/ab302c36ff6f65ee44b8efcbcc96887b034ea505"><img src="https://img.shields.io/badge/test-(root)-10B981?style=flat" alt="test" style="vertical-align: middle;" /></a> check if package list output is fixed ([ab302c3](https://github.com/movahedan/monobun/commit/ab302c36ff6f65ee44b8efcbcc96887b034ea505)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/8c63d4c6f2a6bc29220aaba96374c4a47c1f0d05"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update lefthook and ci workflows ([8c63d4c](https://github.com/movahedan/monobun/commit/8c63d4c6f2a6bc29220aaba96374c4a47c1f0d05)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6e862c5afe03bf169c0afee6ae46ff1c4f74375a"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove commitlint dependencies and update scripts ([6e862c5](https://github.com/movahedan/monobun/commit/6e862c5afe03bf169c0afee6ae46ff1c4f74375a)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/dd40c62cf9423584accf069bc4e502e97c3f3876"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove legacy CI scripts and commitlint config ([dd40c62](https://github.com/movahedan/monobun/commit/dd40c62cf9423584accf069bc4e502e97c3f3876)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9017136cbf6d03854beccd7ba3df6f9581162b69"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add commit-check and commit-staged-check scripts to replace external commitlint dependencies ([9017136](https://github.com/movahedan/monobun/commit/9017136cbf6d03854beccd7ba3df6f9581162b69)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a1c1d19ac43c14a4d49a18cf2f5cfd6231b8f209"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> merge step manager into commit-interactive and remove unnecessary complexity ([a1c1d19](https://github.com/movahedan/monobun/commit/a1c1d19ac43c14a4d49a18cf2f5cfd6231b8f209)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c14afc6f23359269e9da0dacf9d3a83864d8f7f0"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> consolidate commit parsing logic into shared utilities ([c14afc6](https://github.com/movahedan/monobun/commit/c14afc6f23359269e9da0dacf9d3a83864d8f7f0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0b7f0da259104d4b4a80d77318b55cfdbbf6ff7f"><img src="https://img.shields.io/badge/feat-(root)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add InteractiveCLI with callback-based key handling ([0b7f0da](https://github.com/movahedan/monobun/commit/0b7f0da259104d4b4a80d77318b55cfdbbf6ff7f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/cd0d521425be634470e4e234421615caa8cb574d"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update build configuration and generated files ([cd0d521](https://github.com/movahedan/monobun/commit/cd0d521425be634470e4e234421615caa8cb574d)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/50dc3457473b592bc2d316b4f33fb8f522b4f1b5"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update documentation for new version management system ([50dc345](https://github.com/movahedan/monobun/commit/50dc3457473b592bc2d316b4f33fb8f522b4f1b5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a3e82ef0201cfb912930f1512352a743da9ed771"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> replace changesets with custom version management ([a3e82ef](https://github.com/movahedan/monobun/commit/a3e82ef0201cfb912930f1512352a743da9ed771)) by **Soheil Movahedan**

</details>


### 🔄 refactor/rename-project-to-monobun <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/161"><img src="https://img.shields.io/badge/%23161-blue?style=flat" alt="#161" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/1%20commits-green?style=flat" alt="1 commits" style="vertical-align: middle;" />

Merge pull request #161 from movahedan/refactor/rename-project-to-monobun

refactor: rename project from Turbobun to Monobun

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/66e4dadf774f24dfaf9936bfbda50f1d7e4b030d"><img src="https://img.shields.io/badge/refactor-(noscope)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> Squashed changes from PR (rename project from Turbobun to Monobun) ([66e4dad](https://github.com/movahedan/monobun/commit/66e4dadf774f24dfaf9936bfbda50f1d7e4b030d)) by **Soheil Movahedan**

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