const { EventEmitter } = require('events');       //rename dbAdapter
const { existsSync } = require('fs');
const { dbDumpFile, dbFolder } = require('../config');
const { writeFile, removeFile } = require('../utils/fs.js');
const { jsonToString } = require('../utils/jsonToString');


class Database extends EventEmitter {
  constructor() {
    super();

    this.idToJpeg = {};
  }

  async initFromDump() {
    if (existsSync(dbDumpFile) === false) {
      return;
    }

    const dump = require(dbDumpFile);

    if (typeof dump === 'object') {
      this.idToJpeg = dump;
    } else {
      this.idToJpeg = {};
    }
  }

  async saveImgMetaData (imgContent) {
    const resObj = {
      id: imgContent.id,
      createDate: Date.now(),
      size: imgContent.size,
      mimetype: imgContent.mimetype,
      url: `/imgs/${imgContent.filename}`,
    }
    this.idToJpeg[resObj.id] = resObj

    this.emit('changed');
  }

  async remove(jpegId) {
    const jpegRaw = this.idToJpeg[jpegId];
    
    if (!jpegRaw) {
      return false;
    } else {
      await removeFile(`${dbFolder}${jpegRaw.url}`);

      delete this.idToJpeg[jpegId];

      this.emit('changed');
      return true
    }
  }

  findOne(jpegId) {
    const jpegRaw = this.idToJpeg[jpegId];

    if (!jpegRaw) {
      return false;
    } else {
      return `${dbFolder}${jpegRaw.url}`
    }
  }

  find() {
    let allJpegs = Object.values(this.idToJpeg);
    allJpegs.sort((jpegA, jpegB) => jpegB.createdAt - jpegA.createdAt);

    return this.idToJpeg;
  }
}

const db = new Database();

db.initFromDump();

db.on('changed', () => {
  writeFile(dbDumpFile, jsonToString(db.idToJpeg));
});

module.exports = db;