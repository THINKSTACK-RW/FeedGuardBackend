require('dotenv').config();
const { sequelize } = require('../src/models');

async function addMissingColumns() {
  try {
    console.log('Adding missing columns...');
    
    // Add risk_level column to responses table
    await sequelize.query(`
      ALTER TABLE responses 
      ADD COLUMN IF NOT EXISTS risk_level VARCHAR(10) 
      CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
    `);
    console.log('Added risk_level column to responses table');
    
    // Add name column to locations table
    await sequelize.query(`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT 'Unknown Location'
    `);
    console.log('Added name column to locations table');
    
    // Add latitude and longitude columns to locations table
    await sequelize.query(`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)
    `);
    console.log('Added latitude column to locations table');
    
    await sequelize.query(`
      ALTER TABLE locations 
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)
    `);
    console.log('Added longitude column to locations table');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

addMissingColumns();
