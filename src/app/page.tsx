'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient/supabaseClient';

// Port interface and data
interface Port {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

const PORTS: Port[] = [
   { code: 'AEDXB', name: 'Dubai',                 lat: 25.2775,   lng: 55.2938 },

  // 2–6. China
  { code: 'CNGOU', name: 'Guangzhou',             lat: 23.1040,   lng: 113.2644 },
  { code: 'CNQDG', name: 'Qingdao',               lat: 36.0665,   lng: 120.3550 },
  { code: 'CNSHG', name: 'Shanghai (Waigaoqiao)', lat: 31.2285,   lng: 121.5537 },
  { code: 'CNSZD', name: 'Zhuhai',                lat: 22.2700,   lng: 113.5700 },
  { code: 'CNZOS', name: 'Zhanjiang',             lat: 21.2749,   lng: 110.3587 },

  // 7–11. Southeast Asia
  { code: 'THLCH', name: 'Laem Chabang',          lat: 13.1065,   lng: 100.9321 },
  { code: 'VNSGN', name: 'Ho Chi Minh City',      lat: 10.7626,   lng: 106.6602 },
  { code: 'IDPNK', name: 'Pontianak',             lat: -0.0262,   lng: 109.3425 },
  { code: 'IDPLM', name: 'Palembang',             lat: -2.9761,   lng: 104.7683 },
  { code: 'MYPKG', name: 'Port Klang',            lat: 3.0000,    lng: 101.4000 },

  // 12–16. East Asia
  { code: 'JPTKO', name: 'Tokyo (Tateyama)',      lat: 35.0478,   lng: 139.8584 },
  { code: 'JPPMI', name: 'Port of Kobe',          lat: 34.6753,   lng: 135.1675 },
  { code: 'KRPUS', name: 'Busan',                 lat: 35.0500,   lng: 129.0756 },
  { code: 'ROCTS', name: 'Constanța',             lat: 44.1733,   lng: 28.6383 }, // Note: moved to Europe list but included here temporarily
  { code: 'HKHKG', name: 'Hong Kong (Hutchison)', lat: 22.3080,   lng: 114.1708 },

  // 17–21. South Asia
  { code: 'INNSA', name: 'Nhava Sheva (Mumbai)',  lat: 18.9443,   lng: 72.8357 },
  { code: 'INMAA', name: 'Chennai',               lat: 13.0827,   lng: 80.2921 },
  { code: 'INEGD', name: 'Ennore',                lat: 13.2867,   lng: 80.3231 },
  { code: 'INVTZ', name: 'Visakhapatnam',         lat: 17.7041,   lng: 83.2870 },
  { code: 'INCOK', name: 'Kochi',                 lat: 9.9312,    lng: 76.2673 },

  // 22–25. Middle East
  { code: 'AEJEA', name: 'Jebel Ali',             lat: 25.0665,   lng: 55.1227 },
  { code: 'SAJED', name: 'Jeddah Islamic',        lat: 21.5725,   lng: 39.1276 },
  { code: 'OMSOH', name: 'Salalah',               lat: 17.0200,   lng: 54.0720 },
  { code: 'IRBDH', name: 'Bandar Abbas',          lat: 27.1964,   lng: 56.2828 },

 { code: 'NLRTM', name: 'Rotterdam',         lat: 51.9475,  lng:   4.1420 },
  { code: 'DEHAM', name: 'Hamburg',           lat: 53.5396,  lng:   9.8924 },
  { code: 'BEANR', name: 'Antwerp',           lat: 51.2602,  lng:   4.3698 },
  { code: 'ESALG', name: 'Algeciras',         lat: 36.1284,  lng:  -5.4596 },
  { code: 'FRLEH', name: 'Le Havre',          lat: 49.4936,  lng:   0.1079 },
  { code: 'GBSOU', name: 'Southampton',       lat: 50.9097,  lng:  -1.4048 },
  { code: 'FRMRS', name: 'Marseille',         lat: 43.2965,  lng:   5.3698 },
  { code: 'GRPIR', name: 'Piraeus',           lat: 37.9415,  lng:  23.6523 },
  { code: 'ESPVQ', name: 'Valencia',          lat: 39.4699,  lng:  -0.3763 },
  { code: 'ESBCN', name: 'Barcelona',         lat: 41.3851,  lng:   2.1734 },
  { code: 'GBFXT', name: 'Felixstowe',        lat: 51.9630,  lng:   1.3120 },
  { code: 'DEBRE', name: 'Bremerhaven',       lat: 53.5400,  lng:   8.5800 },

  // North America
  { code: 'USLAX', name: 'Los Angeles',       lat: 33.7361,  lng: -118.2641 },
  { code: 'USLGB', name: 'Long Beach',        lat: 33.7542,  lng: -118.2168 },
  { code: 'USNYC', name: 'New York/New Jersey', lat: 40.6413, lng: -74.0141 },
  { code: 'USSAV', name: 'Savannah',          lat: 32.0809,  lng:  -81.0912 },
  { code: 'USSEA', name: 'Seattle',           lat: 47.6019,  lng: -122.3345 },
  { code: 'USOAK', name: 'Oakland',           lat: 37.8044,  lng: -122.2711 },
  { code: 'USHOU', name: 'Houston',           lat: 29.7629,  lng:  -95.3833 },
  { code: 'USCHS', name: 'Charleston',        lat: 32.7877,  lng:  -79.9407 },
  { code: 'CACVX', name: 'Vancouver',         lat: 49.2827,  lng: -123.1207 },

  // South America
  { code: 'PECLL', name: 'Callao',            lat: -12.0500, lng:  -77.1667 },
  { code: 'BRSNT', name: 'Santos',            lat: -23.9537, lng:  -46.3335 },
  { code: 'ARBUE', name: 'Buenos Aires',      lat: -34.6037, lng:  -58.3816 },
  { code: 'UYMVD', name: 'Montevideo',        lat: -34.9011, lng:  -56.1645 },
  { code: 'CLVAP', name: 'Valparaíso',        lat: -33.0472, lng:  -71.6127 },

  // Africa
  { code: 'EGALY', name: 'Alexandria',        lat: 31.2001,  lng:   29.9187 },
  { code: 'TZDAR', name: 'Dar es Salaam',     lat:  6.7924,  lng:   39.2083 },
  { code: 'KEMBA', name: 'Mombasa',           lat:  4.0435,  lng:   39.6682 },
  { code: 'NGAPP', name: 'Apapa (Lagos)',     lat:  6.4500,  lng:    3.4000 },
  { code: 'MZBEW', name: 'Beira',             lat: -19.8432, lng:   34.8385 },

  // 1–2. China
  { code: 'CNDLC', name: 'Dalian',             lat: 38.9140,   lng: 121.6147 },
  { code: 'CNTJN', name: 'Tianjin',            lat: 39.0136,   lng: 117.7133 },

  // 3–4. Japan
  { code: 'JPOSA', name: 'Osaka',              lat: 34.6544,   lng: 135.4495 },
  { code: 'JPNGA', name: 'Nagoya',             lat: 35.1167,   lng: 136.9333 },

  // 5–7. South Asia
  { code: 'INMUN', name: 'Mundra',             lat: 23.8340,   lng: 70.0385 },
  { code: 'BDBCG', name: 'Chittagong',         lat: 22.3569,   lng: 91.7832 },
  { code: 'PJKAR', name: 'Karachi',            lat: 24.8500,   lng: 66.9900 },

  // 8–9. Southeast Asia
  { code: 'MYPEN', name: 'Penang',             lat: 5.4298,    lng: 100.3292 },
  { code: 'THBKK', name: 'Bangkok',            lat: 13.7133,   lng: 100.4860 },

  // 10–12. Middle East
  { code: 'QTHMD', name: 'Hamad (Doha)',       lat: 25.2713,   lng: 51.5877 },
  { code: 'BHKFU', name: 'Khalifa (Abu Dhabi)',lat: 24.4345,   lng: 54.6172 },
  { code: 'SADMM', name: 'Dammam',             lat: 26.4686,   lng: 50.1125 },

  // 13–15. Oceania
  { code: 'AUNWS', name: 'Newcastle',          lat: -32.9167,  lng: 151.7500 },
  { code: 'AUPAD', name: 'Port Adelaide',      lat: -34.8361,  lng: 138.5170 },
  { code: 'AUBNE', name: 'Brisbane',           lat: -27.4679,  lng: 153.0235 },

  // 16–17. New Zealand
  { code: 'NZAKL', name: 'Auckland',           lat: -36.8485,  lng: 174.7633 },
  { code: 'NZWLG', name: 'Wellington',         lat: -41.2865,  lng: 174.7762 },

  // 18–19. Europe
  { code: 'ITGOA', name: 'Genoa',              lat: 44.4056,   lng: 8.9463 },
  { code: 'ITVCE', name: 'Venice',             lat: 45.4408,   lng: 12.3155 },

  // 20. Portugal
  { code: 'PTLIS', name: 'Lisbon',             lat: 38.7223,   lng: -9.1393 },

  // 21. Canada
  { code: 'CAYHZ', name: 'Halifax',            lat: 44.6488,   lng: -63.5752 },

  // 22–23. South America
  { code: 'VEPCB', name: 'Puerto Cabello',     lat: 10.4742,   lng: -68.0147 },
  { code: 'COBUN', name: 'Buenaventura',       lat: 3.8792,    lng: -77.0312 },

  // 24–25. Africa
  { code: 'ZACPT', name: 'Cape Town',          lat: -33.9249,  lng: 18.4241 },
  { code: 'TNRDS', name: 'Rades',              lat: 36.7867,   lng: 10.2669 },

  // 1. Philippines
  { code: 'PHMNL', name: 'Manila',               lat: 14.5995,   lng: 120.9842 },

  // 2. Indonesia
  { code: 'IDSUB', name: 'Surabaya',             lat: -7.2575,   lng: 112.7521 },

  // 3. Malaysia
  { code: 'MYTPP', name: 'Tanjung Pelepas',      lat: 1.3570,    lng: 103.5850 },

  // 4–6. South Korea & Taiwan
  { code: 'KRINC', name: 'Incheon',              lat: 37.4563,   lng: 126.7052 },
  { code: 'TWKHH', name: 'Kaohsiung',            lat: 22.6163,   lng: 120.3133 },
  { code: 'TWKEL', name: 'Keelung',              lat: 25.1276,   lng: 121.7418 },

  // 7–13. Europe
  { code: 'ESBIO', name: 'Bilbao',               lat: 43.2625,   lng: -2.9253 },
  { code: 'NLAMS', name: 'Amsterdam',            lat: 52.3300,   lng: 4.8900  },
  { code: 'DEWVN', name: 'Wilhelmshaven',        lat: 53.5297,   lng: 8.1139  },
  { code: 'ITNAP', name: 'Naples',               lat: 40.8359,   lng: 14.2488 },
  { code: 'BEZEE', name: 'Zeebrugge',            lat: 51.3289,   lng: 3.1970  },
  { code: 'GRSKG', name: 'Thessaloniki',         lat: 40.6401,   lng: 22.9444 },
  { code: 'PTSIN', name: 'Sines',                lat: 37.9529,   lng: -8.8633 },

  // 14–20. North America & Caribbean
  { code: 'USMIA', name: 'Miami',                lat: 25.7617,   lng: -80.1918 },
  { code: 'USJAX', name: 'Jacksonville',         lat: 30.3322,   lng: -81.6557 },
  { code: 'USMSY', name: 'New Orleans',          lat: 29.9511,   lng: -90.0715 },
  { code: 'PRSJU', name: 'San Juan',             lat: 18.4655,   lng: -66.1057 },
  { code: 'PANBAL',name: 'Balboa (Panama)',      lat: 8.9543,    lng: -79.5486 },
  { code: 'ARBHI', name: 'Bahía Blanca',         lat: -38.7196,  lng: -62.2718 },
  { code: 'CLANF', name: 'Antofagasta',          lat: -23.6500,  lng: -70.4000 },

  // 21–25. Africa
  { code: 'COCTG', name: 'Cartagena',            lat: 10.3910,   lng: -75.4794 },
  { code: 'SNDKR', name: 'Dakar',                lat: 14.7167,   lng: -17.4677 },
  { code: 'CIABJ', name: 'Abidjan',              lat: 5.3453,    lng: -4.0244  },
  { code: 'CMDLA', name: 'Douala',               lat: 4.0511,    lng: 9.7679   },
  { code: 'ZAPEL', name: 'Port Elizabeth',       lat: -33.9666,  lng: 25.6107  },
];


interface Waypoint {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export default function NewRoutePage() {
  const [name, setName] = useState('');
  const [waypoints, setWaypoints] = useState<Waypoint[]>([{ code: '', name: '', lat: 0, lng: 0 }]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>(['']);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const handlePortSelect = (index: number, port: Port) => {
    const updated = [...waypoints];
    updated[index] = {
      code: port.code,
      name: port.name,
      lat: port.lat,
      lng: port.lng
    };
    setWaypoints(updated);

    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = '';
    setSearchTerms(updatedSearchTerms);
    setActiveDropdown(null);
  };

  const handleSearchChange = (index: number, value: string) => {
    const updatedSearchTerms = [...searchTerms];
    updatedSearchTerms[index] = value;
    setSearchTerms(updatedSearchTerms);
    setActiveDropdown(value ? index : null);
  };

  const getFilteredPorts = (searchTerm: string) => {
    if (!searchTerm) return PORTS.slice(0, 10); // Show first 10 ports when no search
    
    return PORTS.filter(port =>
      port.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      port.code.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8); // Limit to 8 results
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, { code: '', name: '', lat: 0, lng: 0 }]);
    setSearchTerms([...searchTerms, '']);
  };

