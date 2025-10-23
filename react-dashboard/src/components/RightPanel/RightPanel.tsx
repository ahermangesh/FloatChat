import React, { useState, useEffect } from 'react';
import './RightPanel.css';
import { dataService } from '../../services/sharedDataService';

const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'filters' | 'charts'>('charts');
  const [dynamicStats, setDynamicStats] = useState({
    categories: 2,
    processed: 0,
    active: 0,
    inactive: 0,
    csvCount: 0,
    avgTemp: 0,
    avgSalinity: 0,
    avgDepth: 0
  });
  
  const [temperatureData, setTemperatureData] = useState<number[]>([]);
  const [salinityData, setSalinityData] = useState<number[]>([]);
  const [depthData, setDepthData] = useState<number[]>([]);
  
  // Load dynamic data
  useEffect(() => {
    const loadData = () => {
      const floatCategories = dataService.getFloatCategories();
      const csvCount = dataService.getCsvDataCount();
      
      setDynamicStats({
        categories: floatCategories.total,
        processed: csvCount > 0 ? csvCount : dataService.getFloatData().length,
        active: floatCategories.active,
        inactive: floatCategories.inactive,
        csvCount,
        avgTemp: Math.round(dataService.getAverageTemperature() * 10) / 10,
        avgSalinity: Math.round(dataService.getAverageSalinity() * 10) / 10,
        avgDepth: Math.round(dataService.getAverageDepth())
      });

      setTemperatureData(dataService.getTemperatureData());
      setSalinityData(dataService.getSalinityData());
      setDepthData(dataService.getDepthData());
    };

    loadData();
    // Reload data every 10 seconds to check for updates
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const [dailyData, setDailyData] = useState([
    { day: 'D1', occurrences: 120 },
    { day: 'D2', occurrences: 180 },
    { day: 'D3', occurrences: 240 },
    { day: 'D4', occurrences: 310 },
    { day: 'D5', occurrences: 435 },
    { day: 'D6', occurrences: 210 },
    { day: 'D7', occurrences: 260 }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyData(prevData => 
        prevData.map(item => ({
          ...item,
          occurrences: Math.max(50, item.occurrences + Math.floor((Math.random() - 0.5) * 40))
        }))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate SVG path and area
  const generatePath = () => {
    const width = 300;
    const height = 120;
    const padding = 20;
    const maxOccurrences = Math.max(...dailyData.map(d => d.occurrences));
    const minOccurrences = Math.min(...dailyData.map(d => d.occurrences));
    const range = maxOccurrences - minOccurrences || 1;

    const points = dailyData.map((item, index) => {
      const x = padding + (index * (width - 2 * padding)) / (dailyData.length - 1);
      const y = height - padding - ((item.occurrences - minOccurrences) / range) * (height - 2 * padding);
      return { x, y, occurrences: item.occurrences };
    });

    const pathData = points.reduce((acc, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${acc} ${command} ${point.x} ${point.y}`;
    }, '');

    const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { pathData, areaData, points };
  };

  const { pathData, areaData, points } = generatePath();

  return (
    <div className="right-panel">
      <div className="panel-tabs">
        <button 
          className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
          onClick={() => setActiveTab('charts')}
        >
          Charts
        </button>
        <button 
          className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
      </div>

      {activeTab === 'filters' && (
        <div className="filters-section">
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stats-header">
              <span className="header-item">Categories</span>
              <span className="header-item">Processed</span>
              <span className="header-item">Pending</span>
            </div>
            <div className="stat-row">
              <div className="stat-large">
                <span className="stat-number">{dynamicStats.categories}</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-small">
                <span className="stat-number">{dynamicStats.processed}</span>
                <span className="stat-label">Processed</span>
              </div>
              <div className="stat-small">
                <span className="stat-number">{dynamicStats.inactive}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            
            <div className="stats-header">
              <span className="header-item">Detections</span>
              <span className="header-item">Avg. Value</span>
              <span className="header-item">Index</span>
            </div>
            <div className="stat-row">
              <div className="stat-large">
                <span className="stat-number">{dynamicStats.active}</span>
                <span className="stat-label">Active Floats</span>
              </div>
              <div className="stat-small">
                <span className="stat-number">{dynamicStats.avgTemp}°C</span>
                <span className="stat-label">Avg. Temp</span>
              </div>
              <div className="stat-small">
                <span className="stat-number">{dynamicStats.avgSalinity}</span>
                <span className="stat-label">Avg. Salinity</span>
              </div>
            </div>
          </div>

          {/* Daily Occurrences Chart */}
          <div className="ocean-data-section">
            <h3>Daily Occurrences</h3>
            <div className="ocean-chart-container">
              <svg viewBox="0 0 300 120" className="ocean-chart">
                <defs>
                  <linearGradient id="occurrenceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#4A90E2', stopOpacity:0.6}} />
                    <stop offset="100%" style={{stopColor:'#4A90E2', stopOpacity:0.1}} />
                  </linearGradient>
                  
                  {/* Grid pattern */}
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5"/>
                
                {/* Y-axis labels */}
                <text x="10" y="25" fontSize="10" fill="#999" textAnchor="middle">400</text>
                <text x="10" y="45" fontSize="10" fill="#999" textAnchor="middle">300</text>
                <text x="10" y="65" fontSize="10" fill="#999" textAnchor="middle">200</text>
                <text x="10" y="85" fontSize="10" fill="#999" textAnchor="middle">100</text>
                <text x="10" y="105" fontSize="10" fill="#999" textAnchor="middle">0</text>
                
                {/* Area fill */}
                <path d={areaData} fill="url(#occurrenceGradient)"/>
                
                {/* Line path */}
                <path d={pathData} stroke="#4A90E2" strokeWidth="2" fill="none"/>
                
                {/* Data points */}
                {points.map((point, index) => (
                  <g key={index}>
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r="3" 
                      fill="#4A90E2"
                      className="data-point"
                    />
                    {/* Hover tooltip */}
                    <circle 
                      cx={point.x} 
                      cy={point.y} 
                      r="8" 
                      fill="transparent"
                      className="data-point-hover"
                    >
                      <title>{`${dailyData[index].day}: ${point.occurrences} occurrences`}</title>
                    </circle>
                  </g>
                ))}
                
                {/* X-axis labels */}
                {dailyData.map((item, index) => {
                  const x = 20 + (index * 260) / (dailyData.length - 1);
                  return (
                    <text key={item.day} x={x} y="115" fontSize="10" fill="#666" textAnchor="middle">
                      {item.day}
                    </text>
                  );
                })}
              </svg>
              
              {/* Live indicator */}
              <div className="live-indicator">
                <span className="live-dot"></span>
                <span>Live Data</span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="summary-section">
            <h3>Summary</h3>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="card-icon">🌡️</div>
                <div className="card-content">
                  <span className="card-value">{dynamicStats.avgTemp}°C</span>
                  <span className="card-label">Temperature</span>
                </div>
              </div>
              
              <div className="summary-card primary">
                <div className="card-content">
                  <span className="card-value">{dynamicStats.avgDepth}m</span>
                  <span className="card-label">Avg Depth</span>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-content">
                  <span className="card-value">{dynamicStats.avgSalinity}</span>
                  <span className="card-label">Salinity</span>
                </div>
              </div>
              
              <div className="summary-card">
                <div className="card-content">
                  <span className="card-value">{dynamicStats.active}</span>
                  <span className="card-label">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="charts-section">
          <div className="charts-content">
            <h3>Data Visualization</h3>
            
            {/* Temperature Chart */}
            <div className="chart-container">
              <h4>Temperature Profile (°C)</h4>
              <svg viewBox="0 0 380 170" className="chart-svg">
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ff6b6b', stopOpacity:0.6}} />
                    <stop offset="100%" style={{stopColor:'#ff6b6b', stopOpacity:0.1}} />
                  </linearGradient>
                  {/* Grid pattern */}
                  <pattern id="tempGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect x="60" y="15" width="280" height="110" fill="url(#tempGrid)" opacity="0.5"/>
                
                {temperatureData.length > 0 && (() => {
                  const maxTemp = Math.max(...temperatureData);
                  const minTemp = Math.min(...temperatureData);
                  const tempRange = maxTemp - minTemp || 1;
                  const padding = 60;
                  const chartWidth = 280;
                  const chartHeight = 110;
                  
                  // Y-axis labels (Temperature values)
                  const yLabels = [];
                  for (let i = 0; i <= 5; i++) {
                    const value = maxTemp - (i * tempRange / 5);
                    const y = 15 + (i * chartHeight / 5);
                    yLabels.push({ value: value.toFixed(1), y });
                  }
                  
                  // X-axis labels (Float IDs)
                  const xLabels = temperatureData.map((_, index) => {
                    const x = padding + (index * chartWidth) / (temperatureData.length - 1);
                    return { label: `F${(index + 1).toString().padStart(3, '0')}`, x };
                  });
                  
                  const points = temperatureData.map((temp, index) => {
                    const x = padding + (index * chartWidth) / (temperatureData.length - 1);
                    const y = 15 + chartHeight - ((temp - minTemp) / tempRange) * chartHeight;
                    return { x, y, temp };
                  });
                  
                  const pathData = points.reduce((acc, point, index) => {
                    const command = index === 0 ? 'M' : 'L';
                    return `${acc} ${command} ${point.x} ${point.y}`;
                  }, '');
                  
                  const areaData = `${pathData} L ${points[points.length - 1].x} 125 L ${points[0].x} 125 Z`;
                  
                  return (
                    <>
                      {/* Y-axis */}
                      <line x1="60" y1="15" x2="60" y2="125" stroke="#666" strokeWidth="1"/>
                      {/* X-axis */}
                      <line x1="60" y1="125" x2="340" y2="125" stroke="#666" strokeWidth="1"/>
                      
                      {/* Y-axis labels */}
                      {yLabels.map((label, index) => (
                        <g key={index}>
                          <line x1="55" y1={label.y} x2="60" y2={label.y} stroke="#666" strokeWidth="1"/>
                          <text x="50" y={label.y + 3} fontSize="9" fill="#666" textAnchor="end">
                            {label.value}
                          </text>
                        </g>
                      ))}
                      
                      {/* X-axis labels */}
                      {xLabels.map((label, index) => (
                        <g key={index}>
                          <line x1={label.x} y1="125" x2={label.x} y2="130" stroke="#666" strokeWidth="1"/>
                          <text x={label.x} y="145" fontSize="9" fill="#666" textAnchor="middle">
                            {label.label}
                          </text>
                        </g>
                      ))}
                      
                      {/* Chart area and line */}
                      <path d={areaData} fill="url(#tempGradient)"/>
                      <path d={pathData} stroke="#ff6b6b" strokeWidth="2" fill="none"/>
                      
                      {/* Data points */}
                      {points.map((point, index) => (
                        <circle key={index} cx={point.x} cy={point.y} r="3" fill="#ff6b6b">
                          <title>{`Float ${index + 1}: ${point.temp.toFixed(1)}°C`}</title>
                        </circle>
                      ))}
                      
                      {/* Axis labels */}
                      <text x="200" y="165" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500">
                        Float ID
                      </text>
                      <text x="25" y="70" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500" transform="rotate(-90 25 70)">
                        Temperature (°C)
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Salinity Chart */}
            <div className="chart-container">
              <h4>Salinity Profile (PSU)</h4>
              <svg viewBox="0 0 380 170" className="chart-svg">
                <defs>
                  <linearGradient id="salinityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#4ecdc4', stopOpacity:0.6}} />
                    <stop offset="100%" style={{stopColor:'#4ecdc4', stopOpacity:0.1}} />
                  </linearGradient>
                  {/* Grid pattern */}
                  <pattern id="salinityGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect x="60" y="15" width="280" height="110" fill="url(#salinityGrid)" opacity="0.5"/>
                
                {salinityData.length > 0 && (() => {
                  const maxSal = Math.max(...salinityData);
                  const minSal = Math.min(...salinityData);
                  const salRange = maxSal - minSal || 1;
                  const padding = 60;
                  const chartWidth = 280;
                  const chartHeight = 110;
                  
                  // Y-axis labels (Salinity values)
                  const yLabels = [];
                  for (let i = 0; i <= 5; i++) {
                    const value = maxSal - (i * salRange / 5);
                    const y = 15 + (i * chartHeight / 5);
                    yLabels.push({ value: value.toFixed(1), y });
                  }
                  
                  // X-axis labels (Float IDs)
                  const xLabels = salinityData.map((_, index) => {
                    const x = padding + (index * chartWidth) / (salinityData.length - 1);
                    return { label: `F${(index + 1).toString().padStart(3, '0')}`, x };
                  });
                  
                  const points = salinityData.map((sal, index) => {
                    const x = padding + (index * chartWidth) / (salinityData.length - 1);
                    const y = 15 + chartHeight - ((sal - minSal) / salRange) * chartHeight;
                    return { x, y, sal };
                  });
                  
                  const pathData = points.reduce((acc, point, index) => {
                    const command = index === 0 ? 'M' : 'L';
                    return `${acc} ${command} ${point.x} ${point.y}`;
                  }, '');
                  
                  const areaData = `${pathData} L ${points[points.length - 1].x} 125 L ${points[0].x} 125 Z`;
                  
                  return (
                    <>
                      {/* Y-axis */}
                      <line x1="60" y1="15" x2="60" y2="125" stroke="#666" strokeWidth="1"/>
                      {/* X-axis */}
                      <line x1="60" y1="125" x2="340" y2="125" stroke="#666" strokeWidth="1"/>
                      
                      {/* Y-axis labels */}
                      {yLabels.map((label, index) => (
                        <g key={index}>
                          <line x1="55" y1={label.y} x2="60" y2={label.y} stroke="#666" strokeWidth="1"/>
                          <text x="50" y={label.y + 3} fontSize="9" fill="#666" textAnchor="end">
                            {label.value}
                          </text>
                        </g>
                      ))}
                      
                      {/* X-axis labels */}
                      {xLabels.map((label, index) => (
                        <g key={index}>
                          <line x1={label.x} y1="125" x2={label.x} y2="130" stroke="#666" strokeWidth="1"/>
                          <text x={label.x} y="145" fontSize="9" fill="#666" textAnchor="middle">
                            {label.label}
                          </text>
                        </g>
                      ))}
                      
                      {/* Chart area and line */}
                      <path d={areaData} fill="url(#salinityGradient)"/>
                      <path d={pathData} stroke="#4ecdc4" strokeWidth="2" fill="none"/>
                      
                      {/* Data points */}
                      {points.map((point, index) => (
                        <circle key={index} cx={point.x} cy={point.y} r="3" fill="#4ecdc4">
                          <title>{`Float ${index + 1}: ${point.sal.toFixed(1)} PSU`}</title>
                        </circle>
                      ))}
                      
                      {/* Axis labels */}
                      <text x="200" y="165" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500">
                        Float ID
                      </text>
                      <text x="25" y="70" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500" transform="rotate(-90 25 70)">
                        Salinity (PSU)
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Depth Chart */}
            <div className="chart-container">
              <h4>Depth Profile (meters)</h4>
              <svg viewBox="0 0 380 170" className="chart-svg">
                <defs>
                  <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#6c5ce7', stopOpacity:0.6}} />
                    <stop offset="100%" style={{stopColor:'#6c5ce7', stopOpacity:0.1}} />
                  </linearGradient>
                  {/* Grid pattern */}
                  <pattern id="depthGrid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {/* Grid background */}
                <rect x="60" y="15" width="280" height="110" fill="url(#depthGrid)" opacity="0.5"/>
                
                {depthData.length > 0 && (() => {
                  const maxDepth = Math.max(...depthData);
                  const minDepth = Math.min(...depthData);
                  const depthRange = maxDepth - minDepth || 1;
                  const padding = 60;
                  const chartWidth = 280;
                  const chartHeight = 110;
                  
                  // Y-axis labels (Depth values)
                  const yLabels = [];
                  for (let i = 0; i <= 5; i++) {
                    const value = maxDepth - (i * depthRange / 5);
                    const y = 15 + (i * chartHeight / 5);
                    yLabels.push({ value: Math.round(value), y });
                  }
                  
                  // X-axis labels (Float IDs)
                  const xLabels = depthData.map((_, index) => {
                    const x = padding + (index * chartWidth) / (depthData.length - 1);
                    return { label: `F${(index + 1).toString().padStart(3, '0')}`, x };
                  });
                  
                  const points = depthData.map((depth, index) => {
                    const x = padding + (index * chartWidth) / (depthData.length - 1);
                    const y = 15 + chartHeight - ((depth - minDepth) / depthRange) * chartHeight;
                    return { x, y, depth };
                  });
                  
                  const pathData = points.reduce((acc, point, index) => {
                    const command = index === 0 ? 'M' : 'L';
                    return `${acc} ${command} ${point.x} ${point.y}`;
                  }, '');
                  
                  const areaData = `${pathData} L ${points[points.length - 1].x} 125 L ${points[0].x} 125 Z`;
                  
                  return (
                    <>
                      {/* Y-axis */}
                      <line x1="60" y1="15" x2="60" y2="125" stroke="#666" strokeWidth="1"/>
                      {/* X-axis */}
                      <line x1="60" y1="125" x2="340" y2="125" stroke="#666" strokeWidth="1"/>
                      
                      {/* Y-axis labels */}
                      {yLabels.map((label, index) => (
                        <g key={index}>
                          <line x1="55" y1={label.y} x2="60" y2={label.y} stroke="#666" strokeWidth="1"/>
                          <text x="50" y={label.y + 3} fontSize="9" fill="#666" textAnchor="end">
                            {label.value}
                          </text>
                        </g>
                      ))}
                      
                      {/* X-axis labels */}
                      {xLabels.map((label, index) => (
                        <g key={index}>
                          <line x1={label.x} y1="125" x2={label.x} y2="130" stroke="#666" strokeWidth="1"/>
                          <text x={label.x} y="145" fontSize="9" fill="#666" textAnchor="middle">
                            {label.label}
                          </text>
                        </g>
                      ))}
                      
                      {/* Chart area and line */}
                      <path d={areaData} fill="url(#depthGradient)"/>
                      <path d={pathData} stroke="#6c5ce7" strokeWidth="2" fill="none"/>
                      
                      {/* Data points */}
                      {points.map((point, index) => (
                        <circle key={index} cx={point.x} cy={point.y} r="3" fill="#6c5ce7">
                          <title>{`Float ${index + 1}: ${point.depth}m`}</title>
                        </circle>
                      ))}
                      
                      {/* Axis labels */}
                      <text x="200" y="165" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500">
                        Float ID
                      </text>
                      <text x="25" y="70" fontSize="10" fill="#333" textAnchor="middle" fontWeight="500" transform="rotate(-90 25 70)">
                        Depth (m)
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
