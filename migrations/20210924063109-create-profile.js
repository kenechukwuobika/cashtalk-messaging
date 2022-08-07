module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("profiles", {
          id: {
              primaryKey: true,
              type: Sequelize.UUID,
              defaultValue: Sequelize.literal("uuid_generate_v4()"),
              allowNull: false
          },
          userId: {
              type: Sequelize.UUID,
              allowNull: false
          },
          email: {
              type: Sequelize.STRING,
              unique: true,
              validate: {
                  isEmail: {
                      msg: "Must be an email format"
                  }
              }
          },
          userName: {
              type: Sequelize.STRING,
              unique: true
          },
          firstName: Sequelize.STRING,
          lastName: Sequelize.STRING,
          displayPicture: {
              type: Sequelize.STRING,
              defaultValue: 'user-default.jpg'
          },
          status: {
              type: Sequelize.STRING,
              values: ['online', 'offline']
          },
          isConnected: {
              allowNull: false,
              type: Sequelize.BOOLEAN,
              defaultValue: true
          },
          lastSeen: {
              allowNull: false,
              type: Sequelize.DATE,
              defaultValue: Date.now()
          },
          createdAt: Sequelize.DATE,
          updatedAt: Sequelize.DATE,
      });
    },
    down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("profiles");
    }
  };
  