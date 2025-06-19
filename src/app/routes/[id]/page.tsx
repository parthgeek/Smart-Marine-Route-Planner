"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient/supabaseClient";
import { getWeather } from "@/lib/weather/weather";
import { analyzeWeather } from "@/lib/analyzeWeather/analyzeWeather";
import RouteDashboard from "@/components/RouteDashboard";

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const [routeName, setRouteName] = useState("");
  const [waypoints, setWaypoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data: routeData } = await supabase
        .from("routes")
        .select("name")
        .eq("id", id)
        .single();

      if (routeData) {
        setRouteName(routeData.name);
      }

      const { data, error } = await supabase
        .from("waypoints")
        .select("*")
        .eq("route_id", id)
        .order("sequence");

      if (!error && data) {
        setWaypoints(data);
      }
    })();
  }, [id]);

  async function handleCheckRouteWeather() {
  
    setLoading(true);
  try {
    // ✅ Validate and build clean list of ports
    const routePorts = waypoints
      .filter(wp => wp.port_code && typeof wp.lat === 'number' && typeof wp.lng === 'number')
      .map(wp => ({
        code: wp.port_code,
        lat: wp.lat,
        lon: wp.lng
      }));

    if (routePorts.length === 0) {
      console.error("❌ No valid waypoints to analyze.");
      setDashboardData(null);
      return;
    }

    // ✅ Call OpenAI-backed analysis
    const aiResponse = await analyzeWeather({ ports: routePorts });

    // ✅ Handle string response (LLM output)
    if (typeof aiResponse === "string") {
      try {
        const parsed = JSON.parse(aiResponse);
        setDashboardData(parsed);
      } catch (err) {
        console.error("⚠️ Failed to parse AI response as JSON:", aiResponse);
        setDashboardData(null);
      }
    } else {
      // If already structured
      setDashboardData(aiResponse);
    }
  } catch (err) {
    console.error("❌ Error while checking weather:", err);
    setDashboardData(null);
  } finally {
    setLoading(false);
  }
}


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">🌤️ Route Weather Analysis</h1>
          <p className="text-gray-600 text-lg">{routeName || "Route"}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📍 Waypoints</h2>
          {waypoints.length === 0 ? (
            <p className="text-gray-500">No waypoints found for this route.</p>
          ) : (
            <ul className="grid md:grid-cols-2 gap-4">
              {waypoints.map((wp, idx) => (
                <li key={wp.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="font-bold text-lg">{wp.port_code}</div>
                  <div className="text-sm text-gray-500">Lat: {wp.lat}, Lng: {wp.lng}</div>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={handleCheckRouteWeather}
            disabled={loading || waypoints.length === 0}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg"
          >
            {loading ? "Checking Weather..." : "Check Weather & Show Dashboard"}
          </button>
        </div>

        {dashboardData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <RouteDashboard data={dashboardData} />
          </div>
        )}
      </div>
    </div>
  );
}
