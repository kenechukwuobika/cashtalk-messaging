const sequelize = require("../config/database/connection");
const Chat = require("../models").chat;
const User = require("../models").user;
const { generateUploadUrl } = require("../space/space");
const chatHandler = require("../common/handlers/chatHandler");

exports.getChats = async (req, res) => {
  const chats = await Chat.findAll({
    include: User
  });
  res.status(200).send({
    success: true,
    chats
  });
};

exports.createChat = async (req, res) => {
  try {
    const chat = await chatHandler.createChatHandler();
    await chat.addUser(req.body.users);
    
    res.status(201).send({
      success: true,
      chat
    });
  } catch (error) {
    console.log(error)
  }
};

exports.chat = async (req, res) => {
  await sequelize.transaction(async t => {
    const data = req.body;
    try {
      const url = await generateUploadUrl();
      await Chat.create(
        { ...data, fileAccessKey: url },
        { transaction: t }
      );

      res.status(200).send({
        success: true,
        chat: "Chat Sent",
        data: url
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        chat: `${error.chat}`
      });
    }
  });
};

exports.findChat = async (req, res) => {
  const { senderId } = req.params;
  const { recipientId } = req.params;
  try {
    const chats = await Chat.findAll({
      where: {
        recipientId,
        senderId
      }
    });
    if (!chats) {
      res.status(404).send({
        success: false,
        chat: "Not Found"
      });
    }
    res.status(200).send({
      success: true,
      chat: chats
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      chat: `${error.chat}`
    });
  }
};
