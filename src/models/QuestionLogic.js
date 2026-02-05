module.exports = (sequelize, DataTypes) => {
  return sequelize.define("QuestionLogic", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    question_id: DataTypes.UUID,
    condition_value: DataTypes.STRING,
    next_question_id: DataTypes.UUID,
  }, {
    tableName: "question_logic",
    timestamps: false,
  });
};
