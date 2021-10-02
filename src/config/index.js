const path = require('path');

const dbFolder = path.resolve(__dirname, '../../db/');
const dbDumpFile = path.resolve(dbFolder, 'dump.json');
const imgFolder = path.resolve(dbFolder, 'imgs');

module.exports = {
  PORT: 8080,
  dbFolder,
  imgFolder,
  dbDumpFile,
};