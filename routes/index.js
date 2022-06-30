const router = require("express").Router();

const chatRoute = require("./chatRoute");
const messageRoute = require("./messageRoute");
const contactRoute = require("./contactRoute");
const mediaRoute = require("./mediaRoute");

router.use('/chats', chatRoute);
router.use('/messages', messageRoute);
router.use('/contacts', contactRoute);
router.use('/media', mediaRoute);

module.exports = router;
