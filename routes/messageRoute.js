const express = require('express');
const messageController = require('../controllers/messageController');
const { protectRoute } = require("cashtalk-common");

const router = express.Router();

router.use(protectRoute);

router
.route('/')
.get(messageController.getAllMessages);

router
.route('/:messageId')
.get(messageController.getMessage)
.delete(messageController.deleteMessage)

// router.post('/:messageId/star', messageController.muteMessage)

module.exports = router;