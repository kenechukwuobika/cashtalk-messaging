const { catchAsync, AppError } = require("cashtalk-common");
const User = require('../models').user;
const Contact = require('../models').contact;
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
                data: contacts
            })
        });
    }
)

exports.syncContact = catchAsync(async (req, res, next) => {
    await sequelize.transaction(async t => {
        try {
            let registeredContacts = [];
            const { user } = req;
            const { contactData } = req.body;
            
            if(contactData){
                await contactData.forEach(async data => {
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
                            contactName: data.name
                        });
                        console.log(contact)
                        registeredContacts.push(data);
                    }
                })
            }

            console.log('registeredContacts')
            console.log(registeredContacts)

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
                data: contact
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