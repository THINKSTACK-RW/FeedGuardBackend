const os = require('os');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let wifiIp = null;

  for (const interfaceName in interfaces) {
    // Prefer Wi-Fi or Ethernet interfaces, avoid virtual ones
    const isVirtual = /virtual|vbox|vEthernet|adapter/i.test(interfaceName);
    
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!isVirtual) return iface.address; // Return first physical adapter found
        wifiIp = iface.address; // Fallback to virtual if nothing else
      }
    }
  }

  return wifiIp || 'localhost';
}
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Routes
app.use('/api', require('./routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
async function startServer() {
  const ip = getLocalIpAddress();
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // For development reset, use force: true temporarily
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n' + '='.repeat(40));
      console.log(`🚀 FEEDGUARD BACKEND RUNNING`);
      console.log(`- Local:   http://localhost:${PORT}`);
      console.log(`- Network: http://${ip}:${PORT}`);
      console.log('='.repeat(40) + '\n');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
