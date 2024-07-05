'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION create_user_on_auth_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO "user"(id, username, "createdAt", "updatedAt")
        VALUES (NEW.unique_id_key, NEW.username, NOW(), NOW());
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger
    await queryInterface.sequelize.query(`
      CREATE TRIGGER trigger_create_user
      AFTER INSERT ON "auths"
      FOR EACH ROW
      EXECUTE FUNCTION create_user_on_auth_insert();
    `);

    // Add foreign key constraint with ON DELETE CASCADE
    await queryInterface.addConstraint('user', {
      fields: ['id'],
      type: 'foreign key',
      name: 'fk_user_auth',
      references: {
        table: 'auths',
        field: 'unique_id_key'
      },
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('user', 'fk_user_auth');

    // Drop trigger
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_create_user ON "auths";
    `);

    // Drop function
    await queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS create_user_on_auth_insert();
    `);
  }
};
