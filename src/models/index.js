const { Sequelize } = require("sequelize");

// Use SQLite for Render deployment (can be switched to PostgreSQL later)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.NODE_ENV === 'production' ? '/tmp/database.sqlite' : './database.sqlite',
  logging: false
});

// Original PostgreSQL configuration (commented out due to network timeout)
// const databaseUrl = process.env.DATABASE_URL;
// const sequelize = databaseUrl 
//   ? new Sequelize(databaseUrl, {
//       logging: false,
//       dialect: 'postgres',
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     })
//   : new Sequelize(
//       process.env.DB_NAME,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: "postgres",
//         port: 5432,
//         logging: false,
//         dialectOptions: {
//           ssl: {
//             require: true,
//             rejectUnauthorized: false
//           }
//         }
//       }
//     );

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require("./User")(sequelize, Sequelize);
db.Location = require("./Location")(sequelize, Sequelize);
db.Citizen = require("./Citizen")(sequelize, Sequelize);
db.Survey = require("./Survey")(sequelize, Sequelize);
db.Question = require("./Question")(sequelize, Sequelize);
db.QuestionLogic = require("./QuestionLogic")(sequelize, Sequelize);
db.Response = require("./Response")(sequelize, Sequelize);
db.Answer = require("./Answer")(sequelize, Sequelize);
db.Alert = require("./Alert")(sequelize, Sequelize);

/* Relationships */

// Users
db.User.hasMany(db.Survey, { foreignKey: "created_by" });

// Surveys
db.Survey.belongsTo(db.User, { foreignKey: "created_by" });
db.Survey.hasMany(db.Question, { foreignKey: "survey_id" });
db.Survey.hasMany(db.Response, { foreignKey: "survey_id" });

// Questions
db.Question.belongsTo(db.Survey, { foreignKey: "survey_id" });
db.Question.hasMany(db.QuestionLogic, { foreignKey: "question_id" });

// Question Logic
db.QuestionLogic.belongsTo(db.Question, { foreignKey: "question_id" });
db.QuestionLogic.belongsTo(db.Question, {
  foreignKey: "next_question_id",
  as: "nextQuestion",
});

// Locations
db.Location.hasMany(db.Citizen, { foreignKey: "location_id" });

// Citizens
db.Citizen.belongsTo(db.Location, { foreignKey: "location_id" });
db.Citizen.hasMany(db.Response, { foreignKey: "citizen_id" });

// Responses
db.Response.belongsTo(db.Survey, { foreignKey: "survey_id" });
db.Response.belongsTo(db.Citizen, { foreignKey: "citizen_id" });
db.Response.hasMany(db.Answer, { foreignKey: "response_id" });

// Answers
db.Answer.belongsTo(db.Response, { foreignKey: "response_id" });
db.Answer.belongsTo(db.Question, { foreignKey: "question_id" });

// Alerts
db.Location.hasMany(db.Alert, { foreignKey: "region_id" });
db.Alert.belongsTo(db.Location, { foreignKey: "region_id" });

module.exports = db;
