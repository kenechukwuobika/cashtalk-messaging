const express = require('express');
const chatController = require('../controllers/chatController');
const { protectRoute } = require("cashtalk-common");

const router = express.Router();

router.use(protectRoute);
router.get('/user', chatController.getChatByUsers)

router
.route('/')
.get(chatController.getAllChat);

router
.route('/:chatRoomId')
.get(chatController.getChatById)
.delete(chatController.deleteChat)

router.post('/:chatRoomId/archive', chatController.archiveChat)

module.exports = router;