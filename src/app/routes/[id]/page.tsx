'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient/supabaseClient';
import { getWeather } from '@/lib/weather/weather';
import { analyzeWeather } from '@/lib/analyzeWeather/analyzeWeather';
import { useParams, useRouter } from 'next/navigation';

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [routeName, setRouteName] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingWaypoint, setCheckingWaypoint] = useState<string>('');

  useEffect(() => {
    if (!id) return;

    (async () => {
      // Fetch route name
      const { data: routeData } = await supabase
        .from('routes')
        .select('name')
        .eq('id', id)
        .single();

      if (routeData) {
        setRouteName(routeData.name);
      }

      // Fetch waypoints
      const { data, error } = await supabase
        .from('waypoints')
        .select('*')
        .eq('route_id', id)
        .order('sequence');

      if (error) {
        console.error('❌ Failed to fetch waypoints:', error.message);
      }

      setWaypoints(data || []);
    })();
  }, [id]);

  async function handleCheckRouteWeather() {
    console.log('✅ Button clicked');

    const newLogs: string[] = [];
    setLoading(true);

    try {
      for (const wp of waypoints) {
        setCheckingWaypoint(wp.port_code);
        console.log('📍 Checking weather for:', wp.port_code);

        const weather = await getWeather(wp.lat, wp.lng);
        console.log('🌤️ Weather data:', weather);

        const advice = await analyzeWeather({
          code: wp.port_code,
          lat: wp.lat,
          lon: wp.lng
        });
        console.log('🧠 LLM Advice:', advice);

        await supabase.from('checks').insert({
          route_id: id,
          waypoint_id: wp.id,
          weather,
          breach: advice !== 'OK',
          advice,
        });

        newLogs.push(`${wp.port_code}: ${advice}`);
      }

      setLogs(newLogs);
    } catch (err) {
      console.error('🔥 Error in handleCheckWeather:', err);
    } finally {
      setLoading(false);
      setCheckingWaypoint('');
    }
  }

  const hasIssues = logs.some(log =>
    log.includes('Divert') || log.includes('⚠️') || log.toLowerCase().includes('avoid')
  );

  const getStatusIcon = (log: string) => {
    if (log.includes('Divert') || log.includes('⚠️') || log.toLowerCase().includes('avoid')) {
      return '⚠️';
    }
    return '✅';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Routes
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🌤️ Weather Check</h1>
            <p className="text-xl text-gray-600 font-medium">{routeName || 'Route Analysis'}</p>
          </div>
        </div>

        {waypoints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📍</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Waypoints Found</h2>
            <p className="text-gray-500">This route doesn't have any waypoints configured.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Waypoints Overview */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">📍</span>
                Route Waypoints ({waypoints.length})
              </h2>
              
              <div className="grid gap-4 mb-8">
                {waypoints.map((wp, index) => (
                  <div key={wp.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full text-sm font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{wp.port_code}</h3>
                      <p className="text-sm text-gray-500">
                        Lat: {wp.lat.toFixed(4)}, Lng: {wp.lng.toFixed(4)}
                      </p>
                    </div>
                    {checkingWaypoint === wp.port_code && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        <span className="text-sm font-medium">Checking...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={handleCheckRouteWeather}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Checking Weather for {checkingWaypoint || 'Route'}...
                  </>
                ) : (
                  <>
                    <span className="mr-3">🌤️</span>
                    Check Weather Conditions
                  </>
                )}
              </button>
            </div>

            {/* Weather Results */}
            {logs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">📊</span>
                  Weather Analysis Results
                </h2>

                <div className="space-y-4 mb-8">
                  {logs.map((log, i) => {
                    const isIssue = log.includes('Divert') || log.includes('⚠️') || log.toLowerCase().includes('avoid');
                    const portCode = log.split(':')[0];
                    const message = log.split(':').slice(1).join(':').trim();
                    
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border-l-4 ${
                          isIssue
                            ? 'bg-red-50 border-red-400 text-red-800'
                            : 'bg-green-50 border-green-400 text-green-800'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`text-2xl mr-3 ${isIssue ? 'text-red-500' : 'text-green-500'}`}>
                            {getStatusIcon(log)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{portCode}</h3>
                            <p className="whitespace-pre-line leading-relaxed">{message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Route Summary */}
                <div className={`p-6 rounded-xl border-2 ${
                  hasIssues 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <span className="mr-3 text-2xl">🧭</span>
                    Route Summary
                  </h3>
                  
                  {hasIssues ? (
                    <div>
                      <p className="text-red-700 font-medium text-lg mb-4 flex items-center">
                        <span className="mr-2">⚠️</span>
                        Weather issues detected on this route. Immediate attention required.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                          onClick={() => router.push(`/reroute?route_id=${id}`)}
                        >
                          <span className="mr-2">🔄</span>
                          Suggest Alternate Route
                        </button>
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                          onClick={() => window.print()}
                        >
                          <span className="mr-2">📄</span>
                          Generate Report
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-green-700 font-medium text-lg mb-4 flex items-center">
                        <span className="mr-2">✅</span>
                        All waypoints show favorable conditions. Route is clear for departure.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                          onClick={() => alert('Flight plan approved!')}
                        >
                          <span className="mr-2">✈️</span>
                          Approve Shipping Plan
                        </button>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                          onClick={() => window.print()}
                        >
                          <span className="mr-2">📄</span>
                          Print Summary
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}