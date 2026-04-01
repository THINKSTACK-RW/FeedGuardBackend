const { spawn } = require('child_process');
const path = require('path');

class PredictionService {
  constructor() {
    this.pythonPath = 'python';
    // Use absolute path calculated from the project root
    this.scriptPath = path.resolve(__dirname, '../../../Model/predict_new.py');
  }

  async predictRisk(data) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonPath, [this.scriptPath, JSON.stringify(data)]);

      let resultData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (chunk) => {
        resultData += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        errorData += chunk.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorData}`));
          return;
        }
        try {
          const result = JSON.parse(resultData);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(`Failed to parse prediction result: ${resultData}`));
        }
      });
    });
  }
}

module.exports = new PredictionService();
