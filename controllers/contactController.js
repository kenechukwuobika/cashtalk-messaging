const { catchAsync, AppError } = require("cashtalk-common");
const { User, Contact } = require('../models');
const sequelize = require('../config/database/connection');

exports.getContacts = catchAsync(
/**
* Get all contacts for the current authenticated user
* 
* @function
* @param {Object} req - Express request object
* @param {Object} res - Express response object
* @param {Function} next - Express next middleware function
* 
*/
    async (req, res, next) => {
        await sequelize.transaction(async t => {
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
                contacts
            })
        });
    }
)

exports.syncContact = catchAsync(async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const { user } = req;
            const { contactData } = req.body;
            
            if(!contactData){
                return next(new AppError(400, "Could not sync contacts"));
            }

            const contacts = await Promise.all(await contactData.map(async data => {
                const registeredUser = await User.findOne({
                    where: {
                        phoneNumber: data.phoneNumber
                    }
                })
                
                if(registeredUser){
                    return await Contact.create({
                        userId: user.id,
                        contactId: registeredUser.id,
                        contactPhoneNumber: registeredUser.phoneNumber,
                        contactName: data.name
                    });
                }
            }))

            res.status(200).json({
                status: 'success',
                result: contacts.length,
                contacts
            })
            
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: 'fail',
                data: error.message
            })
        }
    });

})

exports.deleteContact = catchAsync(async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            const userId = req.user.id;
            const { contactId } = req.params;
            const contact = await Contact.destroy({
                where: {
                    id: contactId
                }
            });

            res.status(200).json({
                status: 'success',
                contact
            });
            
        } catch (error) {
            console.log(error);
            res.status(400).json({
                status: 'fail',
                data: error.message
            });
        }
    });

})