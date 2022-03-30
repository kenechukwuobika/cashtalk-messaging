module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("userProfiles", {
          id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },
          userId: {
              type: Sequelize.UUID,
              allowNull: false
          },
          email: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
              validate: {
                  isEmail: {
                      msg: "Must be an email format"
                  }
              }
          },
          userName: {
              type: Sequelize.STRING,
              unique: true,
              allowNull: false
          },
          firstName: Sequelize.STRING,
          lastName: Sequelize.STRING,
          imageKey: {
              type: Sequelize.STRING,
              defaultValue: 'default-user.jpg'
          },
          status: {
              type: Sequelize.STRING,
              values: ['online', 'offline']
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
      await queryInterface.dropTable("userProfiles");
    }
  };
  