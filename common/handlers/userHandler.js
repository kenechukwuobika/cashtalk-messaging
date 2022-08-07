const {
    User,
    Profile,
    Permission,
    Preference
} = require("../../models");
const sequelize = require("../../config/database/connection");

exports.createUserHandler = async (data) => {
  try {
    await sequelize.transaction(async t => {
        try {
          await User.create(
            data,
            { 
                transaction: t,
                include: [Profile, Permission, Preference]
            }
          );
        } catch (error) {
          console.log(error);
        }
    });
  } catch (error) {
      console.log(error)
  }
};

exports.profileHandler = async (data) => {
    try {
        await sequelize.transaction(async t => {
            try {
                const [ updated, updatedProfile] = await Profile.update(
                    data,
                    {
                        where: {
                            userId: data.id
                        },
                        returning: true
                    },
                    {
                        transaction: t,
                    }
                );
            } catch (error) {
              console.log(error);
            }
        });
      } catch (error) {
          console.log(error)
      }
}

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