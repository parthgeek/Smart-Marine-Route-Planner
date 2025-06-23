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
      return {
        error: `⚠️ Unable to fetch weather for ${port.code}: ${error.message}`
      };
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

  let res;
  try {
    res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // change to 'gpt-3.5-turbo' if needed for testing
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
        "port_code": "<port_code>",
        "temperature": <number>,
        "wind_speed": <number>,
        "visibility_m": <number>,
        "cloud_coverage_pct": <number>,
        "rain_mm": <number>,
        "snow_mm": <number>,
        "condition": "<weather_condition_description>",
        "geopolitical_risk": "<low|medium|high>",
        "pirate_risk": "<low|medium|high>",
        "war_risk": "<low|medium|high>",
        "sailing_advice": "<detailed_sailing_advice_text>",
        "stopover": <true|false>
      }
    ],
    "total_distance_km": <number>,
    "final_advice": "<safe|delay|reroute>"
  },
  "alternate_routes": [
    {
      "route_name": "Alternative 1",
      "ports": [
        {
          "port_code": "<port_code>",
          "temperature": <number>,
          "wind_speed": <number>,
          "visibility_m": <number>,
          "cloud_coverage_pct": <number>,
          "rain_mm": <number>,
          "snow_mm": <number>,
          "condition": "<weather_condition_description>",
          "geopolitical_risk": "<low|medium|high>",
          "pirate_risk": "<low|medium|high>",
          "war_risk": "<low|medium|high>",
          "sailing_advice": "<detailed_sailing_advice_text>",
          "stopover": <true|false>
        }
      ],
      "total_distance_km": <number>,
      "final_advice": "<safe|delay|reroute>"
    },
    {
      "route_name": "Alternative 2",
      "ports": [
        {
          "port_code": "<port_code>",
          "temperature": <number>,
          "wind_speed": <number>,
          "visibility_m": <number>,
          "cloud_coverage_pct": <number>,
          "rain_mm": <number>,
          "snow_mm": <number>,
          "condition": "<weather_condition_description>",
          "geopolitical_risk": "<low|medium|high>",
          "pirate_risk": "<low|medium|high>",
          "war_risk": "<low|medium|high>",
          "sailing_advice": "<detailed_sailing_advice_text>",
          "stopover": <true|false>
        }
      ],
      "total_distance_km": <number>,
      "final_advice": "<safe|delay|reroute>"
    }
  ],
  "recommendation": "<Primary Route | Alternative 1 | Alternative 2> is recommended due to <brief_reason>"
}

Strictly return valid JSON. Do not explain. Do not use markdown or text.`.trim()
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ]
    });
  } catch (error: any) {
    console.error("⚠️ OpenAI API error:", error);

    if (error.status === 429) {
      return {
        error: "⚠️ OpenAI API quota exceeded. Please check your usage or try again later."
      };
    }

    return {
      error: `⚠️ Unexpected OpenAI error: ${error.message || 'Unknown'}`
    };
  }

  const content = res.choices[0].message.content;
  try {
    return JSON.parse(content || '');
  } catch (e) {
    console.error("⚠️ Failed to parse AI response as JSON:", content);
    return {
      error: "⚠️ Failed to parse AI response as JSON.",
      raw: content
    };
  }
}

/*"use server";
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
      return {
        error: `⚠️ Unable to fetch weather for ${port.code}: ${error.message}`
      };
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
  console.log("🧪 Full prompt (mocked):", fullPrompt);

  // 🧪 Mocked response — no OpenAI call
  const mockedJson = {
    primary_route: {
      route_name: "Primary Route",
      ports: ports.map(p => ({
        port_code: p.code,
        temperature: 28,
        wind_speed: 5,
        visibility_m: 10000,
        cloud_coverage_pct: 20,
        rain_mm: 0,
        snow_mm: 0,
        condition: "clear sky",
        geopolitical_risk: "low",
        pirate_risk: "low",
        war_risk: "low",
        sailing_advice: "Safe to sail with no concerns.",
        stopover: false
      })),
      total_distance_km: 1200,
      final_advice: "safe"
    },
    alternate_routes: [
      {
        route_name: "Alternative 1",
        ports: ports.map(p => ({
          port_code: p.code,
          temperature: 30,
          wind_speed: 6,
          visibility_m: 9000,
          cloud_coverage_pct: 40,
          rain_mm: 0,
          snow_mm: 0,
          condition: "partly cloudy",
          geopolitical_risk: "medium",
          pirate_risk: "low",
          war_risk: "low",
          sailing_advice: "Slight cloud coverage but still good to sail.",
          stopover: false
        })),
        total_distance_km: 1350,
        final_advice: "safe"
      },
      {
        route_name: "Alternative 2",
        ports: ports.map(p => ({
          port_code: p.code,
          temperature: 25,
          wind_speed: 10,
          visibility_m: 7000,
          cloud_coverage_pct: 70,
          rain_mm: 5,
          snow_mm: 0,
          condition: "rain showers",
          geopolitical_risk: "low",
          pirate_risk: "medium",
          war_risk: "low",
          sailing_advice: "Expect showers and higher wind. Proceed with caution.",
          stopover: true
        })),
        total_distance_km: 1500,
        final_advice: "delay"
      }
    ],
    recommendation: "Primary Route is recommended due to favorable weather and low risk"
  };

  return mockedJson;
}
*/
