import { CountryInfo } from "@shared/schema";

export const countries: CountryInfo[] = [
  // Popular destinations
  { code: 'JP', name: 'Japan', nameKr: '일본', emoji: '🇯🇵', region: 'Asia', popular: true },
  { code: 'TH', name: 'Thailand', nameKr: '태국', emoji: '🇹🇭', region: 'Asia', popular: true },
  { code: 'VN', name: 'Vietnam', nameKr: '베트남', emoji: '🇻🇳', region: 'Asia', popular: true },
  { code: 'US', name: 'United States', nameKr: '미국', emoji: '🇺🇸', region: 'North America', popular: true },
  { code: 'PH', name: 'Philippines', nameKr: '필리핀', emoji: '🇵🇭', region: 'Asia', popular: true },
  { code: 'SG', name: 'Singapore', nameKr: '싱가포르', emoji: '🇸🇬', region: 'Asia', popular: true },

  // Europe
  { code: 'GB', name: 'United Kingdom', nameKr: '영국', emoji: '🇬🇧', region: 'Europe', popular: false },
  { code: 'FR', name: 'France', nameKr: '프랑스', emoji: '🇫🇷', region: 'Europe', popular: false },
  { code: 'DE', name: 'Germany', nameKr: '독일', emoji: '🇩🇪', region: 'Europe', popular: false },
  { code: 'IT', name: 'Italy', nameKr: '이탈리아', emoji: '🇮🇹', region: 'Europe', popular: false },
  { code: 'ES', name: 'Spain', nameKr: '스페인', emoji: '🇪🇸', region: 'Europe', popular: false },
  { code: 'CH', name: 'Switzerland', nameKr: '스위스', emoji: '🇨🇭', region: 'Europe', popular: false },
  { code: 'NL', name: 'Netherlands', nameKr: '네덜란드', emoji: '🇳🇱', region: 'Europe', popular: false },
  { code: 'BE', name: 'Belgium', nameKr: '벨기에', emoji: '🇧🇪', region: 'Europe', popular: false },
  { code: 'AT', name: 'Austria', nameKr: '오스트리아', emoji: '🇦🇹', region: 'Europe', popular: false },
  { code: 'CZ', name: 'Czech Republic', nameKr: '체코', emoji: '🇨🇿', region: 'Europe', popular: false },

  // Asia
  { code: 'MY', name: 'Malaysia', nameKr: '말레이시아', emoji: '🇲🇾', region: 'Asia', popular: false },
  { code: 'ID', name: 'Indonesia', nameKr: '인도네시아', emoji: '🇮🇩', region: 'Asia', popular: false },
  { code: 'IN', name: 'India', nameKr: '인도', emoji: '🇮🇳', region: 'Asia', popular: false },
  { code: 'HK', name: 'Hong Kong', nameKr: '홍콩', emoji: '🇭🇰', region: 'Asia', popular: false },
  { code: 'MO', name: 'Macao', nameKr: '마카오', emoji: '🇲🇴', region: 'Asia', popular: false },
  { code: 'MM', name: 'Myanmar', nameKr: '미얀마', emoji: '🇲🇲', region: 'Asia', popular: false },
  { code: 'LA', name: 'Laos', nameKr: '라오스', emoji: '🇱🇦', region: 'Asia', popular: false },
  { code: 'KH', name: 'Cambodia', nameKr: '캄보디아', emoji: '🇰🇭', region: 'Asia', popular: false },

  // Oceania
  { code: 'AU', name: 'Australia', nameKr: '호주', emoji: '🇦🇺', region: 'Oceania', popular: false },
  { code: 'NZ', name: 'New Zealand', nameKr: '뉴질랜드', emoji: '🇳🇿', region: 'Oceania', popular: false },
  { code: 'FJ', name: 'Fiji', nameKr: '피지', emoji: '🇫🇯', region: 'Oceania', popular: false },

  // Americas
  { code: 'CA', name: 'Canada', nameKr: '캐나다', emoji: '🇨🇦', region: 'North America', popular: false },
  { code: 'MX', name: 'Mexico', nameKr: '멕시코', emoji: '🇲🇽', region: 'North America', popular: false },
  { code: 'BR', name: 'Brazil', nameKr: '브라질', emoji: '🇧🇷', region: 'South America', popular: false },
  { code: 'AR', name: 'Argentina', nameKr: '아르헨티나', emoji: '🇦🇷', region: 'South America', popular: false },
  { code: 'CL', name: 'Chile', nameKr: '칠레', emoji: '🇨🇱', region: 'South America', popular: false },
  { code: 'PE', name: 'Peru', nameKr: '페루', emoji: '🇵🇪', region: 'South America', popular: false },

  // Middle East & Africa
  { code: 'AE', name: 'United Arab Emirates', nameKr: '아랍에미리트', emoji: '🇦🇪', region: 'Middle East', popular: false },
  { code: 'SA', name: 'Saudi Arabia', nameKr: '사우디아라비아', emoji: '🇸🇦', region: 'Middle East', popular: false },
  { code: 'TR', name: 'Turkey', nameKr: '터키', emoji: '🇹🇷', region: 'Middle East', popular: false },
  { code: 'EG', name: 'Egypt', nameKr: '이집트', emoji: '🇪🇬', region: 'Africa', popular: false },
  { code: 'ZA', name: 'South Africa', nameKr: '남아프리카공화국', emoji: '🇿🇦', region: 'Africa', popular: false },
  { code: 'KE', name: 'Kenya', nameKr: '케냐', emoji: '🇰🇪', region: 'Africa', popular: false },
];

export const popularDestinations = countries.filter(country => country.popular);

export const regionGroups = {
  'Asia': countries.filter(c => c.region === 'Asia'),
  'Europe': countries.filter(c => c.region === 'Europe'),
  'North America': countries.filter(c => c.region === 'North America'),
  'South America': countries.filter(c => c.region === 'South America'),
  'Oceania': countries.filter(c => c.region === 'Oceania'),
  'Middle East': countries.filter(c => c.region === 'Middle East'),
  'Africa': countries.filter(c => c.region === 'Africa'),
};
