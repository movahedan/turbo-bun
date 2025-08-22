## Changelog (@repo/intershell)

[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-$E05735)](https://keepachangelog.com)
[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v0.1.0
###### <a href="https://github.com/movahedan/monobun/commit/2516669d74bc53aba52b5a1f7477a7fbd52fec84"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> streamline commit and version change ([2516669](https://github.com/movahedan/monobun/commit/2516669d74bc53aba52b5a1f7477a7fbd52fec84)) by **Soheil Movahedan**

### 🔄 feature/staged-check <img src="https://img.shields.io/badge/Code%20Quality%20%26%20Refactoring-495057?style=flat" alt="Code Quality & Refactoring" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/172"><img src="https://img.shields.io/badge/%23172-blue?style=flat" alt="#172" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/2%20commits-green?style=flat" alt="2 commits" style="vertical-align: middle;" />

#### 🎯 Overview
This PR refactors the commit validation system to improve code organization and add comprehensive staged file validation capabilities.
#### ✨ Key Changes
- Staged File Validation: Added getStagedFiles() and validateStagedFiles() methods to EntityCommit
- Naming Consistency: Renamed prefixes to prefix throughout branch entity for better clarity
- Code Organization: Moved staged file validation logic from scripts into the commit entity
- Enhanced Validation: Added configurable validation rules with file patterns, content patterns, and ignore rules
- CI Environment Support: Improved error handling and CI environment detection
- Bug Fixes: Fixed duplicate error throwing in commit-check script
#### 🔧 Technical Notes
- No Breaking Changes: All public APIs remain compatible
- Enhanced Validation: New StagedConfig type for configurable validation rules
- Better Separation of Concerns: Validation logic moved from scripts to entities
- Improved Error Reporting: More detailed error messages and better CI handling

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/f04724b8c57dcb1910e83e02283a886ee56a2b9e"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> simplify branch parsing logic in EntityBranch ([f04724b](https://github.com/movahedan/monobun/commit/f04724b8c57dcb1910e83e02283a886ee56a2b9e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/985900784f4459adc5eafe4d73b8920a8c55d3c5"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> add staged-check to commit entity ([9859007](https://github.com/movahedan/monobun/commit/985900784f4459adc5eafe4d73b8920a8c55d3c5)) by **Soheil Movahedan**

</details>

## v0.0.0

### 📦 feature/intershell <img src="https://img.shields.io/badge/Dependency%20Updates-495057?style=flat" alt="Dependency Updates" style="vertical-align: middle;" /> <a href="https://github.com/movahedan/monobun/pull/171"><img src="https://img.shields.io/badge/%23171-blue?style=flat" alt="#171" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/24%20commits-green?style=flat" alt="24 commits" style="vertical-align: middle;" />

#### 🎯 Overview
This PR introduces a major architectural refactoring by creating the new  CLI framework package and reorganizing the development infrastructure.
##### ✨ Key Changes
- **New CLI Framework Package**: Created  with core utilities, entities, and interactive CLI capabilities
- **Docker Reorganization**: Moved development Docker files from  to root for better accessibility
- **Script Modernization**: Updated all scripts to use the new intershell package, removing duplicated code
- **Dependency Cleanup**: Removed old entities and shell utilities, added  as workspace dependency
##### 🔧 Technical Notes
- **Breaking Change**: This refactoring removes old CLI utilities from  directory
- **New Package Structure**:  provides modular CLI framework with TypeScript support
- **Improved Maintainability**: Centralized CLI logic reduces code duplication across the monorepo
- **Better Development Experience**: Reorganized Docker setup improves local development workflow

<details><summary><strong>📝 Commits</strong> (Click to expand)</summary>

- <a href="https://github.com/movahedan/monobun/commit/fe8a65a1f499b33588bb7a558de88bf1b02fe165"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> reorganize vscode-service configuration in docker-compose.dev.yml ([fe8a65a](https://github.com/movahedan/monobun/commit/fe8a65a1f499b33588bb7a558de88bf1b02fe165)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/04f9843735a05c6de57ab402011b3078bbbc3cba"><img src="https://img.shields.io/badge/docs-(@repo/intershell)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update README.md with dependency graph ([04f9843](https://github.com/movahedan/monobun/commit/04f9843735a05c6de57ab402011b3078bbbc3cba)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/fac2a1de6114513ab8a6744f4c46fcbab16e43c0"><img src="https://img.shields.io/badge/feat-(noscope)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> improve logging in version-prepare script ([fac2a1d](https://github.com/movahedan/monobun/commit/fac2a1de6114513ab8a6744f4c46fcbab16e43c0)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/222aff9f7b1881c9a58d6cf5577fc82daa3245de"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove unused changelog template files ([222aff9](https://github.com/movahedan/monobun/commit/222aff9f7b1881c9a58d6cf5577fc82daa3245de)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6fd33d78f65de3a0a41c85b3aa7c04d6f1162926"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update dependencies and version management scripts ([6fd33d7](https://github.com/movahedan/monobun/commit/6fd33d78f65de3a0a41c85b3aa7c04d6f1162926)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/6025ea8b169ee74681faa7c5679b369d700d6fee"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance package and tag management entities ([6025ea8](https://github.com/movahedan/monobun/commit/6025ea8b169ee74681faa7c5679b369d700d6fee)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/0e1b09040f3e7a46355b4f5e66296754e8935de7"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> improve commit and PR entity functionality ([0e1b090](https://github.com/movahedan/monobun/commit/0e1b09040f3e7a46355b4f5e66296754e8935de7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/dcc9796f3a004726962d84e1af03bd100be0b418"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> enhance changelog functionality and wrapshell core ([dcc9796](https://github.com/movahedan/monobun/commit/dcc9796f3a004726962d84e1af03bd100be0b418)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/9d34f92acfdf518914d3d94fef3e5b690bcd564e"><img src="https://img.shields.io/badge/chore-(noscope)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update code docs ([9d34f92](https://github.com/movahedan/monobun/commit/9d34f92acfdf518914d3d94fef3e5b690bcd564e)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/f6ef8aefabc44eb4a30ce7a39fa732b1b013c031"><img src="https://img.shields.io/badge/docs-(root)-646CFF?style=flat" alt="docs" style="vertical-align: middle;" /></a> update docs ([f6ef8ae](https://github.com/movahedan/monobun/commit/f6ef8aefabc44eb4a30ce7a39fa732b1b013c031)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c8c3155eb260b3fcebb5d8aef0e05e3562039260"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> correct service entries access in EntityCompose ([c8c3155](https://github.com/movahedan/monobun/commit/c8c3155eb260b3fcebb5d8aef0e05e3562039260)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/c1b60510155bb075e932b3cc36168baffe6c501f"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> update service name handling in EntityCompose ([c1b6051](https://github.com/movahedan/monobun/commit/c1b60510155bb075e932b3cc36168baffe6c501f)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/edfcbd2280870725e8854674ea9e7551d2bca3e7"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> correct base SHA retrieval in PR handling ([edfcbd2](https://github.com/movahedan/monobun/commit/edfcbd2280870725e8854674ea9e7551d2bca3e7)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d0196933cd7f858b70286c472eea39fe30968e88"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> add logging for unsuccessful tag retrieval ([d019693](https://github.com/movahedan/monobun/commit/d0196933cd7f858b70286c472eea39fe30968e88)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/a47c1a90021f6467c9268be76f47e9f3a6790057"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve branch name handling in getBaseTagSha ([a47c1a9](https://github.com/movahedan/monobun/commit/a47c1a90021f6467c9268be76f47e9f3a6790057)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/31bb59ea602f9c91d27920bc4e11707a69a8f8a5"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> increase maxLength for commit description to 100 ([31bb59e](https://github.com/movahedan/monobun/commit/31bb59ea602f9c91d27920bc4e11707a69a8f8a5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d49597dff19c7212603f5a8967bce2b4b889dfba"><img src="https://img.shields.io/badge/refactor-(@repo/intershell)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> remove entity duplication ([d49597d](https://github.com/movahedan/monobun/commit/d49597dff19c7212603f5a8967bce2b4b889dfba)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/afe677d9becd993fbec53deff0f77b864610c6c2"><img src="https://img.shields.io/badge/fix-(@repo/intershell)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve SonarQube regex security vulnerability ([afe677d](https://github.com/movahedan/monobun/commit/afe677d9becd993fbec53deff0f77b864610c6c2)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/171a77ec8abbf8e29ca428856c01c642f9ba67d9"><img src="https://img.shields.io/badge/fix-(root)-EF4444?style=flat" alt="fix" style="vertical-align: middle;" /></a> resolve update-package-json script issue ([171a77e](https://github.com/movahedan/monobun/commit/171a77ec8abbf8e29ca428856c01c642f9ba67d9)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/598b1d2ff1b59a243e5c2da2eb493c6dd7a2a2b6"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> update biome configuration ([598b1d2](https://github.com/movahedan/monobun/commit/598b1d2ff1b59a243e5c2da2eb493c6dd7a2a2b6)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b9482d448fb9c49518a95bb59bcecbe135aae3f5"><img src="https://img.shields.io/badge/chore-(root)-495057?style=flat" alt="chore" style="vertical-align: middle;" /></a> remove old devcontainer files and entities ([b9482d4](https://github.com/movahedan/monobun/commit/b9482d448fb9c49518a95bb59bcecbe135aae3f5)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/d028817a47549924bc26f2af7f9e43c2b7dbe211"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> update scripts to use @repo/intershell package ([d028817](https://github.com/movahedan/monobun/commit/d028817a47549924bc26f2af7f9e43c2b7dbe211)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b6bb32cc07e50411014387eb368510e77c02dd70"><img src="https://img.shields.io/badge/refactor-(root)-007ACC?style=flat" alt="refactor" style="vertical-align: middle;" /></a> move dev Docker files to root directory ([b6bb32c](https://github.com/movahedan/monobun/commit/b6bb32cc07e50411014387eb368510e77c02dd70)) by **Soheil Movahedan**
- <a href="https://github.com/movahedan/monobun/commit/b68de0c26cdca5f19260673c469c9d527ceafee5"><img src="https://img.shields.io/badge/feat-(@repo/intershell)-00D4AA?style=flat" alt="feat" style="vertical-align: middle;" /></a> add CLI framework package ([b68de0c](https://github.com/movahedan/monobun/commit/b68de0c26cdca5f19260673c469c9d527ceafee5)) by **Soheil Movahedan**

</details>
