export async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_OPENWEATHER_API_URL || process.env.WEATHER_API_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('Weather API key or URL is missing');
  }

  const url = `${baseUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch weather data');
  return res.json();
}
