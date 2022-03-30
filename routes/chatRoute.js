const express = require('express');
const chatController = require('../controllers/chatController');
const protectRoute = require('../middlewares/protectRoute');

const router = express.Router();

router.use(protectRoute);

router
.route('/')
.get(chatController.getAllChat);

router
.route('/:chatRoomId')
.get(chatController.getChat)
.delete(chatController.deleteChat)

router.post('/:chatRoomId/mute', chatController.muteChat)
router.post('/:chatRoomId/archive', chatController.archiveChat)

module.exports = router;