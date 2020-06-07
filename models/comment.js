'use strict';
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    user_id: DataTypes.NUMBER,
    update_id: DataTypes.NUMBER,
  }, {});
  Comment.associate = function(models) {
    models.Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    models.Comment.belongsTo(models.Update, { foreignKey: 'update_id', as: 'update' });
  };
  return Comment;
};