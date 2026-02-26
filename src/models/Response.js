// Response.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Response", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    survey_id: DataTypes.UUID,
    citizen_id: DataTypes.UUID,
    channel: {
      type: DataTypes.ENUM("USSD", "APP", "WEB", "SMS"),
    },
    submitted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Food security specific fields
    food_security_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Overall food security score (0-100)",
    },
    risk_level: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      allowNull: true,
    },
    meals_per_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Number of meals consumed per day",
    },
    days_of_food_left: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Estimated days of food remaining",
    },
    food_change_type: {
      type: DataTypes.ENUM("none", "quantity", "quality", "both"),
      allowNull: true,
      comment: "Type of food reduction experienced",
    },
    shocks_experienced: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of shocks experienced (income, drought, flood, illness, other)",
    },
  }, {
    tableName: "responses",
    timestamps: false,
  });
};
