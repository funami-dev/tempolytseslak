const { setup: setupDevServer } = require("jest-dev-server");

module.exports = async function globalSetup() {
  await setupDevServer({
    command: `yarn dev`,
    launchTimeout: 50000,
    port: 3000
  });
};
