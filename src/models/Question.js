module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Question", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    survey_id: DataTypes.UUID,
    text: DataTypes.TEXT,
    type: DataTypes.STRING,
    order_index: DataTypes.INTEGER,
    is_required: DataTypes.BOOLEAN,
  }, {
    tableName: "questions",
    timestamps: false,
  });
};
