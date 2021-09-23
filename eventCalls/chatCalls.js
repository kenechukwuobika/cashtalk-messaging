const Messaging = require("../models").messaging;
const sequelize = require("../config/database/connection");

const insertIntoChat = async (recipients, text, sender) => {
  await sequelize.transaction(async t => {
    try {
      const recipient = recipients.join();

      await Messaging.create(
        {
          recipientId: recipient,
          senderId: sender,
          chat: text
        },
        { transaction: t }
      );
    } catch (error) {
      throw new Error("An Error Occured");
    }
  });
};

module.exports = { insertIntoChat };
