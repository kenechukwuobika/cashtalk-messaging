const { Op } = require("sequelize");
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { AppError } = require("cashtalk-common");

const sequelize = require('../config/database/connection');

const s3 = new aws.S3({
    region: process.env.AWS_REGION_NAME,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    bucket: process.env.AWS_BUCKET_NAME,
    secretAccessKey: process.env.AWS_SECRET_KEY
})

const multerStorage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key(request, file, cb) {
        if(file.mimetype.startsWith("image")) {
            imageStorage(request, file, cb)
        }
        else if(file.mimetype.startsWith("video")) {
            videoStorage(request, file, cb)
        }
        else if(file.mimetype.startsWith("application")) {
            documentStorage(request, file, cb)
        }

    }
})

const multerFilter = (req, file, callback) => {
    console.log(file)
    if (file.mimetype.startsWith("image")) {
        imageFilter(file, callback);
        return;
    }
    else if (file.mimetype.startsWith("video")) {
        videoFilter(file, callback);
        return;
    }
    else if (file.mimetype.startsWith("application")) {
        documentFilter(file, callback);
        return;
    }
}

const imageFilter = (file, callback) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        callback(null, true);
      } else {
        console.log("only jpg & png file supported!!");
        callback(null, false);
        throw new Error("only jpg & png file  are supported");
      }
}

const videoFilter = (file, callback) => {
    if (
        file.mimetype === "video/mp4" ||
        file.mimetype === "video/mkv"
      ) {
        callback(null, true);
      } else {
        console.log("only mp4 & mkv file supported!!");
        callback(null, false);
        throw new Error("only mp4 & mkv file  are supported");
      }
}

const documentFilter = (file, callback) => {
    if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/x-zip-compressed"
      ) {
        callback(null, true);
      } else {
        console.log("only pdf & zip files supported!!");
        callback(null, false);
        throw new Error("only pdf & zip files are supported");
      }
}

const imageStorage = (request, file, cb) => {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const time = date.getTime();
    const dateCombined = `${year}${month}${day}${time}`;
    const imageName = `CT-IMG-${dateCombined}`;
    const ext = file.originalname.split(".")[1];
    const imageKey = `${imageName}.${ext}`;
    request.imageName = imageKey;
    cb(null, imageKey);
}

const videoStorage = (request, file, cb) => {
    const date = new Date(Date.now());
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const time = date.getTime();
    const dateCombined = `${year}${month}${day}${time}`;
    const videoName = `CT-VID-${dateCombined}`;
    const ext = file.originalname.split(".")[1];
    const videoKey = `${videoName}.${ext}`;
    request.videoName = videoKey;
    cb(null, videoKey);
}

const documentStorage = (request, file, cb) => {
    const docName = file.originalname;
    const ext = docName.split(".")[1];
    const docKey = `${docName}.${ext}`;
    request.docName = docKey;
    cb(null, docKey);
}

exports.upload = multer({
    storage: multerStorage,
    limit: 30000,
    fileFilter: multerFilter
});


exports.uploadfile = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            if(!req.file){
                return next(new AppError(400, "Please provide a valid image"));
            }
    
            const { key } = req.file;
    
            if(!key){
                return next(new AppError(400, "Please provide a valid image"));
            }
    
            const data = {
                imageKey: key
            }

            res.status(200).json({
                status: 'success',
                data
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            })
        }
    });
}