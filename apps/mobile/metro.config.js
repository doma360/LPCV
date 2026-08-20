const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Cet environnement de dev sandboxé refuse le spawn de processus enfants
// (jest-worker lève "spawn EPERM") : on force Metro en mono-processus.
config.maxWorkers = 1;

module.exports = config;
