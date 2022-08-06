const { Op } = require("sequelize");
const sequelize = require('../../config/database/connection');
const {
    Message,
    User,
    ChatRoom,
    Preference
} = require('../../models').message;

const errorHandler = require("./errorHandler");
const {
    MESSAGE_READ,
    MESSAGE_SEND,
    STATUS_ONLINE,
    STATUS_OFFLINE
} = require('../../constants/socketEvents');


exports.online = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const data = {userId: currentUser.id, status: 'online'};
            io.of('/api/v1').emit(STATUS_ONLINE, data);
        } catch (error) {
            console.log(error)
        }
    });
}

exports.offline = socket => async (data) => {
    await sequelize.transaction(async t => {
        try {
            const currentUser = socket.request.user;
            const [user, userUpdated] = await Pro.update({

            })
            const data = {userId: currentUser.id, status: 'offline'};
            io.of('/api/v1').emit(STATUS_OFFLINE, data);
        } catch (error) {
            console.log(error)
        }
    });
}