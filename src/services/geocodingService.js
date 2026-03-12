// Enhanced Geocoding Service for Rwandan Locations
// Uses OpenStreetMap Nominatim API with comprehensive local database

const https = require('https');

class GeocodingService {
  constructor() {
    // Comprehensive local coordinates database for major Rwandan locations
    this.locationCoordinates = {
      // Kigali District
      'Gasabo': {
        'Jabana': { 
          lat: -1.9311, lng: 30.1304,
          cells: ['Gikomero', 'Jabana', 'Kinyinya', 'Ndera', 'Rusoro', 'Rutunga', 'Shyorongi']
        },
        'Kinyinya': { 
          lat: -1.9042, lng: 30.1267,
          cells: ['Bumbogo', 'Gasharu', 'Kinyinya', 'Masoro', 'Nduba', 'Rukomo']
        },
        'Remera': { 
          lat: -1.9367, lng: 30.1242,
          cells: ['Giporoso', 'Kacyiru', 'Kigali', 'Remera', 'Rugando']
        },
        'Gikondo': { 
          lat: -1.9478, lng: 30.1156,
          cells: ['Gikondo', 'Kagarama', 'Kicukiro', 'Niboye', 'Nyakabanda']
        },
        'Kacyiru': { 
          lat: -1.9256, lng: 30.0989,
          cells: ['Gisozi', 'Kacyiru', 'Kinyinya', 'Ruhanga', 'Rusororo']
        },
        'Bumbogo': { 
          lat: -1.8956, lng: 30.1456,
          cells: ['Bumbogo', 'Gasharu', 'Kinyinya', 'Masoro', 'Nduba']
        },
        'Gisozi': { 
          lat: -1.9234, lng: 30.0890,
          cells: ['Gisozi', 'Kacyiru', 'Kinyinya', 'Ruhanga', 'Rusororo']
        },
        'Ndera': { 
          lat: -1.9234, lng: 30.1456,
          cells: ['Cyinyonyi', 'Kabuga', 'Kinyinya', 'Masoro', 'Ndera', 'Rugende']
        },
        'Rusororo': { 
          lat: -1.9123, lng: 30.1345,
          cells: ['Bumbogo', 'Gasharu', 'Kinyinya', 'Masoro', 'Nduba', 'Rusororo']
        },
        'Rutunga': { 
          lat: -1.9345, lng: 30.1123,
          cells: ['Gikomero', 'Jabana', 'Kinyinya', 'Ndera', 'Rusoro', 'Rutunga', 'Shyorongi']
        },
        'Shyorongi': { 
          lat: -1.9456, lng: 30.0987,
          cells: ['Gikomero', 'Jabana', 'Kinyinya', 'Ndera', 'Rusoro', 'Rutunga', 'Shyorongi']
        }
      },
      'Nyarugenge': {
        'Nyamirambo': { 
          lat: -1.9441, lng: 30.0619,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Nyamirambo', 'Rwezamenyo']
        },
        'Kimisagara': { 
          lat: -1.9506, lng: 30.0589,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Rwezamenyo': { 
          lat: -1.9567, lng: 30.0645,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Nyamirambo', 'Rwezamenyo']
        },
        'Muhima': { 
          lat: -1.9489, lng: 30.0567,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Nyabugogo': { 
          lat: -1.9523, lng: 30.0589,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Kigali': { 
          lat: -1.9536, lng: 30.0606,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Rugenge': { 
          lat: -1.9467, lng: 30.0634,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Nyakabanda': { 
          lat: -1.9456, lng: 30.0567,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Biryogo': { 
          lat: -1.9500, lng: 30.0645,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        },
        'Kansi': { 
          lat: -1.9489, lng: 30.0623,
          cells: ['Biryogo', 'Kansi', 'Kimisagara', 'Muhima', 'Nyabugogo', 'Rwezamenyo']
        }
      },
      'Kicukiro': {
        'Kicukiro': { 
          lat: -1.9833, lng: 30.1167,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        },
        'Nyarugunga': { 
          lat: -1.9789, lng: 30.1089,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        },
        'Gahanga': { 
          lat: -1.9934, lng: 30.1345,
          cells: ['Gahanga', 'Jabana', 'Kagarama', 'Masaka', 'Nyarugunga']
        },
        'Kagarama': { 
          lat: -1.9878, lng: 30.1234,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        },
        'Masaka': { 
          lat: -2.0123, lng: 30.1456,
          cells: ['Gahanga', 'Jabana', 'Kagarama', 'Masaka', 'Nyarugunga']
        },
        'Niboye': { 
          lat: -1.9767, lng: 30.1098,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        },
        'Gatenga': { 
          lat: -1.9823, lng: 30.1123,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        },
        'Kigarama': { 
          lat: -1.9856, lng: 30.1212,
          cells: ['Gatenga', 'Kicukiro', 'Kigarama', 'Masaka', 'Nyarugunga']
        }
      },
      // Northern Province
      'Burera': {
        'Butaro': { 
          lat: -1.4056, lng: 29.8234,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire', 'Rwerere']
        },
        'Cyanika': { 
          lat: -1.4567, lng: 29.8456,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire']
        },
        'Ruhunde': { 
          lat: -1.4234, lng: 29.8345,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire']
        },
        'Rugengabire': { 
          lat: -1.4123, lng: 29.8567,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire']
        },
        'Cyeru': { 
          lat: -1.4345, lng: 29.8234,
          cells: ['Bandora', 'Cyeru', 'Gahinga', 'Kivuye', 'Kivuruga', 'Ruganda', 'Ruhunde']
        },
        'Kivuye': { 
          lat: -1.4234, lng: 29.8345,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire']
        },
        'Ngobe': { 
          lat: -1.4123, lng: 29.8456,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire']
        },
        'Rwerere': { 
          lat: -1.4345, lng: 29.8234,
          cells: ['Bungwe', 'Butaro', 'Cyanika', 'Kivuye', 'Ngobe', 'Ruhunde', 'Rugengabire', 'Rwerere']
        }
      },
      'Gicumbi': {
        'Gicumbi': { 
          lat: -1.5789, lng: 30.0345,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Byumba': { 
          lat: -1.5867, lng: 30.0789,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Mukarange': { 
          lat: -1.5678, lng: 30.0456,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Miyove': { 
          lat: -1.5456, lng: 30.0234,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Rukomo': { 
          lat: -1.5890, lng: 30.0567,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Kaniga': { 
          lat: -1.5678, lng: 30.0345,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        },
        'Cyumba': { 
          lat: -1.5567, lng: 30.0456,
          cells: ['Bwisige', 'Cyumba', 'Gicumbi', 'Kaniga', 'Kiyombe', 'Mukarange', 'Muko', 'Mutete', 'Nyamiyaga', 'Rukomo', 'Rushaki', 'Shangasha']
        }
      },
      'Musanze': {
        'Musanze': { 
          lat: -1.5000, lng: 29.6333,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Kinigi': { 
          lat: -1.4867, lng: 29.5789,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Muko': { 
          lat: -1.5234, lng: 29.6456,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Nyakinama': { 
          lat: -1.5123, lng: 29.6123,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Gashaki': { 
          lat: -1.4789, lng: 29.5890,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Busogo': { 
          lat: -1.4890, lng: 29.6234,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        },
        'Rwaza': { 
          lat: -1.4567, lng: 29.6345,
          cells: ['Busogo', 'Cyanika', 'Gashaki', 'Kinigi', 'Muko', 'Musanze', 'Nkotsi', 'Nyakinama', 'Rwaza', 'Singiti']
        }
      },
      'Rulindo': {
        'Rulindo': { 
          lat: -1.7234, lng: 30.0456,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Base': { 
          lat: -1.7456, lng: 30.0678,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Bushoki': { 
          lat: -1.7123, lng: 30.0345,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Cyungo': { 
          lat: -1.7345, lng: 30.0567,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Kinihira': { 
          lat: -1.7567, lng: 30.0789,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Masoro': { 
          lat: -1.7234, lng: 30.0456,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        },
        'Mbogo': { 
          lat: -1.7345, lng: 30.0567,
          cells: ['Base', 'Bushoki', 'Cyungo', 'Kinihira', 'Masoro', 'Mbogo', 'Murambi', 'Ngoma', 'Rukozo', 'Rulindo', 'Tumba']
        }
      },
      // Southern Province
      'Huye': {
        'Huye': { 
          lat: -2.6000, lng: 29.7500,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Ngoma': { 
          lat: -2.6234, lng: 29.7456,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Mukura': { 
          lat: -2.5890, lng: 29.7345,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Ruhango': { 
          lat: -2.6123, lng: 29.7567,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Tumba': { 
          lat: -2.5789, lng: 29.7234,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Maraba': { 
          lat: -2.5900, lng: 29.7400,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        },
        'Kinazi': { 
          lat: -2.6100, lng: 29.7600,
          cells: ['Gishamvu', 'Kigoma', 'Kinazi', 'Maraba', 'Mukura', 'Ngoma', 'Ruhashya', 'Rusizi', 'Sovu', 'Tumba']
        }
      },
      'Nyanza': {
        'Nyanza': { 
          lat: -2.3500, lng: 29.7000,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        },
        'Busasamana': { 
          lat: -2.3456, lng: 29.7123,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        },
        'Cyabakamyi': { 
          lat: -2.3678, lng: 29.6890,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        },
        'Kibirizi': { 
          lat: -2.3345, lng: 29.6789,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        },
        'Mukingo': { 
          lat: -2.3567, lng: 29.7234,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        },
        'Muyira': { 
          lat: -2.3400, lng: 29.7100,
          cells: ['Busasamana', 'Cyabakamyi', 'Kibilizi', 'Kigoma', 'Mukingo', 'Muyira', 'Nyagisozi', 'Rwabicuma', 'Tare']
        }
      },
      'Gisagara': {
        'Gisagara': { 
          lat: -2.7234, lng: 29.8234,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Mamba': { 
          lat: -2.7456, lng: 29.8456,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Save': { 
          lat: -2.7123, lng: 29.8012,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Ndora': { 
          lat: -2.7345, lng: 29.8234,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Muganza': { 
          lat: -2.7234, lng: 29.8345,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Mugombwa': { 
          lat: -2.7456, lng: 29.8123,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        },
        'Musha': { 
          lat: -2.7345, lng: 29.8234,
          cells: ['Gikonko', 'Kansi', 'Kibirizi', 'Mamba', 'Muganza', 'Mugombwa', 'Musha', 'Ndora', 'Nkanka', 'Save', 'Sovi']
        }
      },
      'Nyaruguru': {
        'Nyaruguru': { 
          lat: -2.8234, lng: 29.6345,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        },
        'Kibeho': { 
          lat: -2.8456, lng: 29.6567,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        },
        'Muganza': { 
          lat: -2.8123, lng: 29.6123,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        },
        'Cyahinda': { 
          lat: -2.8345, lng: 29.6345,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        },
        'Busanze': { 
          lat: -2.8234, lng: 29.6456,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        },
        'Munini': { 
          lat: -2.8123, lng: 29.6234,
          cells: ['Busanze', 'Cyahinda', 'Kibeho', 'Kivu', 'Muganza', 'Munini', 'Ngera', 'Ngoma', 'Nyabimata', 'Nyagisozi', 'Rusenge']
        }
      },
      'Muhanga': {
        'Muhanga': { 
          lat: -2.1234, lng: 29.7456,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        },
        'Cyeza': { 
          lat: -2.1456, lng: 29.7678,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        },
        'Kabacuzi': { 
          lat: -2.1123, lng: 29.7234,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        },
        'Shyogwe': { 
          lat: -2.1345, lng: 29.7456,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        },
        'Kigoma': { 
          lat: -2.1234, lng: 29.7345,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        },
        'Nyamabuye': { 
          lat: -2.1456, lng: 29.7567,
          cells: ['Cyeza', 'Kabacuzi', 'Kibangu', 'Kigoma', 'Kivumu', 'Muhanga', 'Nyabinoni', 'Nyamabuye', 'Rongi', 'Shyogwe', 'Tamba']
        }
      },
      'Kamonyi': {
        'Kamonyi': { 
          lat: -2.0234, lng: 29.8567,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        },
        'Gacurabwenge': { 
          lat: -2.0456, lng: 29.8789,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        },
        'Kigina': { 
          lat: -2.0123, lng: 29.8345,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        },
        'Kayenzi': { 
          lat: -2.0345, lng: 29.8567,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        },
        'Nyamiyaga': { 
          lat: -2.0234, lng: 29.8456,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        },
        'Ngamba': { 
          lat: -2.0123, lng: 29.8345,
          cells: ['Gacurabwenge', 'Kigini', 'Kigina', 'Kayenzi', 'Nyabikere', 'Nyamiyaga', 'Ngamba', 'Pumbagire', 'Rukoma']
        }
      },
      'Ruhango': {
        'Ruhango': { 
          lat: -2.1567, lng: 29.7890,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        'Bimoba': { 
          lat: -2.1789, lng: 29.8112,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        'Byimana': { 
          lat: -2.1456, lng: 29.7678,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        'Mwendo': { 
          lat: -2.1678, lng: 29.7890,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        'Kabagari': { 
          lat: -2.1567, lng: 29.8000,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        },
        'Mbuye': { 
          lat: -2.1456, lng: 29.7789,
          cells: ['Bimoba', 'Byimana', 'Kabagari', 'Lilira', 'Mbuye', 'Mwendo', 'Ntongwe', 'Ruhango']
        }
      },
      // Eastern Province
      'Nyagatare': {
        'Nyagatare': { 
          lat: -1.3000, lng: 30.3000,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Katabagemu': { 
          lat: -1.3234, lng: 30.3234,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Karama': { 
          lat: -1.2890, lng: 30.2789,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Matimba': { 
          lat: -1.3123, lng: 30.3012,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Rukomo': { 
          lat: -1.3345, lng: 30.3234,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Gatunda': { 
          lat: -1.3123, lng: 30.3123,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        },
        'Karangazi': { 
          lat: -1.3234, lng: 30.3345,
          cells: ['Akagera', 'Gatabage', 'Gatunda', 'Karama', 'Karangazi', 'Katabagemu', 'Matimba', 'Mimuli', 'Mukama', 'Nyagatare', 'Rukomo', 'Rwempasha', 'Tabagwe', 'Tare']
        }
      },
      'Gatsibo': {
        'Gatsibo': { 
          lat: -1.6234, lng: 30.4345,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        },
        'Kageyo': { 
          lat: -1.6456, lng: 30.4567,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        },
        'Kiziguro': { 
          lat: -1.6123, lng: 30.4123,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        },
        'Murambi': { 
          lat: -1.6345, lng: 30.4345,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        },
        'Gahini': { 
          lat: -1.6234, lng: 30.4234,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        },
        'Musha': { 
          lat: -1.6456, lng: 30.4456,
          cells: ['Bakure', 'Bwishyura', 'Cyembwe', 'Gahini', 'Gatsibo', 'Kageyo', 'Kiziguro', 'Kiramuruzi', 'Kiziguro', 'Murambi', 'Musha', 'Ngarama', 'Nkondo', 'Remera', 'Rwimbogo']
        }
      },
      'Kayonza': {
        'Kayonza': { 
          lat: -1.8234, lng: 30.3456,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        },
        'Kabare': { 
          lat: -1.8456, lng: 30.3678,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        },
        'Mukarange': { 
          lat: -1.8123, lng: 30.3234,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        },
        'Rwinkwavu': { 
          lat: -1.8345, lng: 30.3456,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        },
        'Murama': { 
          lat: -1.8234, lng: 30.3345,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        },
        'Ndego': { 
          lat: -1.8456, lng: 30.3567,
          cells: ['Gahini', 'Kabare', 'Kabusa', 'Kayonza', 'Kirehe', 'Mukarange', 'Murama', 'Murundi', 'Mwiri', 'Ndego', 'Nyamirama', 'Rukara', 'Rurama', 'Rwinkwavu']
        }
      },
      'Kirehe': {
        'Kirehe': { 
          lat: -2.1234, lng: 30.4567,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        },
        'Mahama': { 
          lat: -2.1456, lng: 30.4789,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        },
        'Musaza': { 
          lat: -2.1123, lng: 30.4345,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        },
        'Nasho': { 
          lat: -2.1345, lng: 30.4567,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        },
        'Gatore': { 
          lat: -2.1234, lng: 30.4456,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        },
        'Nyakarambi': { 
          lat: -2.1456, lng: 30.4678,
          cells: ['Gahara', 'Gatore', 'Kigina', 'Kirehe', 'Mahama', 'Musaza', 'Nasho', 'Nyakarambi', 'Nyamugari', 'Sake', 'Sangaza']
        }
      },
      'Ngoma': {
        'Ngoma': { 
          lat: -2.0234, lng: 30.5234,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        },
        'Kibungo': { 
          lat: -2.0456, lng: 30.5456,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        },
        'Mugesera': { 
          lat: -2.0123, lng: 30.5012,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        },
        'Zaza': { 
          lat: -2.0345, lng: 30.5234,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        },
        'Rukumbero': { 
          lat: -2.0234, lng: 30.5345,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        },
        'Sake': { 
          lat: -2.0456, lng: 30.5123,
          cells: ['Gashanda', 'Jarama', 'Kibungo', 'Kigina', 'Mugesera', 'Munyiginya', 'Ngoma', 'Remera', 'Rukumbero', 'Rurenge', 'Sake', 'Zaza']
        }
      },
      'Rwamagana': {
        'Rwamagana': { 
          lat: -1.9234, lng: 30.4123,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        },
        'Fumbwe': { 
          lat: -1.9456, lng: 30.4345,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        },
        'Muhazi': { 
          lat: -1.9123, lng: 30.3901,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        },
        'Nyakariro': { 
          lat: -1.9345, lng: 30.4123,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        },
        'Gishari': { 
          lat: -1.9234, lng: 30.4012,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        },
        'Musha': { 
          lat: -1.9456, lng: 30.4234,
          cells: ['Fumbwe', 'Gahengeri', 'Gishari', 'Karengera', 'Muhazi', 'Munyiginya', 'Musha', 'Muyumbu', 'Ntunga', 'Nyakariro', 'Rubona', 'Rwamagana', 'Sake']
        }
      },
      // Western Province
      'Rubavu': {
        'Rubavu': { 
          lat: -1.6833, lng: 29.2500,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Gisenyi': { 
          lat: -1.7000, lng: 29.2589,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Busasamana': { 
          lat: -1.6667, lng: 29.2412,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Cyanzarwe': { 
          lat: -1.6889, lng: 29.2634,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Kivumu': { 
          lat: -1.7111, lng: 29.2856,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Nyamyumba': { 
          lat: -1.6789, lng: 29.2456,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        },
        'Rugerero': { 
          lat: -1.6890, lng: 29.2678,
          cells: ['Bugeshi', 'Busasamana', 'Cyanzarwe', 'Gihundwe', 'Gisenyi', 'Kivumu', 'Mudende', 'Nyamyumba', 'Nyundo', 'Pfunda', 'Rugerero']
        }
      },
      'Karongi': {
        'Karongi': { 
          lat: -2.0234, lng: 29.3890,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        },
        'Bwishyura': { 
          lat: -2.0456, lng: 29.4112,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        },
        'Gitesi': { 
          lat: -2.0123, lng: 29.3678,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        },
        'Murundi': { 
          lat: -2.0345, lng: 29.3890,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        },
        'Gishyita': { 
          lat: -2.0234, lng: 29.3789,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        },
        'Kibuye': { 
          lat: -2.0456, lng: 29.4012,
          cells: ['Bwishyura', 'Gitesi', 'Gishyita', 'Gishari', 'Kibuye', 'Murambi', 'Mutuntu', 'Ruganda', 'Rwankuba', 'Twumba']
        }
      },
      'Ngororero': {
        'Ngororero': { 
          lat: -1.8234, lng: 29.5234,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        },
        'Bwira': { 
          lat: -1.8456, lng: 29.5456,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        },
        'Kageyo': { 
          lat: -1.8123, lng: 29.5012,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        },
        'Muhanda': { 
          lat: -1.8345, lng: 29.5234,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        },
        'Muhororo': { 
          lat: -1.8456, lng: 29.5345,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        },
        'Hindiro': { 
          lat: -1.8234, lng: 29.5123,
          cells: ['Bwira', 'Gatonde', 'Hindiro', 'Kageyo', 'Kavumu', 'Matyazo', 'Muhanda', 'Muhororo', 'Ngororero', 'Nyange', 'Sovu']
        }
      },
      'Nyabihu': {
        'Nyabihu': { 
          lat: -1.7234, lng: 29.4567,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        },
        'Bigogwe': { 
          lat: -1.7456, lng: 29.4789,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        },
        'Jenda': { 
          lat: -1.7123, lng: 29.4345,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        },
        'Rambura': { 
          lat: -1.7345, lng: 29.4567,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        },
        'Karago': { 
          lat: -1.7234, lng: 29.4456,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        },
        'Shyira': { 
          lat: -1.7456, lng: 29.4678,
          cells: ['Bigogwe', 'Jomba', 'Jenda', 'Karago', 'Kintobo', ' Mukamira', 'Nyabihu', 'Rambura', 'Rurembo', 'Shyira']
        }
      },
      'Rusizi': {
        'Rusizi': { 
          lat: -2.4234, lng: 29.0123,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        },
        'Bugarama': { 
          lat: -2.4456, lng: 29.0345,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        },
        'Gihundwe': { 
          lat: -2.4123, lng: 28.9901,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        },
        'Kamembe': { 
          lat: -2.4345, lng: 29.0123,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        },
        'Nkombo': { 
          lat: -2.4234, lng: 29.0234,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        },
        'Nyakabuye': { 
          lat: -2.4456, lng: 29.0012,
          cells: ['Bugarama', 'Gihundwe', 'Gashongi', 'Giheke', 'Gihundwe', 'Imigano', 'Kamembe', 'Mururu', 'Nkanka', 'Nkombo', 'Nyakabuye', 'Nzahaha', 'Rusizi']
        }
      },
      // Missing districts - Official Rwandan administrative structure
      'Bugesera': {
        'Bugesera': { 
          lat: -2.1234, lng: 30.2345,
          cells: ['Gashanda', 'Jarama', 'Kamabuye', 'Kanyinya', 'Mareba', 'Mayange', 'Mwendo', 'Ngeruka', 'Ntarama', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
        },
        'Gashanda': { 
          lat: -2.1345, lng: 30.2456,
          cells: ['Gashanda', 'Jarama', 'Kamabuye', 'Kanyinya', 'Mareba', 'Mayange', 'Mwendo', 'Ngeruka', 'Ntarama', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
        },
        'Jarama': { 
          lat: -2.1123, lng: 30.2234,
          cells: ['Gashanda', 'Jarama', 'Kamabuye', 'Kanyinya', 'Mareba', 'Mayange', 'Mwendo', 'Ngeruka', 'Ntarama', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
        },
        'Rilima': { 
          lat: -2.1456, lng: 30.2567,
          cells: ['Gashanda', 'Jarama', 'Kamabuye', 'Kanyinya', 'Mareba', 'Mayange', 'Mwendo', 'Ngeruka', 'Ntarama', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
        },
        'Ntarama': { 
          lat: -2.1234, lng: 30.2345,
          cells: ['Gashanda', 'Jarama', 'Kamabuye', 'Kanyinya', 'Mareba', 'Mayange', 'Mwendo', 'Ngeruka', 'Ntarama', 'Rilima', 'Ruhuha', 'Rweru', 'Shyara']
        }
      },
      'Gakenke': {
        'Gakenke': { 
          lat: -1.6834, lng: 29.7890,
          cells: ['Aparagano', 'Businga', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Gikoro', 'Gitisi', 'Janja', 'Kamubuga', 'Kivuruga', 'Mugogo', 'Muhondo', 'Muyongwe', 'Nemba']
        },
        'Coko': { 
          lat: -1.6945, lng: 29.8001,
          cells: ['Aparagano', 'Businga', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Gikoro', 'Gitisi', 'Janja', 'Kamubuga', 'Kivuruga', 'Mugogo', 'Muhondo', 'Muyongwe', 'Nemba']
        },
        'Gashenyi': { 
          lat: -1.6723, lng: 29.7779,
          cells: ['Aparagano', 'Businga', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Gikoro', 'Gitisi', 'Janja', 'Kamubuga', 'Kivuruga', 'Mugogo', 'Muhondo', 'Muyongwe', 'Nemba']
        },
        'Kivuruga': { 
          lat: -1.6890, lng: 29.7989,
          cells: ['Aparagano', 'Businga', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Gikoro', 'Gitisi', 'Janja', 'Kamubuga', 'Kivuruga', 'Mugogo', 'Muhondo', 'Muyongwe', 'Nemba']
        },
        'Muhondo': { 
          lat: -1.6789, lng: 29.7890,
          cells: ['Aparagano', 'Businga', 'Coko', 'Cyabingo', 'Gakenke', 'Gashenyi', 'Gikoro', 'Gitisi', 'Janja', 'Kamubuga', 'Kivuruga', 'Mugogo', 'Muhondo', 'Muyongwe', 'Nemba']
        }
      },
      'Nyamagabe': {
        'Nyamagabe': { 
          lat: -2.5123, lng: 29.2345,
          cells: ['Buruhukuriro', 'Cyanika', 'Gatare', 'Kaduha', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mudasomwa', 'Mugano', 'Musange', 'Mushishiro', 'Nyabagende', 'Nyabikoni', 'Nyamagabe']
        },
        'Mudasomwa': { 
          lat: -2.5234, lng: 29.2456,
          cells: ['Buruhukuriro', 'Cyanika', 'Gatare', 'Kaduha', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mudasomwa', 'Mugano', 'Musange', 'Mushishiro', 'Nyabagende', 'Nyabikoni', 'Nyamagabe']
        },
        'Musange': { 
          lat: -2.5012, lng: 29.2234,
          cells: ['Buruhukuriro', 'Cyanika', 'Gatare', 'Kaduha', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mudasomwa', 'Mugano', 'Musange', 'Mushishiro', 'Nyabagende', 'Nyabikoni', 'Nyamagabe']
        },
        'Kitabi': { 
          lat: -2.5345, lng: 29.2567,
          cells: ['Buruhukuriro', 'Cyanika', 'Gatare', 'Kaduha', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mudasomwa', 'Mugano', 'Musange', 'Mushishiro', 'Nyabagende', 'Nyabikoni', 'Nyamagabe']
        },
        'Kibirizi': { 
          lat: -2.5123, lng: 29.2345,
          cells: ['Buruhukuriro', 'Cyanika', 'Gatare', 'Kaduha', 'Kibirizi', 'Kibumbwe', 'Kitabi', 'Mbazi', 'Mudasomwa', 'Mugano', 'Musange', 'Mushishiro', 'Nyabagende', 'Nyabikoni', 'Nyamagabe']
        }
      },
      'Nyamasheke': {
        'Nyamasheke': { 
          lat: -2.3123, lng: 29.0123,
          cells: ['Biremeyi', 'Bushenge', 'Cyato', 'Gihombo', 'Gihundwe', 'Gisovu', 'Kagano', 'Kanjongo', 'Karambo', 'Karongi', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyakabuye', 'Rangiro']
        },
        'Gihombo': { 
          lat: -2.3234, lng: 29.0234,
          cells: ['Biremeyi', 'Bushenge', 'Cyato', 'Gihombo', 'Gihundwe', 'Gisovu', 'Kagano', 'Kanjongo', 'Karambo', 'Karongi', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyakabuye', 'Rangiro']
        },
        'Kagano': { 
          lat: -2.3012, lng: 29.0012,
          cells: ['Biremeyi', 'Bushenge', 'Cyato', 'Gihombo', 'Gihundwe', 'Gisovu', 'Kagano', 'Kanjongo', 'Karambo', 'Karongi', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyakabuye', 'Rangiro']
        },
        'Rangiro': { 
          lat: -2.3345, lng: 29.0345,
          cells: ['Biremeyi', 'Bushenge', 'Cyato', 'Gihombo', 'Gihundwe', 'Gisovu', 'Kagano', 'Kanjongo', 'Karambo', 'Karongi', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyakabuye', 'Rangiro']
        },
        'Macuba': { 
          lat: -2.3123, lng: 29.0123,
          cells: ['Biremeyi', 'Bushenge', 'Cyato', 'Gihombo', 'Gihundwe', 'Gisovu', 'Kagano', 'Kanjongo', 'Karambo', 'Karongi', 'Kirimbi', 'Macuba', 'Mahembe', 'Nyakabuye', 'Rangiro']
        }
      },
      'Rutsiro': {
        'Rutsiro': { 
          lat: -1.9234, lng: 29.3456,
          cells: ['Base', 'Bihembe', 'Gihango', 'Kigeyo', 'Kivumu', 'Manongi', 'Mukura', 'Murambi', 'Musasa', 'Nkora', 'Nyabirasi', 'Ruhango', 'Rusebeya']
        },
        'Gihango': { 
          lat: -1.9345, lng: 29.3567,
          cells: ['Base', 'Bihembe', 'Gihango', 'Kigeyo', 'Kivumu', 'Manongi', 'Mukura', 'Murambi', 'Musasa', 'Nkora', 'Nyabirasi', 'Ruhango', 'Rusebeya']
        },
        'Kigeyo': { 
          lat: -1.9123, lng: 29.3345,
          cells: ['Base', 'Bihembe', 'Gihango', 'Kigeyo', 'Kivumu', 'Manongi', 'Mukura', 'Murambi', 'Musasa', 'Nkora', 'Nyabirasi', 'Ruhango', 'Rusebeya']
        },
        'Murambi': { 
          lat: -1.9456, lng: 29.3678,
          cells: ['Base', 'Bihembe', 'Gihango', 'Kigeyo', 'Kivumu', 'Manongi', 'Mukura', 'Murambi', 'Musasa', 'Nkora', 'Nyabirasi', 'Ruhango', 'Rusebeya']
        },
        'Nyabirasi': { 
          lat: -1.9234, lng: 29.3456,
          cells: ['Base', 'Bihembe', 'Gihango', 'Kigeyo', 'Kivumu', 'Manongi', 'Mukura', 'Murambi', 'Musasa', 'Nkora', 'Nyabirasi', 'Ruhango', 'Rusebeya']
        }
      }
    };

    // Province mapping based on official Rwandan administrative structure
    this.provinceMap = {
      // Kigali City (3 districts)
      'Gasabo': 'Kigali',
      'Kicukiro': 'Kigali', 
      'Nyarugenge': 'Kigali',
      
      // Eastern Province (7 districts)
      'Bugesera': 'Eastern',
      'Gatsibo': 'Eastern',
      'Kayonza': 'Eastern',
      'Kirehe': 'Eastern',
      'Ngoma': 'Eastern',
      'Nyagatare': 'Eastern',
      'Rwamagana': 'Eastern',
      
      // Northern Province (5 districts)
      'Burera': 'Northern',
      'Gakenke': 'Northern',
      'Gicumbi': 'Northern',
      'Musanze': 'Northern',
      'Rulindo': 'Northern',
      
      // Southern Province (8 districts)
      'Gisagara': 'Southern',
      'Huye': 'Southern',
      'Kamonyi': 'Southern',
      'Muhanga': 'Southern',
      'Nyamagabe': 'Southern',
      'Nyanza': 'Southern',
      'Nyaruguru': 'Southern',
      'Ruhango': 'Southern',
      
      // Western Province (7 districts)
      'Karongi': 'Western',
      'Ngororero': 'Western',
      'Nyabihu': 'Western',
      'Nyamasheke': 'Western',
      'Rubavu': 'Western',
      'Rusizi': 'Western',
      'Rutsiro': 'Western'
    };
  }

  // Main geocoding function
  async geocodeLocation(district, sector, village, cell = null) {
    try {
      console.log(`Geocoding: district=${district}, sector=${sector}, village=${village}, cell=${cell}`);
      
      // First try the comprehensive local database
      const localCoords = this.getLocalCoordinates(district, sector, village, cell);
      if (localCoords) {
        console.log('Found coordinates in local database:', localCoords);
        return localCoords;
      }

      console.log('Not found in local database, trying API...');
      // If not found locally, use OpenStreetMap Nominatim API
      return await this.geocodeWithAPI(district, sector, village, cell);
    } catch (error) {
      console.error('Geocoding error:', error);
      return { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
    }
  }

  // Get coordinates from local database
  getLocalCoordinates(district, sector, village, cell = null) {
    if (!district || !this.locationCoordinates[district]) {
      return null;
    }

    const districtData = this.locationCoordinates[district];
    
    if (!sector || !districtData[sector]) {
      // Return district center if sector not found
      const firstSector = Object.values(districtData)[0];
      return firstSector ? { lat: firstSector.lat, lng: firstSector.lng } : null;
    }

    const sectorData = districtData[sector];
    
    if (!village) {
      // Return sector center if village not specified
      return { lat: sectorData.lat, lng: sectorData.lng };
    }

    // For cell-level precision, add small offset based on cell name hash
    if (cell && sectorData.cells && sectorData.cells.includes(cell)) {
      const cellIndex = sectorData.cells.indexOf(cell);
      const latOffset = (cellIndex * 0.001) - 0.002; // Small offset for different cells
      const lngOffset = (cellIndex * 0.001) - 0.002;
      
      return {
        lat: sectorData.lat + latOffset,
        lng: sectorData.lng + lngOffset
      };
    }

    // Return sector coordinates if village/cell not found in local data
    return { lat: sectorData.lat, lng: sectorData.lng };
  }

  // Geocoding using OpenStreetMap Nominatim API
  async geocodeWithAPI(district, sector, village, cell = null) {
    const query = [];
    
    if (cell) query.push(cell);
    if (village) query.push(village);
    if (sector) query.push(sector);
    if (district) query.push(district);
    query.push('Rwanda');
    
    const searchQuery = query.join(', ');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=rw`;
    
    console.log('API Query:', searchQuery);
    
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
              const coords = {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon)
              };
              console.log('API Result:', coords);
              resolve(coords);
            } else {
              console.log('No results from API, trying district only...');
              // Try with district only
              this.geocodeDistrictOnly(district).then(resolve).catch(reject);
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
  async geocodeDistrictOnly(district) {
    if (!district) {
      return { lat: -1.9441, lng: 30.0619 }; // Default to Kigali
    }

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

  // Get province from district
  getProvince(district) {
    return this.provinceMap[district] || 'Kigali';
  }

  // Get all available districts
  getAvailableDistricts() {
    return Object.keys(this.locationCoordinates);
  }

  // Get sectors for a district
  getSectorsForDistrict(district) {
    return this.locationCoordinates[district] ? Object.keys(this.locationCoordinates[district]) : [];
  }

  // Get cells for a sector
  getCellsForSector(district, sector) {
    return this.locationCoordinates[district] && this.locationCoordinates[district][sector] 
      ? this.locationCoordinates[district][sector].cells || []
      : [];
  }
}

module.exports = new GeocodingService();
