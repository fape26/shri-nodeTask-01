const { nanoid } = require('nanoid');

module.exports = {
    generateId: () => nanoid(10)
  };