import PredictionService, { HouseholdData } from './services/PredictionService';

const sampleData: HouseholdData = {
  household_size: 5,
  income_level: 400,
  farm_size: 2.5,
  livestock_ownership: 5,
  meals_per_day: 2,
  days_of_food_left: 3,
  food_change_type: 'quantity',
  shocks_experienced: 'No Shock',
  market_access: 6,
  food_prices_index: 120,
  rainfall_mm: 800,
  region: 'Northern',
  crop_yield: 3.2
};

async function test() {
  console.log('Testing Prediction Service with sample data...');
  try {
    const result = await PredictionService.predictRisk(sampleData);
    console.log('Prediction Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Prediction failed:', error);
    process.exit(1);
  }
}

test();
