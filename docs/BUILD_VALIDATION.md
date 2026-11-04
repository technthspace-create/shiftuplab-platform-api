# Build and validation status

The package was checked for ZIP integrity and JSON manifest validity during packaging. Dependency installation, framework builds, Prisma generation, automated tests, and live integration checks were not run in this environment. Run `npm install`, then the scripts in `package.json` in a network-enabled development environment. Review and commit the generated lockfile after dependency resolution. Do not deploy until all checks pass and environment-specific security configuration is complete.