  const removeWaypoint = (index: number) => {
    if (waypoints.length > 1) {
      setWaypoints(waypoints.filter((_, i) => i !== index));
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
    }
  };

  async function handleCreate() {
    if (!name.trim()) {
      alert('Please enter a route name');
      return;
    }
    
    if (waypoints.some(wp => !wp.code.trim())) {
      alert('Please select all ports');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: route } = await supabase
        .from('routes')
        .insert({ name })
        .select('id')
        .single();

      if (route) {
        await Promise.all(
          waypoints.map((wp, idx) =>
            supabase.from('waypoints').insert({
              route_id: route.id,
              sequence: idx + 1,
              port_code: wp.code,
              lat: wp.lat,
              lng: wp.lng,
            })
          )
        );
        
        // Reset form
        setName('');
        setWaypoints([{ code: '', name: '', lat: 0, lng: 0 }]);
        setSearchTerms(['']);
        
        alert('Route created successfully!');
        fetchRoutes();
      }
    } catch (error) {
      alert('Error creating route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false });
    setRoutes(data || []);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🚢 Smart Marine Route Planner</h1>
          <p className="text-gray-600">Create and manage your marine routes with intelligent port selection</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Route Creation Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">+</span>
              Create New Route
            </h2>

            {/* Route Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="Enter route name (e.g., Asia-Europe Express Route)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Waypoints Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Select Ports</label>
              <div className="space-y-4">
                {waypoints.map((wp, i) => (
                  <div key={i} className="relative">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-semibold">
                        {i + 1}
                      </div>
                      
                      {/* Port Selection */}
                      <div className="flex-1 relative">
                        {wp.code ? (
                          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2">
                            <div>
                              <span className="font-semibold text-blue-600">{wp.code}</span>
                              <span className="text-gray-600 ml-2">{wp.name}</span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = [...waypoints];
                                updated[i] = { code: '', name: '', lat: 0, lng: 0 };
                                setWaypoints(updated);
                              }}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Search for a port..."
                              value={searchTerms[i] || ''}
                              onChange={e => handleSearchChange(i, e.target.value)}
                              onClick={e => {
                                e.stopPropagation();
                                setActiveDropdown(i);
                              }}
                            />
                            
                            {/* Dropdown */}
                            {activeDropdown === i && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredPorts(searchTerms[i] || '').map((port) => (
                                  <button
                                    key={port.code}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handlePortSelect(i, port);
                                    }}
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <div className="font-semibold text-blue-600">{port.code}</div>
                                        <div className="text-sm text-gray-600">{port.name}</div>
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {port.lat.toFixed(2)}, {port.lng.toFixed(2)}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {getFilteredPorts(searchTerms[i] || '').length === 0 && (
                                  <div className="px-4 py-3 text-gray-500 text-center">
                                    No ports found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {waypoints.length > 1 && (
                        <button
                          onClick={() => removeWaypoint(i)}
                          className="w-8 h-8 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center transition-colors"
                          title="Remove waypoint"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                onClick={addWaypoint}
              >
                <span className="mr-2">+</span>
                Add Port
              </button>
              
              <button
                onClick={handleCreate}
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🚢</span>
                    Create Route
                  </>
                )}
              </button>
            </div>

            {/* Route Preview */}
            {waypoints.some(wp => wp.code) && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🗺️ Route Preview</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {waypoints.map((wp, i) => (
                    <React.Fragment key={i}>
                      {wp.code && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {wp.code}
                        </span>
                      )}
                      {i < waypoints.length - 1 && wp.code && waypoints[i + 1]?.code && (
                        <span className="text-blue-400">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Routes */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-green-100 text-green-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">📋</span>
              Saved Routes
            </h2>

            {routes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚢</div>
                <p className="text-gray-500 text-lg">No routes created yet</p>
                <p className="text-gray-400 text-sm">Create your first route to get started</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {routes.map((route, index) => (
                  <Link
                    key={route.id}
                    href={`/routes/${route.id}`}
                    className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg border border-blue-100 hover:border-blue-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3 group-hover:bg-blue-600 transition-colors">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {route.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Created {new Date(route.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}