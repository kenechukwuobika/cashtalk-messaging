const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");

const router = require("express").Router();
router.use('/chats', chatRoute);
router.use('/messages', messageRoute);

module.exports = router;
