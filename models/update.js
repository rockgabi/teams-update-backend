'use strict';
module.exports = (sequelize, DataTypes) => {
  const Update = sequelize.define('Update', {
    user_id: DataTypes.NUMBER,
    project_id: DataTypes.NUMBER,
    title: DataTypes.STRING,
    content: DataTypes.STRING,
  }, {});
  Update.associate = function(models) {
    models.Update.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    models.Update.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });

    models.Project.hasMany(models.Like, { foreignKey: 'update_id' });
  };
  return Update;
};