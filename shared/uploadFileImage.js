const fs = require("fs");
const path = require("path");

const saveImage = async (file) => {
  const { createReadStream, filename } = await file;
  const stream = createReadStream();

  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const filePath = path.join(uploadDir, filename);

  await new Promise((resolve, reject) => {
    stream
      .pipe(fs.createWriteStream(filePath))
      .on("finish", resolve)
      .on("error", reject);
  });

  return `/uploads/${filename}`;
};

module.exports = { saveImage };
