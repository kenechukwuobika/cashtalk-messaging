const sequelize = require("../config/database/connection");
const Messaging = require("../models").messaging;
const { generateUploadUrl } = require("../space/space");

exports.getMessages = async (req, res) => {
  const messages = await Messaging.findAll();
  console.log(messages)
  res.status(200).send({
    success: true,
    messages
  });
};

exports.messaging = async (req, res) => {
  await sequelize.transaction(async t => {
    const data = req.body;
    try {
      const url = await generateUploadUrl();
      await Messaging.create(
        { ...data, fileAccessKey: url },
        { transaction: t }
      );

      res.status(200).send({
        success: true,
        message: "Message Sent",
        data: url
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `${error.message}`
      });
    }
  });
};

exports.findMessage = async (req, res) => {
  const { senderId } = req.params;
  const { recipientId } = req.params;
  try {
    const messages = await Messaging.findAll({
      where: {
        recipientId,
        senderId
      }
    });
    if (!messages) {
      res.status(404).send({
        success: false,
        message: "Not Found"
      });
    }
    res.status(200).send({
      success: true,
      message: messages
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `${error.message}`
    });
  }
};
