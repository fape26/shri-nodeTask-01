const express = require('express');
const {PORT, imgFolder} = require('./config');
const db = require ('./entities/Database');
const upload = require('./entities/JpegUpload');
const { replaceBackground } = require("backrem");
const fs = require("fs");
const path = require('path');


const app = express();

app.use(express.json());

app.use('/imgs', express.static(imgFolder));

app.get('/ping', (req, res) => res.json({ping: 'pong'}));

app.post('/upload' , upload.single('image'), async(req, res) => {
  
  db.saveImgMetaData(req.file);

  return res.json(req.file.id);
});

app.get('/list', (req, res) => {
    const allImgs = db.find();
    return res.json([allImgs])
});

app.get('/image/:id', (req, res) => {
  const jpegId = req.params.id;
  const fileUrl = db.findOne(jpegId)
  if (!fileUrl) {
    res.statusCode = 404
    return res.send('Image do not exist')
  } else {

    const file = fs.createReadStream(
      path.resolve(fileUrl)
    );
    res.setHeader("Content-Disposition", `attachment; filename=${jpegId}.jpeg`);
    file.pipe(res);
  }
});

app.delete('/image/:id', (req, res) => {
  const jpegId = req.params.id;
  const delFile = db.remove(jpegId);
  if (!delFile) {
    res.statusCode = 404
    return res.end()
  } else {
    res.statusCode === 200
    return res.json(req.params.id)
  }
})

app.get('/merge', (req, res) => {
  const {front, back, color, threshold} = req.query;
    const frontPath = db.findOne(front);
    const backPath = db.findOne(back);
    let newColor = color.split(',');
    if (!backPath || !frontPath) {
      res.statusCode = 404
      return res.send('Image do not exist')
    } else {
      const backImg = fs.createReadStream(
        path.resolve(frontPath)
      );
      const frontImg = fs.createReadStream(
        path.resolve(backPath)
      );
      replaceBackground(backImg, frontImg, newColor, threshold).then(
        (readableStream) => {
          res.setHeader("Content-Disposition", `attachment; filename=merged.jpeg`);
          readableStream.pipe(res);
      }).catch( err => {
        res.status(500).send(err.message);
      });
    }
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });