const User = require("../../models").user;
const sequelize = require("../../config/database/connection");

exports.createUserHandler = async (data) => {
  try {
    await sequelize.transaction(async t => {
        try {
          await User.create(
            data,
            { transaction: t }
          );
        } catch (error) {
          console.log(error);
        }
    });
  } catch (error) {
      console.log(error)
  }
};

exports.deleteUser = async (data) => {
  await sequelize.transaction(async t => {
    try {

      await User.create(
        data,
        { transaction: t }
      );
    } catch (error) {
      throw new Error(error);
    }
  });
};