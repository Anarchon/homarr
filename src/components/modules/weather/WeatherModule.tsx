import { Group, Space, Title, Tooltip } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudStorm,
  QuestionMark,
  Snowflake,
  Sun,
} from 'tabler-icons-react';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';
import { WeatherResponse } from './WeatherInterface';

export const WeatherModule: IModule = {
  title: 'Weather (beta)',
  description: 'Look up the current weather in your location',
  icon: Sun,
  component: WeatherComponent,
  options: {
    freedomunit: {
      name: 'Display in Fahrenheit',
      value: false,
    },
  },
};

// 0 Clear sky
// 1, 2, 3 Mainly clear, partly cloudy, and overcast
// 45, 48 Fog and depositing rime fog
// 51, 53, 55 Drizzle: Light, moderate, and dense intensity
// 56, 57 Freezing Drizzle: Light and dense intensity
// 61, 63, 65 Rain: Slight, moderate and heavy intensity
// 66, 67 Freezing Rain: Light and heavy intensity
// 71, 73, 75 Snow fall: Slight, moderate, and heavy intensity
// 77 Snow grains
// 80, 81, 82 Rain showers: Slight, moderate, and violent
// 85, 86Snow showers slight and heavy
// 95 *Thunderstorm: Slight or moderate
// 96, 99 *Thunderstorm with slight and heavy hail
export function WeatherIcon(props: any) {
  const { code } = props;
  let data: { icon: any; name: string };
  switch (code) {
    case 0: {
      data = { icon: Sun, name: 'Clear' };
      break;
    }
    case 1:
    case 2:
    case 3: {
      data = { icon: Cloud, name: 'Mainly clear' };
      break;
    }
    case 45:
    case 48: {
      data = { icon: CloudFog, name: 'Fog' };
      break;
    }
    case 51:
    case 53:
    case 55: {
      data = { icon: Cloud, name: 'Drizzle' };
      break;
    }
    case 56:
    case 57: {
      data = { icon: Snowflake, name: 'Freezing drizzle' };
      break;
    }
    case 61:
    case 63:
    case 65: {
      data = { icon: CloudRain, name: 'Rain' };
      break;
    }
    case 66:
    case 67: {
      data = { icon: CloudRain, name: 'Freezing rain' };
      break;
    }
    case 71:
    case 73:
    case 75: {
      data = { icon: CloudSnow, name: 'Snow fall' };
      break;
    }
    case 77: {
      data = { icon: CloudSnow, name: 'Snow grains' };
      break;
    }
    case 80:
    case 81:
    case 82: {
      data = { icon: CloudRain, name: 'Rain showers' };

      break;
    }
    case 85:
    case 86: {
      data = { icon: CloudSnow, name: 'Snow showers' };
      break;
    }
    case 95: {
      data = { icon: CloudStorm, name: 'Thunderstorm' };
      break;
    }
    case 96:
    case 99: {
      data = { icon: CloudStorm, name: 'Thunderstorm with hail' };
      break;
    }
    default: {
      data = { icon: QuestionMark, name: 'Unknown' };
    }
  }
  return (
    <Tooltip label={data.name}>
      <data.icon size={50} />
    </Tooltip>
  );
}

export default function WeatherComponent(props: any) {
  // Get location from browser
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const { config } = useConfig();
  const [weather, setWeather] = useState({} as WeatherResponse);
  const isFahrenheit: boolean =
    config.settings[`${WeatherModule.title}.freedomunit`] === undefined
      ? false
      : config.settings[`${WeatherModule.title}.freedomunit`];

  if ('geolocation' in navigator && location.lat === 0 && location.lng === 0) {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }

  useEffect(() => {
    axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FLondon`
      )
      .then((res) => {
        setWeather(res.data);
      });
  }, []);
  if (!weather.current_weather) {
    return null;
  }
  function usePerferedUnit(value: number): string {
    return isFahrenheit ? `${(value * (9 / 5)).toFixed(1)}°F` : `${value.toFixed(1)}°C`;
  }
  return (
    <Group position="left" direction="column">
      <Title>{usePerferedUnit(weather.current_weather.temperature)}</Title>
      <Group spacing={0}>
        <WeatherIcon code={weather.current_weather.weathercode} />
        <Space mx="sm" />
        <span>{weather.daily.temperature_2m_max[0]}°C</span>
        <ArrowUpRight size={16} style={{ right: 15 }} />
        <Space mx="sm" />
        <span>{weather.daily.temperature_2m_min[0]}°C</span>
        <ArrowDownRight size={16} />
      </Group>
    </Group>
  );
}
