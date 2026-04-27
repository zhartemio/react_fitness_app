export type ThemeMode = 'light' | 'dark';

export interface WorkoutRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'cardio' | 'strength' | 'stretch';
}

export interface WeatherInfo {
  temperature: number;
  windspeed: number;
  time: string;
}

export interface User {
  id: string;
  email: string;
}
