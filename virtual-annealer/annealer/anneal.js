/**
 * Virtual Annealing Machine - Simulated Annealing Algorithm
 * 
 * Implementation of Simulated Annealing for Ising Model optimization
 * Energy function: E = -Σ J_ij s_i s_j - Σ h_i s_i
 * where s_i ∈ {+1, -1}
 */

class VirtualAnnealer {
  /**
   * Initialize the annealer
   * @param {number} spinCount - Number of spins (variables)
   * @param {number} initialTemp - Initial temperature T0
   * @param {number} coolingRate - Cooling rate (0 < rate < 1)
   * @param {number} steps - Number of annealing steps
   */
  constructor(spinCount, initialTemp, coolingRate, steps) {
    this.N = spinCount;
    this.T0 = initialTemp;
    this.coolingRate = coolingRate;
    this.steps = steps;
    
    // Interaction matrix J (coupling strengths)
    this.J = this.generateRandomJ();
    
    // External field h
    this.h = this.generateRandomH();
    
    // Current spin configuration
    this.spins = this.initializeSpins();
    
    // Best solution found
    this.bestSpins = [...this.spins];
    this.bestEnergy = this.calculateEnergy(this.spins);
    
    // History for visualization
    this.energyHistory = [];
    this.temperatureHistory = [];
  }
  
  /**
   * Generate random interaction matrix J
   * @returns {Array<Array<number>>} Interaction matrix
   */
  generateRandomJ() {
    const J = Array(this.N).fill(0).map(() => Array(this.N).fill(0));
    
    // Generate symmetric matrix with random values
    for (let i = 0; i < this.N; i++) {
      for (let j = i + 1; j < this.N; j++) {
        const value = (Math.random() - 0.5) * 2; // Range: [-1, 1]
        J[i][j] = value;
        J[j][i] = value;
      }
    }
    
    return J;
  }
  
  /**
   * Generate random external field h
   * @returns {Array<number>} External field vector
   */
  generateRandomH() {
    return Array(this.N).fill(0).map(() => (Math.random() - 0.5) * 2);
  }
  
  /**
   * Initialize random spin configuration
   * @returns {Array<number>} Initial spin configuration (±1)
   */
  initializeSpins() {
    return Array(this.N).fill(0).map(() => Math.random() < 0.5 ? 1 : -1);
  }
  
  /**
   * Calculate energy for given spin configuration
   * E = -Σ J_ij s_i s_j - Σ h_i s_i
   * @param {Array<number>} spins - Spin configuration
   * @returns {number} Energy value
   */
  calculateEnergy(spins) {
    let energy = 0;
    
    // Interaction term: -Σ J_ij s_i s_j
    for (let i = 0; i < this.N; i++) {
      for (let j = i + 1; j < this.N; j++) {
        energy -= this.J[i][j] * spins[i] * spins[j];
      }
    }
    
    // External field term: -Σ h_i s_i
    for (let i = 0; i < this.N; i++) {
      energy -= this.h[i] * spins[i];
    }
    
    return energy;
  }
  
  /**
   * Calculate energy change when flipping spin at index i
   * ΔE = 2 * s_i * (Σ J_ij s_j + h_i)
   * @param {Array<number>} spins - Current spin configuration
   * @param {number} index - Index of spin to flip
   * @returns {number} Energy change
   */
  calculateEnergyChange(spins, index) {
    let delta = 0;
    
    // Contribution from interactions
    for (let j = 0; j < this.N; j++) {
      if (j !== index) {
        delta += this.J[index][j] * spins[j];
      }
    }
    
    // Contribution from external field
    delta += this.h[index];
    
    // Energy change when flipping spin
    return 2 * spins[index] * delta;
  }
  
