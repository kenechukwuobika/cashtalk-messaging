const types = require("../common/events/types");
const userHandler = require("../common/handlers/userHandler");

module.exports = async (message) => {
    try {
        const type = message ? message.type : null;
        console.log((message.payload))
        if(type){
            switch (type) {
                case `${types.USER_CREATED}`:
                    userHandler.createUserHandler(message.payload)
                    break;
                case `${types.SET_DP}`:
                    userHandler.createUserHandler(message.payload)
                    break;
                default:
                    break;
            }
        }
    } catch (error) {
        console.log(error)
    }
}