const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Citizen, Location } = require('../models');
const geocodingService = require('../services/geocodingService');

// Enhanced geocoding function for Rwandan locations using OpenStreetMap Nominatim API
async function geocodeLocation(district, sector, village, cell) {
  try {
    // First try the comprehensive local database for known locations
    const localCoords = getLocalCoordinates(district, sector, village, cell);
    if (localCoords) {
      return localCoords;
    }

    // If not found locally, use OpenStreetMap Nominatim API
    return await geocodeWithAPI(district, sector, village, cell);
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
  }
}

// Local coordinates database for major Rwandan locations
function getLocalCoordinates(district, sector, village, cell) {
  const locationCoordinates = {
    // Kigali District
    'Gasabo': {
      'Jabana': { lat: -1.9311, lng: 30.1304 },
      'Kinyinya': { lat: -1.9042, lng: 30.1267 },
      'Remera': { lat: -1.9367, lng: 30.1242 },
      'Gikondo': { lat: -1.9478, lng: 30.1156 },
      'Kacyiru': { lat: -1.9256, lng: 30.0989 },
      'Bumbogo': { lat: -1.8956, lng: 30.1456 },
      'Gisozi': { lat: -1.9234, lng: 30.0890 },
      'Jali': { lat: -1.9123, lng: 30.1345 },
      'Kagugu': { lat: -1.9345, lng: 30.1123 },
      'Kinyami': { lat: -1.9456, lng: 30.0987 }
    },
    'Nyarugenge': {
      'Nyamirambo': { lat: -1.9441, lng: 30.0619 },
      'Kimisagara': { lat: -1.9506, lng: 30.0589 },
      'Rwezamenyo': { lat: -1.9567, lng: 30.0645 },
      'Muhima': { lat: -1.9489, lng: 30.0567 },
      'Nyabugogo': { lat: -1.9523, lng: 30.0589 },
      'Kigali': { lat: -1.9536, lng: 30.0606 },
      'Rugenge': { lat: -1.9467, lng: 30.0634 }
    },
    'Kicukiro': {
      'Kicukiro': { lat: -1.9833, lng: 30.1167 },
      'Nyarugunga': { lat: -1.9789, lng: 30.1089 },
      'Gahanga': { lat: -1.9934, lng: 30.1345 },
      'Kagarama': { lat: -1.9878, lng: 30.1234 },
      'Kigarama': { lat: -1.9856, lng: 30.1212 },
      'Masaka': { lat: -2.0123, lng: 30.1456 },
      'Niboye': { lat: -1.9767, lng: 30.1098 }
    },
    // Northern Province
    'Burera': {
      'Butaro': { lat: -1.4056, lng: 29.8234 },
      'Cyanika': { lat: -1.4567, lng: 29.8456 },
      'Ruhunde': { lat: -1.4234, lng: 29.8345 },
      'Rugengabire': { lat: -1.4123, lng: 29.8567 },
      'Cyeru': { lat: -1.4345, lng: 29.8234 }
    },
    'Gicumbi': {
      'Gicumbi': { lat: -1.5789, lng: 30.0345 },
      'Byumba': { lat: -1.5867, lng: 30.0789 },
      'Mukarange': { lat: -1.5678, lng: 30.0456 },
      'Miyove': { lat: -1.5456, lng: 30.0234 },
      'Rukomo': { lat: -1.5890, lng: 30.0567 }
    },
    'Musanze': {
      'Musanze': { lat: -1.5000, lng: 29.6333 },
      'Kinigi': { lat: -1.4867, lng: 29.5789 },
      'Muko': { lat: -1.5234, lng: 29.6456 },
      'Nyakinama': { lat: -1.5123, lng: 29.6123 },
      'Gashaki': { lat: -1.4789, lng: 29.5890 }
    },
    'Rulindo': {
      'Rulindo': { lat: -1.7234, lng: 30.0456 },
      'Base': { lat: -1.7456, lng: 30.0678 },
      'Bushoki': { lat: -1.7123, lng: 30.0345 },
      'Cyungo': { lat: -1.7345, lng: 30.0567 },
      'Kinihira': { lat: -1.7567, lng: 30.0789 }
    },
    // Southern Province
    'Huye': {
      'Huye': { lat: -2.6000, lng: 29.7500 },
      'Ngoma': { lat: -2.6234, lng: 29.7456 },
      'Mukura': { lat: -2.5890, lng: 29.7345 },
      'Ruhango': { lat: -2.6123, lng: 29.7567 },
      'Tumba': { lat: -2.5789, lng: 29.7234 }
    },
    'Nyanza': {
      'Nyanza': { lat: -2.3500, lng: 29.7000 },
      'Busasamana': { lat: -2.3456, lng: 29.7123 },
      'Cyabakamyi': { lat: -2.3678, lng: 29.6890 },
      'Kibirizi': { lat: -2.3345, lng: 29.6789 },
      'Mukingo': { lat: -2.3567, lng: 29.7234 }
    },
    'Gisagara': {
      'Gisagara': { lat: -2.7234, lng: 29.8234 },
      'Mamba': { lat: -2.7456, lng: 29.8456 },
      'Save': { lat: -2.7123, lng: 29.8012 },
      'Ndora': { lat: -2.7345, lng: 29.8234 }
    },
    'Nyaruguru': {
      'Nyaruguru': { lat: -2.8234, lng: 29.6345 },
      'Kibeho': { lat: -2.8456, lng: 29.6567 },
      'Muganza': { lat: -2.8123, lng: 29.6123 },
      'Cyahinda': { lat: -2.8345, lng: 29.6345 }
    },
    'Muhanga': {
      'Muhanga': { lat: -2.1234, lng: 29.7456 },
      'Cyeza': { lat: -2.1456, lng: 29.7678 },
      'Kabacuzi': { lat: -2.1123, lng: 29.7234 },
      'Shyogwe': { lat: -2.1345, lng: 29.7456 }
    },
    'Kamonyi': {
      'Kamonyi': { lat: -2.0234, lng: 29.8567 },
      'Gacurabwenge': { lat: -2.0456, lng: 29.8789 },
      'Kigina': { lat: -2.0123, lng: 29.8345 },
      'Nyamiyaga': { lat: -2.0345, lng: 29.8567 }
    },
    'Ruhango': {
      'Ruhango': { lat: -2.1567, lng: 29.7890 },
      'Bimoba': { lat: -2.1789, lng: 29.8112 },
      'Byimana': { lat: -2.1456, lng: 29.7678 },
      'Mwendo': { lat: -2.1678, lng: 29.7890 }
    },
    // Eastern Province
    'Nyagatare': {
      'Nyagatare': { lat: -1.3000, lng: 30.3000 },
      'Katabagemu': { lat: -1.3234, lng: 30.3234 },
      'Karama': { lat: -1.2890, lng: 30.2789 },
      'Matimba': { lat: -1.3123, lng: 30.3012 },
      'Rukomo': { lat: -1.3345, lng: 30.3234 }
    },
    'Gatsibo': {
      'Gatsibo': { lat: -1.6234, lng: 30.4345 },
      'Kageyo': { lat: -1.6456, lng: 30.4567 },
      'Kiziguro': { lat: -1.6123, lng: 30.4123 },
      'Murambi': { lat: -1.6345, lng: 30.4345 }
    },
    'Kayonza': {
      'Kayonza': { lat: -1.8234, lng: 30.3456 },
      'Kabare': { lat: -1.8456, lng: 30.3678 },
      'Mukarange': { lat: -1.8123, lng: 30.3234 },
      'Rwinkwavu': { lat: -1.8345, lng: 30.3456 }
    },
    'Kirehe': {
      'Kirehe': { lat: -2.1234, lng: 30.4567 },
      'Mahama': { lat: -2.1456, lng: 30.4789 },
      'Musaza': { lat: -2.1123, lng: 30.4345 },
      'Nasho': { lat: -2.1345, lng: 30.4567 }
    },
    'Ngoma': {
      'Ngoma': { lat: -2.0234, lng: 30.5234 },
      'Kibungo': { lat: -2.0456, lng: 30.5456 },
      'Mugesera': { lat: -2.0123, lng: 30.5012 },
      'Zaza': { lat: -2.0345, lng: 30.5234 }
    },
    'Rwamagana': {
      'Rwamagana': { lat: -1.9234, lng: 30.4123 },
      'Fumbwe': { lat: -1.9456, lng: 30.4345 },
      'Muhazi': { lat: -1.9123, lng: 30.3901 },
      'Nyakariro': { lat: -1.9345, lng: 30.4123 }
    },
    // Western Province
    'Rubavu': {
      'Rubavu': { lat: -1.6833, lng: 29.2500 },
      'Gisenyi': { lat: -1.7000, lng: 29.2589 },
      'Busasamana': { lat: -1.6667, lng: 29.2412 },
      'Cyanzarwe': { lat: -1.6889, lng: 29.2634 },
      'Kivumu': { lat: -1.7111, lng: 29.2856 }
    },
    'Karongi': {
      'Karongi': { lat: -2.0234, lng: 29.3890 },
      'Bwishyura': { lat: -2.0456, lng: 29.4112 },
      'Gitesi': { lat: -2.0123, lng: 29.3678 },
      'Murundi': { lat: -2.0345, lng: 29.3890 }
    },
    'Ngororero': {
      'Ngororero': { lat: -1.8234, lng: 29.5234 },
      'Bwira': { lat: -1.8456, lng: 29.5456 },
      'Kageyo': { lat: -1.8123, lng: 29.5012 },
      'Muhanda': { lat: -1.8345, lng: 29.5234 }
    },
    'Nyabihu': {
      'Nyabihu': { lat: -1.7234, lng: 29.4567 },
      'Bigogwe': { lat: -1.7456, lng: 29.4789 },
      'Jenda': { lat: -1.7123, lng: 29.4345 },
      'Rambura': { lat: -1.7345, lng: 29.4567 }
    },
    'Rusizi': {
      'Rusizi': { lat: -2.4234, lng: 29.0123 },
      'Bugarama': { lat: -2.4456, lng: 29.0345 },
      'Gihundwe': { lat: -2.4123, lng: 28.9901 },
      'Kamembe': { lat: -2.4345, lng: 29.0123 }
    }
  };

  // Try to find exact match for district-sector-village
  if (district && locationCoordinates[district]) {
    if (sector && locationCoordinates[district][sector]) {
      if (village && locationCoordinates[district][sector][village]) {
        return locationCoordinates[district][sector][village];
      }
      // Return sector coordinates if village not found
      return locationCoordinates[district][sector];
    }
    // Return district approximate center if sector not found
    const sectorCoords = Object.values(locationCoordinates[district])[0];
    if (sectorCoords) {
      return typeof sectorCoords === 'object' && sectorCoords.lat ? sectorCoords : sectorCoords[Object.keys(sectorCoords)[0]];
    }
  }

  return null; // Not found in local database
}

