"use server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});

async function fetchWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const baseUrl = process.env.OPENWEATHER_API_URL || process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';

  if (!apiKey || !baseUrl) throw new Error('Weather API key or URL is missing');

  const url = `${baseUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OpenWeather API error: ${res.status} ${res.statusText}`);

  return res.json();
}

type Port = {
  code: string;
  lat: number;
  lon: number;
};

export async function analyzeWeather({ ports }: { ports: Port[] }) {
  const summaries: string[] = [];

  for (const port of ports) {
    let weather;
    try {
      weather = await fetchWeather(port.lat, port.lon);
    } catch (error: any) {
      return `⚠️ Unable to fetch weather for ${port.code}: ${error.message}`;
    }

    const main = weather?.main;
    const wind = weather?.wind;
    const visibility = weather?.visibility;
    const rain = weather?.rain;
    const snow = weather?.snow;
    const cloud = weather?.clouds;
    const desc = weather?.weather?.[0]?.description;

    const summary = `Port: ${port.code}\n- Temperature: ${main?.temp ?? 'N/A'}\n- Wind: ${wind?.speed ?? 'N/A'}\n- Visibility: ${visibility ?? 'unknown'}\n- Clouds: ${cloud?.all ?? 'N/A'}\n- Rain: ${rain?.['1h'] ?? 0}\n- Snow: ${snow?.['1h'] ?? 0}\n- Condition: ${desc ?? 'unknown'}`;

    summaries.push(summary);
  }

  const fullPrompt = summaries.join('\n\n');

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a maritime route planner assistant.

You will receive weather data and port info. Respond **only in valid JSON**, structured as follows:

{
  "primary_route": {
    "route_name": "Primary Route",
    "ports": [
      {
        "port_code": "<code>",
        "temperature": <number>,
        "wind_speed": <number>,
        "visibility_m": <number>,
        "cloud_coverage_pct": <number>,
        "rain_mm": <number>,
        "snow_mm": <number>,
        "condition": "<string>",
        "geopolitical_risk": "<low|medium|high>",
        "pirate_risk": "<low|medium|high>",
        "war_risk": "<low|medium|high>",
        "sailing_advice": "<text>",
        "stopover": <true|false>
      }
    ],
    "total_distance_km": <number>,
    "final_advice": "<safe|delay|reroute>"
  },
  "alternate_routes": [
    {
      "route_name": "Alternative 1",
      "ports": [...],
      "total_distance_km": <number>,
      "final_advice": "<safe|delay|reroute>"
    },
    {
      "route_name": "Alternative 2",
      "ports": [...],
      "total_distance_km": <number>,
      "final_advice": "<safe|delay|reroute>"
    }
  ],
  "recommendation": "Choose: Primary | Alternative 1 | Alternative 2"
}

Strictly return valid JSON. Do not explain. Do not use markdown or text.`.trim()
      },
      {
        role: 'user',
        content: fullPrompt
      }
    ]
  });

  const content = res.choices[0].message.content;
  try {
    return JSON.parse(content || '');
  } catch (e) {
    console.error("⚠️ Failed to parse AI response as JSON:", content);
    return content;
  }
}
