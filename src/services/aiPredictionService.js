const path = require('path');
const { spawn } = require('child_process');

const SHOCK_MAP = {
  drought: 'Drought',
  flood: 'Crop Disease',
  illness: 'Illness',
  income: 'Price Spike',
  other: 'Price Spike'
};

const REGION_MAP = {
  kigali: 'Kigali',
  northern: 'Northern',
  southern: 'Southern',
  eastern: 'Eastern',
  western: 'Western'
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRegion(location) {
  const province = (location?.province || '').toLowerCase();
  const district = (location?.district || '').toLowerCase();
  const source = province || district;

  if (source.includes('kigali')) return 'Kigali';
  if (source.includes('north')) return 'Northern';
  if (source.includes('south')) return 'Southern';
  if (source.includes('east')) return 'Eastern';
  if (source.includes('west')) return 'Western';

  return 'Kigali';
}

function buildAiPayload(input = {}) {
  const shocks = Array.isArray(input.shocks_experienced) ? input.shocks_experienced : [];
  const mappedShock = shocks.length > 0 ? (SHOCK_MAP[String(shocks[0]).toLowerCase()] || 'No Shock') : 'No Shock';
  const mappedRegion = REGION_MAP[String(input.region || '').toLowerCase()] || normalizeRegion(input.location);
  const householdSize = Number(input.household_size || input.citizen?.household_size || 4);

  return {
    household_size: clamp(Number.isFinite(householdSize) ? householdSize : 4, 1, 12),
    income_level: clamp(Number(input.income_level || 300), 10, 1500),
    farm_size: clamp(Number(input.farm_size || 1.2), 0.1, 8),
    livestock_ownership: clamp(Number(input.livestock_ownership || 2), 0, 30),
    meals_per_day: clamp(Number(input.meals_per_day || 2), 0, 3),
    days_of_food_left: clamp(Number(input.days_of_food_left || 3), 0, 7),
    food_change_type: ['none', 'quantity', 'quality', 'both'].includes(input.food_change_type)
      ? input.food_change_type
      : 'none',
    shocks_experienced: mappedShock,
    market_access: clamp(Number(input.market_access || 5), 0, 10),
    food_prices_index: clamp(Number(input.food_prices_index || 120), 80, 200),
    rainfall_mm: clamp(Number(input.rainfall_mm || 900), 150, 2200),
    region: mappedRegion,
    crop_yield: clamp(Number(input.crop_yield || 3), 0, 20)
  };
}

function parsePredictionOutput(stdout = '') {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    try {
      const parsed = JSON.parse(lines[i]);
      if (parsed && parsed.risk_level) {
        return {
          risk_level: String(parsed.risk_level).toLowerCase(),
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : null
        };
      }
      if (parsed && parsed.error) {
        throw new Error(parsed.error);
      }
    } catch (error) {
      // Continue trying earlier lines.
    }
  }
  throw new Error('Could not parse AI prediction output.');
}

function runAiPrediction(payload) {
  return new Promise((resolve, reject) => {
    const pythonBin = process.env.PYTHON_BIN || 'python';
    const scriptPath = path.resolve(__dirname, '..', '..', '..', 'AI', 'predict_new.py');
    const tempFilePath = path.resolve(__dirname, '..', '..', '..', 'AI', 'test_input_temp.json');
    
    // Write payload to temporary file
    const fs = require('fs');
    try {
      console.log('Writing to temp file:', tempFilePath);
      fs.writeFileSync(tempFilePath, JSON.stringify(payload));
      console.log('Temp file written successfully');
    } catch (err) {
      reject(new Error(`Failed to write temp file: ${err.message}`));
      return;
    }

    const child = spawn(pythonBin, [scriptPath], {
      cwd: path.resolve(__dirname, '..', '..', '..')
    });

    let stdout = '';
    let stderr = '';

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('AI prediction timed out after 5 seconds'));
    }, 5000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start AI process: ${err.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      // Clean up temp file
      // try {
      //   fs.unlinkSync(tempFilePath);
      // } catch (err) {
      //   // Ignore cleanup errors
      // }
      
      if (code !== 0) {
        reject(new Error(`AI prediction failed with code ${code}: ${stderr || stdout}`));
        return;
      }
      try {
        resolve(parsePredictionOutput(stdout));
      } catch (error) {
        reject(new Error(`${error.message} ${stderr ? `stderr: ${stderr}` : ''}`.trim()));
      }
    });
  });
}

const aiPredictionService = {
  buildAiPayload,
  async predictRisk(input) {
    const payload = buildAiPayload(input);
    const prediction = await runAiPrediction(payload);
    return {
      ...prediction,
      source: 'ai'
    };
  }
};

module.exports = aiPredictionService;
