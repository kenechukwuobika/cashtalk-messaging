const Chat = require("../../models").chat;
const sequelize = require("../../config/database/connection");

exports.createChatHandler = async (data) => {
  
  return await sequelize.transaction(async t => {
    try {

      const chat = await Chat.create({},
        { transaction: t }
      );

      return chat;
    } catch (error) {
      throw new Error(error);
    }
  });
};

const updateChatHandler = async (data) => {
  const {recipients, text, sender} = data;
  await sequelize.transaction(async t => {
    try {
      const recipient = recipients.join();

      await Chat.create(
        {
          recipientId: recipients,
          senderId: sender,
          chat: text
        },
        { transaction: t }
      );
    } catch (error) {
      throw new Error(error);
    }
  });
};