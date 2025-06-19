import React from 'react';
import { AlertTriangle, Anchor, Cloud, Eye, Thermometer, Wind, Droplets, Snowflake, Shield, MapPin } from 'lucide-react';

const RouteDashboard = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">No route data available</div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAdviceColor = (advice) => {
    switch (advice?.toLowerCase()) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'delay': return 'text-yellow-600 bg-yellow-100';
      case 'reroute': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationColor = (recommendation) => {
    if (recommendation?.includes('Primary')) return 'border-blue-500 bg-blue-50';
    if (recommendation?.includes('Alternative 1')) return 'border-green-500 bg-green-50';
    if (recommendation?.includes('Alternative 2')) return 'border-purple-500 bg-purple-50';
    return 'border-gray-500 bg-gray-50';
  };

  const RouteCard = ({ route, isRecommended = false }) => (
    <div className={`rounded-lg border-2 p-6 ${isRecommended ? getRecommendationColor(data.recommendation) : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Anchor className="w-5 h-5" />
          {route.route_name}
        </h3>
        {isRecommended && (
          <span className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded-full">
            Recommended
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Distance: {route.total_distance_km} km</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAdviceColor(route.final_advice)}`}>
            {route.final_advice?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {route.ports?.map((port, idx) => (
          <div key={idx} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg text-gray-800">{port.port_code}</h4>
              <div className="flex items-center gap-2">
                {port.stopover && (
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Stopover
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-sm">{port.temperature}°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-500" />
                <span className="text-sm">{port.wind_speed} m/s</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{port.visibility_m}m</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{port.cloud_coverage_pct}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Rain: {port.rain_mm} mm</span>
              </div>
              <div className="flex items-center gap-2">
                <Snowflake className="w-4 h-4 text-blue-200" />
                <span className="text-sm">Snow: {port.snow_mm} mm</span>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Condition: </span>
              <span className="text-sm text-gray-600">{port.condition}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Geopolitical</div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(port.geopolitical_risk)}`}>
                  {port.geopolitical_risk}
                </span>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Piracy</div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(port.pirate_risk)}`}>
                  {port.pirate_risk}
                </span>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">War</div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(port.war_risk)}`}>
                  {port.war_risk}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-1">Sailing Advice:</div>
                  <div className="text-sm text-gray-600">{port.sailing_advice}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Maritime Route Analysis</h2>
        <p className="text-gray-600">Weather conditions and route recommendations</p>
      </div>

      {/* Recommendation Banner */}
      {data.recommendation && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Route Recommendation</h3>
              <p className="text-blue-100">{data.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary Route */}
      {data.primary_route && (
        <div>
          <RouteCard 
            route={data.primary_route} 
            isRecommended={data.recommendation?.includes('Primary')} 
          />
        </div>
      )}

      {/* Alternative Routes */}
      {data.alternate_routes && data.alternate_routes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Alternative Routes</h3>
          {data.alternate_routes.map((route, idx) => (
            <RouteCard 
              key={idx} 
              route={route} 
              isRecommended={data.recommendation?.includes(`Alternative ${idx + 1}`)} 
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-3">Risk Level Legend</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded text-green-600 bg-green-100">Low</span>
            <span className="text-gray-600">Minimal risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded text-yellow-600 bg-yellow-100">Medium</span>
            <span className="text-gray-600">Moderate caution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium rounded text-red-600 bg-red-100">High</span>
            <span className="text-gray-600">Significant risk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDashboard;