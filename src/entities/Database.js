const { EventEmitter } = require('events');
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

  saveImgMetaData (imgContent) {
    const { id, size, mimetype } = imgContent;
    const resObj = {
      id: id,
      uploadedAt: Date.now(),
      size: size,
      body: Buffer.from('tést'),
      mimeType: mimetype,
      // url: `/imgs/${imgContent.filename}`,
    }
    this.idToJpeg[id] = resObj;
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
      return `${dbFolder}/imgs/${jpegRaw.id}_uploadedFile.jpeg`
    }
  }

  find() {
    let allJpegs = Object.values(this.idToJpeg);
    allJpegs.sort((jpegA, jpegB) => jpegB.createdAt - jpegA.createdAt);

    return allJpegs;
  }
}

const db = new Database();

db.initFromDump();

db.on('changed', () => {
  writeFile(dbDumpFile, jsonToString(db.idToJpeg));
});

module.exports = db;