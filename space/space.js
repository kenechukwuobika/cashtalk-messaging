const AWS = require("aws-sdk");
const fs = require("fs"); // Needed for example below
const crypto = require("crypto");
const { promisify } = require("util");

const randomBytes = promisify(crypto.randomBytes);

const spacesEndpoint = new AWS.Endpoint("sfo3.digitaloceanspaces.com");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACE_KEY,
  secretAccessKey: process.env.SPACE_SECRETKEY
});

const generateUploadUrl = async () => {
  const expireSeconds = 60 * 5;
  const spaceName = "cashtalk";

  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");
  const url = s3.getSignedUrl("putObject", {
    Bucket: spaceName,
    Key: imageName,
    ContentType: "text",
    Expires: expireSeconds
  });

  return url;
};

module.exports = { generateUploadUrl };
