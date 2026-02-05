module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Survey", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    created_by: DataTypes.UUID,
    status: {
      type: DataTypes.ENUM("DRAFT", "PUBLISHED", "ARCHIVED"),
      defaultValue: "DRAFT",
    },
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "surveys",
    timestamps: false,
  });
};
