'use strict';
module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    name: DataTypes.STRING,
    owner_id: DataTypes.INTEGER,
    public: DataTypes.BOOLEAN,
    cycle_type: DataTypes.STRING,
    color: DataTypes.STRING,
  }, {});
  Project.associate = function(models) {
    models.Project.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
    models.Project.belongsToMany(models.User, { through: 'ProjectUsers', foreignKey: 'project_id', otherKey: 'user_id', as: 'users' });
  };
  return Project;
};