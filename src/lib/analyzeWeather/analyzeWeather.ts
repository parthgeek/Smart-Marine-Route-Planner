"use server";
import OpenAI from 'openai';

// Fetches weather data from OpenWeather API for given coordinates
async function fetchWeather(lat: number, lon: number) {
  // Support both server-side and client-side env vars
  const apiKey = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const baseUrl = process.env.OPENWEATHER_API_URL || process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather';
  if (!apiKey || !baseUrl) {
    throw new Error('Weather API key or URL is missing');
  }

  const url = `${baseUrl}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenWeather API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
});

type Port = {
  code: string;
  lat: number;
  lon: number;
};

/**
 * Analyze weather for a port by fetching data from OpenWeather and summarizing via OpenAI.
 * @param port - An object containing port.code, port.lat, and port.lon
 */
export async function analyzeWeather(port: Port) {
  const { code: portCode, lat, lon } = port;

  let weather: any;
  try {
    weather = await fetchWeather(lat, lon);
  } catch (error: any) {
    console.error(`❌ Weather Fetch Error for ${portCode}:`, error.message);
    return `⚠️ Unable to fetch weather for ${portCode}: ${error.message}`;
  }

  const main = weather?.main;
  const wind = weather?.wind;
  const visibility = weather?.visibility;
  const rain = weather?.rain;
  const snow = weather?.snow;
  const cloud = weather?.clouds;
  const desc = weather?.weather?.[0]?.description;

  if (!main || !wind) {
    return `⚠️ Unable to analyze weather for ${portCode}: incomplete data.`;
  }

  const summary = `Weather at ${portCode}:
- Temperature: ${main.temp ?? 'N/A'}°C
- Wind: ${wind.speed ?? 'N/A'} m/s
- Visibility: ${visibility ?? 'unknown'} meters
- Clouds: ${cloud?.all ?? 'N/A'}%
- Rain: ${rain?.['1h'] ?? 0} mm
- Snow: ${snow?.['1h'] ?? 0} mm
- Condition: ${desc ?? 'unknown'}`;

  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a maritime weather assistant. Based on provided weather data for each port along a shipping route, you must:

1. For each port, output **only** bullets in this format:
   **🛳️ Port:** <name or code>
   - Temperature: …
   - Wind: …
   - Visibility: …
   - Clouds: …
   - Rain/Snow: …
   - Condition: … ✅ / ⚠️
   - Geopolitical Risk: …
   - Pirate Risk: …
   - War Risk: …
   - 🌊 Sailing Safety Advice: …
   - ⛴️ Stopover : …

2. After all ports, include:
   **🧭 Route:** Port A → Port B → … → Destination
   - Total Distance: … km  
   **✅ Final Advice:** Safe to proceed / ⚠️ Delay advised / ⛔ Reroute recommended

3. Then add this interactive element:
   - 🔄 **Suggest Alternate Route** _(button)_

When the user clicks “🔄 Suggest Alternate Route”, you must generate **two** alternate port sequences (with their own weather/safety summaries in bullet form, same format) and a final comparative recommendation:
Add All the stopover ports in the route, and then:
   **🧭 Compared Advice:** Choose: Primary / Alternative 1 / Alternative 2
**Alternative 1:** Port A → X → Y → Destination  
- Total Distance: … km  
…(weather bullets & ticks)…

**Alternative 2:** Port A → Z → W → Destination  
- Total Distance: … km  
…(weather bullets & ticks)…

**🧭 Compared Advice:** Choose: Primary / Alternative 1 / Alternative 2

Strictly keep every output in bullets except the Route lines and button line. Do not write any paragraphs.`.trim(),
        },
        {
          role: 'user',
          content: summary,
        },
      ],
    });

    return res.choices[0].message.content || `⚠️ No advice returned by LLM for ${portCode}`;
  } catch (err: any) {
    console.error(`❌ OpenAI Error for ${portCode}:`, err.message);
    return `⚠️ Failed to analyze weather at ${portCode}.`;
  }
}
