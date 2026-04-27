import { WeatherInfo } from '@/src/models/types';
import { getItem, setItem } from '@/src/storage/localStore';

const CACHE_KEY = 'weather_cache';

export async function getWeather(): Promise<{ data: WeatherInfo | null; cached: boolean }> {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=55.75&longitude=37.62&current_weather=true');
    const json = await res.json();
    const data: WeatherInfo = {
      temperature: json.current_weather.temperature,
      windspeed: json.current_weather.windspeed,
      time: json.current_weather.time,
    };
    await setItem(CACHE_KEY, JSON.stringify(data));
    return { data, cached: false };
  } catch {
    const cache = await getItem(CACHE_KEY);
    return { data: cache ? (JSON.parse(cache) as WeatherInfo) : null, cached: true };
  }
}
