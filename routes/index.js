const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");
const contactRoute = require("./contactRoute");

const router = require("express").Router();
router.use('/chats', chatRoute);
router.use('/messages', messageRoute);
router.use('/contacts', contactRoute);

module.exports = router;
