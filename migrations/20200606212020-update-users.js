'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('Projects', 'cycle_type', { type: Sequelize.STRING, allowNull: true, defaultValue: null }),
      queryInterface.addColumn('Projects', 'color', { type: Sequelize.STRING, allowNull: true, defaultValue: null }),
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Projects', 'cycle_type'),
      queryInterface.removeColumn('Projects', 'color'),
    ]);
  }
};