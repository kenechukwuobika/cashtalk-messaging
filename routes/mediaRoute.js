const express = require('express');
const mediaController = require('../controllers/mediaController');
const { protectRoute } = require("cashtalk-common");

const router = express.Router();

router.use(protectRoute);

router
.route('/')
.post(mediaController.upload.single('files'), mediaController.uploadfile);

module.exports = router;