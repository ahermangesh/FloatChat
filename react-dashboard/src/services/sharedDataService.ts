// Shared data service for dashboard components
export interface ArgoProfile {
  latitude: number;
  longitude: number;
  temperature: number;
  salinity: number;
  pressure: number;
  depth: number;
  date: string;
  platform: string;
}

export interface Float {
  id: string;
  lat: number;
  lng: number;
  temperature: number;
  salinity: number;
  depth: number;
  status: 'active' | 'inactive';
}

class DataService {
  private argoData: ArgoProfile[] = [];
  private floatData: Float[] = [
    { id: 'F001', lat: 18.9750, lng: 72.8258, temperature: 28.5, salinity: 35.2, depth: 100, status: 'active' },
    { id: 'F002', lat: 13.0878, lng: 80.2785, temperature: 29.1, salinity: 35.8, depth: 150, status: 'active' },
    { id: 'F003', lat: 22.5675, lng: 88.3700, temperature: 27.8, salinity: 34.9, depth: 200, status: 'inactive' },
    { id: 'F004', lat: 8.0883, lng: 77.0595, temperature: 26.3, salinity: 35.1, depth: 180, status: 'active' },
    { id: 'F005', lat: 15.4909, lng: 73.8278, temperature: 28.9, salinity: 35.5, depth: 120, status: 'active' },
    { id: 'F006', lat: 11.0000, lng: 85.0000, temperature: 27.2, salinity: 35.0, depth: 140, status: 'active' },
    { id: 'F007', lat: 6.9271, lng: 79.8612, temperature: 28.7, salinity: 35.3, depth: 110, status: 'inactive' },
    { id: 'F008', lat: 12.0000, lng: 68.0000, temperature: 29.5, salinity: 35.7, depth: 95, status: 'active' },
    { id: 'F009', lat: 4.2105, lng: 73.5074, temperature: 28.1, salinity: 35.4, depth: 160, status: 'active' },
    { id: 'F010', lat: 16.0000, lng: 94.0000, temperature: 27.9, salinity: 34.8, depth: 130, status: 'inactive' },
  ];

  constructor() {
    this.loadArgoData();
  }

  private async loadArgoData() {
    try {
      const response = await fetch('/data/chroma_2024-07.csv');
      const csvText = await response.text();
      this.argoData = this.parseArgoCSV(csvText);
    } catch (error) {
      console.log('CSV data not available, using float data');
    }
  }

  private parseArgoCSV(csvText: string): ArgoProfile[] {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',');
    const profiles: ArgoProfile[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      if (values.length < headers.length) continue;

      try {
        const profile: ArgoProfile = {
          latitude: parseFloat(values[headers.indexOf('Latitude')] || values[0]),
          longitude: parseFloat(values[headers.indexOf('Longitude')] || values[1]),
          temperature: parseFloat(values[headers.indexOf('Temperature')] || values[2]),
          salinity: parseFloat(values[headers.indexOf('Salinity')] || values[3]),
          pressure: parseFloat(values[headers.indexOf('Pressure')] || values[4]),
          depth: parseFloat(values[headers.indexOf('Depth')] || values[5]),
          date: values[headers.indexOf('Date')] || values[6] || new Date().toISOString(),
          platform: values[headers.indexOf('Platform')] || values[7] || 'Unknown'
        };

        if (!isNaN(profile.latitude) && !isNaN(profile.longitude)) {
          profiles.push(profile);
        }
      } catch (error) {
        continue;
      }
    }

    return profiles;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  // Public methods for accessing data
  getFloatData(): Float[] {
    return this.floatData;
  }

  getArgoData(): ArgoProfile[] {
    return this.argoData;
  }

  getCsvDataCount(): number {
    return this.argoData.length;
  }

  getFloatCategories(): { active: number; inactive: number; total: number } {
    const active = this.floatData.filter(f => f.status === 'active').length;
    const inactive = this.floatData.filter(f => f.status === 'inactive').length;
    return { active, inactive, total: 2 }; // 2 categories: active and inactive
  }

  getTemperatureData(): number[] {
    if (this.argoData.length > 0) {
      return this.argoData.slice(0, 7).map(d => d.temperature);
    }
    return this.floatData.slice(0, 7).map(f => f.temperature);
  }

  getSalinityData(): number[] {
    if (this.argoData.length > 0) {
      return this.argoData.slice(0, 7).map(d => d.salinity);
    }
    return this.floatData.slice(0, 7).map(f => f.salinity);
  }

  getDepthData(): number[] {
    if (this.argoData.length > 0) {
      return this.argoData.slice(0, 7).map(d => d.depth);
    }
    return this.floatData.slice(0, 7).map(f => f.depth);
  }

  getAverageTemperature(): number {
    const temps = this.getTemperatureData();
    return temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
  }

  getAverageSalinity(): number {
    const salinities = this.getSalinityData();
    return salinities.reduce((sum, sal) => sum + sal, 0) / salinities.length;
  }

  getAverageDepth(): number {
    const depths = this.getDepthData();
    return depths.reduce((sum, depth) => sum + depth, 0) / depths.length;
  }
}

export const dataService = new DataService();
