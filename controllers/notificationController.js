const { Op } = require("sequelize");
const { ChatInstance } = require('../models');
const sequelize = require('../config/database/connection');

exports.muteChat = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { chatRoomId } = req.params;
            const { isMuted } = req.body;
            const chatData = { isMuted };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId: req.user.id
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];
            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            });


        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });
}