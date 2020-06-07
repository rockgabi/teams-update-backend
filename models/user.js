'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    models.User.belongsToMany(models.Project, { through: 'ProjectUsers', foreignKey: 'user_id', otherKey: 'project_id', as: 'projects' });
    models.User.hasMany(models.Like, { foreignKey: 'user_id', as: 'likes' });
    models.User.hasMany(models.Comment, { foreignKey: 'user_id', as: 'comments' });
  };
  return User;
};