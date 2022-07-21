const { Op } = require("sequelize");
const User = require('../models').user;
const ChatRoom = require('../models').chatRoom;
const ChatInstance = require('../models').chatInstance;
const Message = require('../models').message;
const DeletedMessage = require('../models').deletedMessage;
const Contact = require('../models').contact;
const sequelize = require('../config/database/connection');

exports.getContacts = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const user = req.user;
            const { page } = req.query;
            const limit = 100;
            const offset = (page - 1) * limit || 0;
            const contacts = await Contact.findAll({
                where: {
                    userId: user.id
                },
                limit,
                offset,
            });

            res.status(200).json({
                status: 'success',
                result: contacts.length,
                data: contacts
            })

        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            })
        }
    });
}

exports.syncContact = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            let registeredContacts = [];
            const { user } = req;
            const { contactData } = req.body;
            if(contactData){
                contactData.forEach(async data => {
                    const registeredUser = await User.findOne({
                        where: {
                            phoneNumber: data.phoneNumber
                        }
                    })
                    if(registeredUser){
                        const contact = await Contact.create({
                            userId: user.id,
                            contactId: registeredUser.id,
                            contactPhoneNumber: registeredUser.phoneNumber,
                        });
                        registeredContacts.push(data);
                    }
                })
            }

            res.status(200).json({
                status: 'success',
                result: registeredContacts.length,
                data: registeredContacts
            })
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            })
        }
    });

}

exports.deleteContact = async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const userId = req.user.id;
            const { chatRoomId } = req.params;
            const messages = await Message.findAll({
                where: {
                    chatRoomId
                }
            });
            if(messages || messages.length !== 0){
                messages.forEach(async message => {
                    await DeletedMessage.create({
                        userId,
                        messageId: message.id
                    })
                })
            }
            const chatData = { isDeleted: true };
            const chatInstance = await ChatInstance.update(chatData, {
                where: {
                    chatRoomId,
                    userId
                },
                returning: true
            });

            const updatedChatInstance = chatInstance[1][0];

            res.status(200).json({
                status: 'success',
                data: updatedChatInstance
            });
            
        } catch (error) {
            console.log(error);
            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });

}