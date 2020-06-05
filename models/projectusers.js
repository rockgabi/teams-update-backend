'use strict';
module.exports = (sequelize, DataTypes) => {
  const ProjectUsers = sequelize.define('ProjectUsers', {
    project_id: DataTypes.NUMBER,
    user_id: DataTypes.NUMBER,
  }, {});
  ProjectUsers.associate = function(models) {
    // associations can be defined here
  };
  return ProjectUsers;
};