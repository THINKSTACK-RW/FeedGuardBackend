// Alert.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Alert", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    region_id: DataTypes.UUID,
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("critical", "warning", "info"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("new", "investigating", "resolved"),
      defaultValue: "new",
    },
    affected_households: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: "alerts",
    timestamps: false,
  });
};
