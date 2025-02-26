const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, only images and videos are allowed!"),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
