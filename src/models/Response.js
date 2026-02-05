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
  }, {
    tableName: "responses",
    timestamps: false,
  });
};
