// Answer.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Answer", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    response_id: DataTypes.UUID,
    question_id: DataTypes.UUID,
    value: DataTypes.TEXT,
  }, {
    tableName: "answers",
    timestamps: false,
  });
};
