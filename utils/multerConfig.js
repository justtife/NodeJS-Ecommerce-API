const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
let upload = multer({
  storage,
});
module.exports = upload;
