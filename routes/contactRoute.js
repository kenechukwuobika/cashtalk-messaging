const express = require('express');
const contactController = require('../controllers/contactController');
const protectRoute = require('../middlewares/protectRoute');

const router = express.Router();

router.use(protectRoute);

router
.route('/')
.get(contactController.getContacts);

router
.route('/:contactId')
.delete(contactController.deleteContact);

router.post('/sync', contactController.syncContact);
// router.post('/:contactId/star', contactController.muteContact)

module.exports = router;