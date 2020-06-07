'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    user_id: DataTypes.NUMBER,
    update_id: DataTypes.NUMBER,
  }, {});
  Like.associate = function(models) {
    models.Like.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    models.Like.belongsTo(models.Update, { foreignKey: 'update_id', as: 'update' });
  };
  return Like;
};