# Updating Versions of Java and/or node

## Updating the Java version

When updating the version of Java used, the following places need to be adjusted:

- `Versions` section of the README.md
- `pom.xml` file
- `.java-version` file (used by Github Actions scripts)
- `Dockerfile` used for deploying on Dokku

## Updating the node version

The node version should match `node_lts` in the `_config.yml` of the course
website repo for the current quarter (e.g. `ucsb-cs156/f26`), since that is
the version the course installation instructions tell students to install.

- `Versions` section of the README.md
- `.nvmrc` at the top level of the repo (so that `nvm use` with no argument picks the right version)
- `engines` section in `frontend/package.json` (this is used by Github Actions scripts, including the
  reusable workflows in `ucsb-cs156/workflows`, via `node-version-file`)
- `frontend/package-lock.json` (run `npm install --package-lock-only` in `frontend` after changing `engines`)
- `Dockerfile` used for deploying on Dokku has no separate node setting: it runs `mvn -Pproduction`, which
  downloads the node version named in `pom.xml` via `frontend-maven-plugin`
- `pom.xml` in the configuration of `frontend-maven-plugin` (adjust both the node and npm versions)
- `NVM_USE` in `.github/workflows/99-team02.yml`, `91-create-one-off-issues.yml` and
  `92-create-issues-for-db-table.yml` (this text ends up in the issues generated for students)
- `.github/copilot-instructions.md`
- The `nvm use` command in the message in
  `src/main/java/edu/ucsb/cs156/example/controllers/FrontendProxyController.java`
- `nvm_use` / `{{site.node_lts}}` in the assignment page (`lab/team02.md`) in the course website repo
