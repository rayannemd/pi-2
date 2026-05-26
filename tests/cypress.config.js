const { defineConfig } = require("cypress");
const allureWriter = require('@shelex/cypress-allure-plugin/writer');

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    },
    env: {
      allure: true,
      allureResultsPath: "allure-results"
    }
  },
});