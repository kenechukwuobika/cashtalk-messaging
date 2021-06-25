module.exports = app => {
  const router = require("express").Router();
  const { authorizedToken } = require("../authorization/authorization");
  const messagingController = require("../controllers/messagingController");

  router.post("/message/send", authorizedToken, messagingController.messaging);
  router.get(
    "/message/getMessage/:senderId/:recipientId",
    authorizedToken,
    messagingController.findMessage
  );
  app.use("", router);
};