  /**
   * Run simulated annealing algorithm
   * @param {Function} progressCallback - Callback for progress updates
   * @returns {Object} Result object with final configuration and energy
   */
  anneal(progressCallback = null) {
    let currentEnergy = this.calculateEnergy(this.spins);
    let temperature = this.T0;
    
    this.energyHistory = [currentEnergy];
    this.temperatureHistory = [temperature];
    
    for (let step = 0; step < this.steps; step++) {
      // Pick random spin to flip
      const index = Math.floor(Math.random() * this.N);
      
      // Calculate energy change
      const deltaE = this.calculateEnergyChange(this.spins, index);
      
      // Metropolis criterion
      let accept = false;
      if (deltaE < 0) {
        // Always accept improvement
        accept = true;
      } else {
        // Accept with probability exp(-ΔE/T)
        const probability = Math.exp(-deltaE / temperature);
        accept = Math.random() < probability;
      }
      
      // Apply spin flip if accepted
      if (accept) {
        this.spins[index] *= -1;
        currentEnergy += deltaE;
        
        // Update best solution if improved
        if (currentEnergy < this.bestEnergy) {
          this.bestEnergy = currentEnergy;
          this.bestSpins = [...this.spins];
        }
      }
      
      // Cool down temperature
      temperature *= this.coolingRate;
      
      // Record history (sample every 10 steps to reduce data)
      if (step % 10 === 0) {
        this.energyHistory.push(currentEnergy);
        this.temperatureHistory.push(temperature);
      }
      
      // Progress callback
      if (progressCallback && step % 100 === 0) {
        progressCallback({
          step: step,
          totalSteps: this.steps,
          currentEnergy: currentEnergy,
          bestEnergy: this.bestEnergy,
          temperature: temperature,
          progress: (step / this.steps) * 100
        });
      }
    }
    
    return {
      bestSpins: this.bestSpins,
      bestEnergy: this.bestEnergy,
      finalSpins: this.spins,
      finalEnergy: currentEnergy,
      energyHistory: this.energyHistory,
      temperatureHistory: this.temperatureHistory,
      interactionMatrix: this.J,
      externalField: this.h
    };
  }
  
  /**
   * Run annealing asynchronously (non-blocking)
   * @param {Function} progressCallback - Progress callback
   * @returns {Promise<Object>} Result promise
   */
  async annealAsync(progressCallback = null) {
    return new Promise((resolve) => {
      let currentEnergy = this.calculateEnergy(this.spins);
      let temperature = this.T0;
      let step = 0;
      
      this.energyHistory = [currentEnergy];
      this.temperatureHistory = [temperature];
      
      const iterate = () => {
        // Process multiple steps per frame for better performance
        const stepsPerFrame = 10;
        
        for (let i = 0; i < stepsPerFrame && step < this.steps; i++, step++) {
          // Pick random spin to flip
          const index = Math.floor(Math.random() * this.N);
          
          // Calculate energy change
          const deltaE = this.calculateEnergyChange(this.spins, index);
          
          // Metropolis criterion
          let accept = false;
          if (deltaE < 0) {
            accept = true;
          } else {
            const probability = Math.exp(-deltaE / temperature);
            accept = Math.random() < probability;
          }
          
          // Apply spin flip if accepted
          if (accept) {
            this.spins[index] *= -1;
            currentEnergy += deltaE;
            
            // Update best solution
            if (currentEnergy < this.bestEnergy) {
              this.bestEnergy = currentEnergy;
              this.bestSpins = [...this.spins];
            }
          }
          
          // Cool down
          temperature *= this.coolingRate;
          
          // Record history
          if (step % 10 === 0) {
            this.energyHistory.push(currentEnergy);
            this.temperatureHistory.push(temperature);
          }
        }
        
        // Progress callback
        if (progressCallback) {
          progressCallback({
            step: step,
            totalSteps: this.steps,
            currentEnergy: currentEnergy,
            bestEnergy: this.bestEnergy,
            temperature: temperature,
            progress: (step / this.steps) * 100
          });
        }
        
        // Continue or finish
        if (step < this.steps) {
          requestAnimationFrame(iterate);
        } else {
          resolve({
            bestSpins: this.bestSpins,
            bestEnergy: this.bestEnergy,
            finalSpins: this.spins,
            finalEnergy: currentEnergy,
            energyHistory: this.energyHistory,
            temperatureHistory: this.temperatureHistory,
            interactionMatrix: this.J,
            externalField: this.h
          });
        }
      };
      
      requestAnimationFrame(iterate);
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VirtualAnnealer;
}

