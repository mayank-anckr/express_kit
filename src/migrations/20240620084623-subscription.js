"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("subscriptions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      price_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "auths",
          key: "unique_id_key",
        },
        onDelete: "CASCADE",
      },
      status: {
        allowNull: true,
        defaultValue: null,
        type: Sequelize.ENUM(
          "active",
          "inactive",
          "canceled",
          "trailing",
          "past_due",
          "unpaid",
          "incomplete",
          "incomplete_expired",
          "paused",
          "exhausted"
        ),
      },
      cancel_at_period_end: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      currency: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      interval: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      interval_count: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      period_starts_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      period_ends_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      trial_starts_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      trial_ends_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("subscriptions");
  },
};
