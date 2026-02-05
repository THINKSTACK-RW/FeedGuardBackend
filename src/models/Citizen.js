module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Citizen", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone_hash: {
      type: DataTypes.TEXT,
      unique: true,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: "citizens",
    timestamps: false,
  });
};
