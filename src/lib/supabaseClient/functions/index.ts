// deno-lint-ignore-file
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  const { data: routes } = await supabase.from("routes").select("id");

  for (const route of routes || []) {
    const { data: waypoints } = await supabase
      .from("waypoints")
      .select("*")
      .eq("route_id", route.id)
      .order("sequence");

    for (const wp of waypoints || []) {
      const weather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${wp.lat}&lon=${wp.lng}&appid=${Deno.env.get("WEATHER_API_KEY")}`
      ).then((res) => res.json());

      const advice = weather.weather?.[0]?.main?.includes("Thunderstorm")
        ? "Thunderstorms expected. Divert recommended."
        : "OK";

      if (advice !== "OK") {
        await supabase.from("alerts").insert({
          route_id: route.id,
          waypoint_id: wp.id,
          message: `${wp.airport_code}: ${advice}`,
        });
      }
    }
  }

  return new Response("Weather check complete", { status: 200 });
});