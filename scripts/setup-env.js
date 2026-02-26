#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FeedGuard Environment Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '../.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  
  // Read current .env to check NODE_ENV
  const envContent = fs.readFileSync(envPath, 'utf8');
  const nodeEnv = envContent.match(/NODE_ENV=(.+)/);
  
  if (nodeEnv) {
    console.log(`📊 Current NODE_ENV: ${nodeEnv[1]}`);
    
    if (nodeEnv[1] === 'development') {
      console.log('🚀 Development Mode: Using default SMS sender (no sender ID)');
      console.log('💡 Ready for immediate testing with Africa\'s Talking sandbox');
    } else if (nodeEnv[1] === 'production') {
      console.log('🏭 Production Mode: Using custom FEEDGUARD sender ID');
      console.log('⚠️  Make sure FEEDGUARD sender ID is approved by Africa\'s Talking');
    }
  }
} else {
  console.log('❌ .env file not found');
  console.log('\n📝 Choose your environment setup:');
  console.log('1. Development (default SMS sender - no approval needed)');
  console.log('2. Production (custom FEEDGUARD sender ID)');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect option (1 or 2): ', (choice) => {
    let sourceFile;
    
    if (choice === '1') {
      sourceFile = '.env.development';
      console.log('🚀 Setting up Development environment...');
    } else if (choice === '2') {
      sourceFile = '.env.production';
      console.log('🏭 Setting up Production environment...');
    } else {
      console.log('❌ Invalid choice. Using development by default.');
      sourceFile = '.env.development';
    }
    
    const sourcePath = path.join(__dirname, '../', sourceFile);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, envPath);
      console.log(`✅ Created .env from ${sourceFile}`);
      console.log('\n📝 Next steps:');
      console.log('1. Update Africa\'s Talking API credentials in .env');
      console.log('2. Run: npm install');
      console.log('3. Run: npm start');
      
      if (choice === '2') {
        console.log('4. Submit FEEDGUARD sender ID for approval at Africa\'s Talking');
      }
    } else {
      console.log(`❌ Source file ${sourceFile} not found`);
    }
    
    rl.close();
  });
}
