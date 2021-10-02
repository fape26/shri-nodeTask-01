const multer = require('multer');
const {imgFolder} = require('../config');
const { generateId } = require('../utils/generateId');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, imgFolder)
    },
    filename: function (req, file, cb) {
      file.id = generateId();
      file.filename = `${file.id}_uploadedFile.jpeg`
      cb(null, file.filename)
    }
})

module.exports = multer({ storage: storage })