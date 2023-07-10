const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const fileName = file.filename;
        const filePath = file.path;

        const resizedFileName = `resized-${fileName}`;
        const resizedFilePath = path.join(
          __dirname,
          `../public/images/${resizedFileName}`
        );

        await sharp(filePath)
          .resize(300, 300)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(resizedFilePath);

        fs.unlinkSync(filePath); // Remove o arquivo original
        file.path = resizedFilePath;
        file.filename = resizedFileName;
      })
    );

    next();
  } catch (error) {
    next(error);
  }
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(300, 300)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/blog/${file.filename}`);
      //fs.unlinkSync(`public/images/blog/${file.filename}`);
    })
  );
  next();
};
module.exports = { uploadPhoto, productImgResize, blogImgResize };