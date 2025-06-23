import React, { useState } from 'react';
import {
  AlertTriangle,
  Anchor,
  Cloud,
  Eye,
  Thermometer,
  Wind,
  Droplets,
  Snowflake,
  Shield,
  MapPin,
  Navigation,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

type Port = {
  port_code: string;
  temperature: number;
  wind_speed: number;
  visibility_m: number;
  cloud_coverage_pct: number;
  rain_mm: number;
  snow_mm: number;
  condition: string;
  geopolitical_risk: string;
  pirate_risk: string;
  war_risk: string;
  sailing_advice: string;
  stopover: boolean;
};

type Route = {
  route_name: string;
  ports: Port[];
  total_distance_km: number;
  final_advice: string;
};

type DashboardData = {
  primary_route: Route;
  alternate_routes: Route[];
  recommendation: string;
};

type RouteDashboardProps = {
  data: DashboardData | null;
};

const RouteDashboard: React.FC<RouteDashboardProps> = ({ data }) => {
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({});

  if (!data) {
    return (
      <div className="flex items-center justify-center p-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-gray-500 text-lg">No route data available</div>
          <div className="text-gray-400 text-sm mt-2">Please analyze a route to see detailed information</div>
        </div>
      </div>
    );
  }

  const toggleRouteExpansion = (routeId: string) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [routeId]: !prev[routeId]
    }));
  };

  const getRiskColor = (risk: string): string => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getAdviceColor = (advice: string): string => {
    switch (advice?.toLowerCase()) {
      case 'safe': return 'text-green-700 bg-green-100 border-green-300';
      case 'delay': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'reroute': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getAdviceIcon = (advice: string) => {
    switch (advice?.toLowerCase()) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'delay': return <AlertCircle className="w-4 h-4" />;
      case 'reroute': return <XCircle className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getRouteGradient = (routeName: string, isRecommended: boolean): string => {
    if (isRecommended) return 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300';
    if (routeName?.includes('Alternative 1')) return 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300';
    if (routeName?.includes('Alternative 2')) return 'bg-gradient-to-br from-purple-50 to-violet-100 border-purple-300';
    if (routeName?.includes('Alternative 3')) return 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300';
    if (routeName?.includes('Alternative 4')) return 'bg-gradient-to-br from-pink-50 to-rose-100 border-pink-300';
    return 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300';
  };

  const getWeatherTrend = (temp: number) => {
    if (temp > 25) return { icon: <TrendingUp className="w-4 h-4 text-red-500" />, label: 'Hot' };
    if (temp < 10) return { icon: <TrendingDown className="w-4 h-4 text-blue-500" />, label: 'Cold' };
    return { icon: <Minus className="w-4 h-4 text-green-500" />, label: 'Moderate' };
  };

  const getWindStrength = (speed: number) => {
    if (speed > 15) return { color: 'text-red-600', label: 'Strong' };
    if (speed > 8) return { color: 'text-yellow-600', label: 'Moderate' };
    return { color: 'text-green-600', label: 'Light' };
  };

  // Define RouteCard inside the component, but give it typed props
  const RouteCard: React.FC<{ route: Route; isRecommended: boolean; routeIndex: number }> = ({
    route,
    isRecommended,
    routeIndex
  }) => {
    const routeId = `route-${routeIndex}`;
    const isExpanded = expandedRoutes[routeId] !== false;

    return (
      <div className={`rounded-xl border-2 p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${getRouteGradient(route.route_name, isRecommended)}`}>
        {/* Route Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isRecommended ? 'bg-blue-200' : 'bg-white'} shadow-sm`}>
              <Anchor className={`w-6 h-6 ${isRecommended ? 'text-blue-700' : 'text-gray-700'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {route.route_name}
                {isRecommended && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
              </h3>
              <p className="text-sm text-gray-600">{route.ports?.length || 0} ports along this route</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isRecommended && (
              <span className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-full shadow-md">
                ⭐ Recommended
              </span>
            )}
            <button
              onClick={() => toggleRouteExpansion(routeId)}
              className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Route Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Distance</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{route.total_distance_km?.toLocaleString() || 'N/A'} km</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-700">Est. Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {route.total_distance_km ? Math.ceil(route.total_distance_km / 500) : 'N/A'} days
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {getAdviceIcon(route.final_advice)}
              <span className="font-semibold text-gray-700">Status</span>
            </div>
            <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-bold rounded-full border ${getAdviceColor(route.final_advice)}`}>
              {route.final_advice?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Expandable Port Details */}
        {isExpanded && (
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Port-by-Port Analysis</h4>
              <span className="text-sm text-gray-500">{route.ports?.length || 0} waypoints</span>
            </div>
            
            {route.ports?.map((port, idx) => (
              <div key={idx} className="bg-white rounded-lg p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Port Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className="font-bold text-xl text-gray-800">{port.port_code}</h5>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Port {idx + 1} of {route.ports.length}</span>
                        {port.stopover && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Stopover
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-medium text-red-700">Temperature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-800">{port.temperature}°C</span>
                      {getWeatherTrend(port.temperature).icon}
                    </div>
                    <span className="text-xs text-gray-600">{getWeatherTrend(port.temperature).label}</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Wind className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Wind Speed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-800">{port.wind_speed} m/s</span>
                    </div>
                    <span className={`text-xs ${getWindStrength(port.wind_speed).color}`}>
                      {getWindStrength(port.wind_speed).label}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Visibility</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {port.visibility_m > 1000 ? `${(port.visibility_m/1000).toFixed(1)}km` : `${port.visibility_m}m`}
                    </div>
                    <span className="text-xs text-gray-600">
                      {port.visibility_m > 5000 ? 'Excellent' : port.visibility_m > 1000 ? 'Good' : 'Limited'}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700">Cloud Cover</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{port.cloud_coverage_pct}%</div>
                    <span className="text-xs text-gray-600">
                      {port.cloud_coverage_pct < 25 ? 'Clear' : port.cloud_coverage_pct < 75 ? 'Partly Cloudy' : 'Overcast'}
                    </span>
                  </div>
                </div>

                {/* Precipitation */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700">Rainfall</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{port.rain_mm} mm/hr</div>
                    <span className="text-xs text-gray-600">
                      {port.rain_mm === 0 ? 'No rain' : port.rain_mm < 2.5 ? 'Light rain' : port.rain_mm < 10 ? 'Moderate rain' : 'Heavy rain'}
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Snowflake className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-medium text-slate-700">Snowfall</span>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{port.snow_mm} mm/hr</div>
                    <span className="text-xs text-gray-600">
                      {port.snow_mm === 0 ? 'No snow' : 'Active snowfall'}
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-5 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span className="font-semibold text-indigo-800">Current Conditions</span>
                  </div>
                  <p className="text-gray-700 capitalize text-lg">{port.condition}</p>
                </div>

                {/* Risk Assessment */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Geopolitical Risk</div>
                    <span className={`px-3 py-2 text-xs font-bold rounded-lg border ${getRiskColor(port.geopolitical_risk)}`}>
                      {port.geopolitical_risk?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2 font-medium">Piracy Risk</div>
                    <span className={`px-3 py-2 text-xs font-bold rounded-lg border ${getRiskColor(port.pirate_risk)}`}>
                      {port.pirate_risk?.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2 font-medium">War Risk</div>
                    <span className={`px-3 py-2 text-xs font-bold rounded-lg border ${getRiskColor(port.war_risk)}`}>
                      {port.war_risk?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Sailing Advice */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-800 mb-2">Navigation Advisory</div>
                      <p className="text-gray-700 leading-relaxed">{port.sailing_advice}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Prepare all routes for display
  const allRoutes = [];
  if (data.primary_route) {
    allRoutes.push({ ...data.primary_route, isPrimary: true });
  }
  if (data.alternate_routes) {
    allRoutes.push(...data.alternate_routes.map(route => ({ ...route, isPrimary: false })));
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Navigation className="w-8 h-8" />
          <h2 className="text-4xl font-bold">Maritime Route Analysis</h2>
        </div>
        <p className="text-blue-100 text-lg">Comprehensive weather conditions and strategic route recommendations</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Real-time Weather Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Risk Assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>AI-Powered Analysis</span>
          </div>
        </div>
      </div>

      {/* Enhanced Recommendation Banner */}
      {data.recommendation && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-400">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1">Strategic Route Recommendation</h3>
              <p className="text-orange-100 text-lg">{data.recommendation}</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-sm text-orange-200">Based on</div>
              <div className="font-semibold">Weather • Risk • Efficiency</div>
            </div>
          </div>
        </div>
      )}

      {/* Routes Display */}
      <div className="space-y-8">
        {allRoutes.map((route, idx) => {
          const isRecommended = data.recommendation?.includes(route.route_name) || 
                               (route.isPrimary && data.recommendation?.includes('Primary'));
          
          return (
            <RouteCard 
              key={`route-${idx}`}
              route={route} 
              isRecommended={isRecommended}
              routeIndex={idx}
            />
          );
        })}
      </div>

      {/* Enhanced Legend */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-8 border border-gray-200 shadow-sm">
        <h4 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          Risk Assessment Guide
        </h4>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Low Risk
            </h5>
            <div className="text-sm text-gray-600 leading-relaxed">
              Minimal safety concerns. Normal operational procedures recommended. 
              Weather conditions are favorable for maritime operations.
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Medium Risk
            </h5>
            <div className="text-sm text-gray-600 leading-relaxed">
              Heightened awareness required. Additional safety measures recommended. 
              Monitor conditions closely and prepare contingency plans.
            </div>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              High Risk
            </h5>
            <div className="text-sm text-gray-600 leading-relaxed">
              Significant safety concerns. Consider route alternatives. 
              Enhanced security protocols and weather monitoring essential.
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-300">
          <div className="text-sm text-gray-500 text-center">
            Risk assessments are based on current weather data, geopolitical intelligence, 
            and maritime security reports. Conditions may change rapidly.
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDashboard;