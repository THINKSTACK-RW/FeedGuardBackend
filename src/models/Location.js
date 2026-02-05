module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Location", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    country: DataTypes.STRING,
    province: DataTypes.STRING,
    district: DataTypes.STRING,
    sector: DataTypes.STRING,
    village: DataTypes.STRING,
  }, {
    tableName: "locations",
    timestamps: false,
  });
};