// Geocoding using OpenStreetMap Nominatim API
async function geocodeWithAPI(district, sector, village, cell) {
  const https = require('https');
  const query = [];
  
  if (cell) query.push(cell);
  if (village) query.push(village);
  if (sector) query.push(sector);
  if (district) query.push(district);
  query.push('Rwanda');
  
  const searchQuery = query.join(', ');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=rw`;
  
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            const result = results[0];
            resolve({
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            });
          } else {
            // Try with district only
            geocodeDistrictOnly(district).then(resolve).catch(reject);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Geocoding request timeout'));
    });
  });
}

// Fallback: Try geocoding with district only
async function geocodeDistrictOnly(district) {
  const https = require('https');
  const searchQuery = `${district}, Rwanda`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=rw`;
  
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            const result = results[0];
            resolve({
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon)
            });
          } else {
            // Final fallback to Kigali
            resolve({ lat: -1.9441, lng: 30.0619 });
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve({ lat: -1.9441, lng: 30.0619 }); // Fallback on timeout
    });
  });
}

const mobileAuthController = {
  // Register new citizen (mobile app)
  async register(req, res) {
    try {
      console.log('Registration request body:', req.body);
      const { name, email, password, phone, village, sector, district, household_size, cell } = req.body;
      console.log("Password: ",password);
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Check if citizen already exists by email or phone
      const existingCitizen = await Citizen.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { email: email || null },
            { phone: phone || null }
          ]
        }
      });
      
      if (existingCitizen) {
        return res.status(400).json({ 
          error: 'Citizen already exists',
          field: existingCitizen.email === email ? 'email' : 'phone'
        });
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        const saltRounds = 12;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      // Find or create location based on provided address
      let location;
      if (village || sector || district) {
        // Try to find existing location
        location = await Location.findOne({
          where: {
            village: village || null,
            sector: sector || null,
            district: district || null
          }
        });

        // Create new location if not found
        if (!location) {
          // Get coordinates from geocoding
          const coords = await geocodingService.geocodeLocation(district, sector, village, cell);
          console.log(`Geocoded location for ${district}, ${sector}, ${village}, ${cell}:`, coords);
          
          location = await Location.create({
            name: `${cell || ''}, ${village || ''}, ${sector || ''}, ${district || ''}`.replace(/^, |, $/g, '') || 'Unknown Location',
            village: village || null,
            sector: sector || null,
            district: district || null,
            country: 'Rwanda',
            province: geocodingService.getProvince(district),
            latitude: coords.lat,
            longitude: coords.lng
          });
          
          console.log(`Created location with coordinates: lat=${coords.lat}, lng=${coords.lng}`);
        }
      } else {
        // Create default location if no address provided
        location = await Location.create({
          name: 'Default Location',
          village: null,
          sector: null,
          district: null,
          country: 'Rwanda',
          province: 'Kigali',
          latitude: -1.9441,
          longitude: 30.0619
        });
      }
      console.log("Phone: ",phone);
      // Create citizen
      const citizen = await Citizen.create({
        name,
        email: email || null,
        password_hash: hashedPassword,
        phone: phone || null,
        village: village || null,
        sector: sector || null,
        district: district || null,
        household_size: household_size || null,
        location_id: location.id // Always required
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          citizenId: citizen.id, 
          email: citizen.email, 
          phone: citizen.phone,
          type: 'citizen'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
      );

      // Remove password from response
      const { password_hash, ...citizenWithoutPassword } = citizen.dataValues;

      res.status(201).json({
        message: 'Citizen registered successfully',
        citizen: citizenWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Citizen registration error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  },

  // Reset password (debug endpoint)
  async resetPassword(req, res) {
    try {
      const { phone, newPassword } = req.body;
      
      if (!phone || !newPassword) {
        return res.status(400).json({ error: 'Phone and new password are required' });
      }
      
      const citizen = await Citizen.findOne({ where: { phone } });
      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }
      
      // Hash the new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the citizen
      await citizen.update({ password_hash: hashedPassword });
      
      // Test the new password
      const isValid = await bcrypt.compare(newPassword, citizen.password_hash);
      
      res.json({
        message: 'Password reset successfully',
        phone: citizen.phone,
        passwordReset: true,
        passwordTest: isValid ? 'PASS' : 'FAIL'
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Password reset failed', details: error.message });
    }
  },

  // Login citizen (mobile app)
  async login(req, res) {
    try {
      console.log('Login request body:', req.body);
      const { phone, password } = req.body;

      // Debug password handling
      console.log('Extracted phone:', phone);
      console.log('Extracted password:', password);
      console.log('Password type:', typeof password);
      console.log('Password length:', password ? password.length : 'N/A');

      // Find citizen by phone
      const citizen = await Citizen.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { phone: phone || null }
          ]
        }
      });

      console.log('Found citizen:', citizen ? { 
        id: citizen.id, 
        phone: citizen.phone, 
        hasPassword: !!citizen.password_hash,
        passwordHashLength: citizen.password_hash?.length 
      } : null);

      if (!citizen) {
        console.log('❌ Citizen not found');
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password if citizen has one
      if (citizen.password_hash) {
        console.log('🔐 Citizen has password hash, checking password...');
        
        if (!password) {
          console.log('❌ No password provided but citizen has password');
          return res.status(401).json({ error: 'Password required for this account' });
        }
        
        console.log('Citizen hashed password: ',citizen.password_hash);
        const isPasswordValid = await bcrypt.compare(password, citizen.password_hash);
        console.log(`Password comparison result: ${isPasswordValid ? 'VALID' : 'INVALID'}`);
        
        if (!isPasswordValid) {
          console.log('❌ Password comparison failed');
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        console.log('✅ Password validated successfully');
      } else {
        // For citizens without password (phone-based), allow login with or without password
        console.log('📱 Citizen has no password hash (phone-based login)');
        if (password) {
          console.log(`Password provided but citizen has no password hash. Ignoring password for phone-based login: ${citizen.phone}`);
        } else {
          console.log(`Phone-based login for citizen: ${citizen.phone}`);
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          citizenId: citizen.id, 
          email: citizen.email, 
          phone: citizen.phone,
          type: 'citizen'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
      );

      // Remove password from response
      const { password_hash, ...citizenWithoutPassword } = citizen.dataValues;

      res.json({
        message: 'Login successful',
        citizen: citizenWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Citizen login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  },

  // Get current citizen profile
  async getProfile(req, res) {
    try {
      const citizenId = req.user.citizenId;
      
      const citizen = await Citizen.findByPk(citizenId, {
        attributes: { exclude: ['password_hash'] },
        include: [{ model: Location, required: false }]
      });

      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      res.json({ citizen });
    } catch (error) {
      console.error('Get citizen profile error:', error);
      res.status(500).json({ error: 'Failed to get profile', details: error.message });
    }
  },

  // Update citizen profile
  async updateProfile(req, res) {
    try {
      const citizenId = req.user.citizenId;
      const { name, email, phone, village, sector, district, household_size, cell } = req.body;

      const citizen = await Citizen.findByPk(citizenId);
      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      // Check if email or phone is being changed and if it's already taken
      if (email && email !== citizen.email) {
        const existingCitizen = await Citizen.findOne({ where: { email } });
        if (existingCitizen) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }

      if (phone && phone !== citizen.phone) {
        const existingCitizen = await Citizen.findOne({ where: { phone } });
        if (existingCitizen) {
          return res.status(400).json({ error: 'Phone number already in use' });
        }
      }

      // Handle location update
      let location;
      if (village || sector || district) {
        location = await Location.findOne({
          where: {
            village: village || null,
            sector: sector || null,
            district: district || null
          }
        });

        if (!location) {
          // Get coordinates from enhanced geocoding service
          const coords = await geocodingService.geocodeLocation(district, sector, village, cell);
          console.log(`Geocoded location for ${district}, ${sector}, ${village}, ${cell}:`, coords);
          
          location = await Location.create({
            name: `${cell || ''}, ${village || ''}, ${sector || ''}, ${district || ''}`.replace(/^, |, $/g, '') || 'Unknown Location',
            village: village || null,
            sector: sector || null,
            district: district || null,
            country: 'Rwanda',
            province: geocodingService.getProvince(district),
            latitude: coords.lat,
            longitude: coords.lng
          });
        }
      } else {
        // Keep existing location if no new address provided
        location = await Location.findByPk(citizen.location_id);
        if (!location) {
          // Fallback: create default location if existing location not found
          location = await Location.create({
            name: 'Default Location',
            village: null,
            sector: null,
            district: null,
            country: 'Rwanda',
            province: 'Kigali',
            latitude: -1.9441,
            longitude: 30.0619
          });
        }
      }

      // Update citizen
      await citizen.update({
        name: name || citizen.name,
        email: email || citizen.email,
        phone: phone || citizen.phone,
        village: village || citizen.village,
        sector: sector || citizen.sector,
        district: district || citizen.district,
        household_size: household_size || citizen.household_size,
        location_id: location.id // Always required
      });

      // Remove password from response
      const { password_hash, ...citizenWithoutPassword } = citizen.dataValues;

      res.json({
        message: 'Profile updated successfully',
        citizen: citizenWithoutPassword
      });
    } catch (error) {
      console.error('Update citizen profile error:', error);
      res.status(500).json({ error: 'Failed to update profile', details: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const citizenId = req.user.citizenId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      const citizen = await Citizen.findByPk(citizenId);
      if (!citizen) {
        return res.status(404).json({ error: 'Citizen not found' });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, citizen.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await citizen.update({ password_hash: hashedNewPassword });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password', details: error.message });
    }
  }
};

module.exports = mobileAuthController;
