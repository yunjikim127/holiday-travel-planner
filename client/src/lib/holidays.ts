import { Holiday } from "@shared/schema";

export function calculateVacationRecommendations(
  koreanHolidays: Holiday[],
  maxLeaveDays: number
): Array<{
  name: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  leaveDaysUsed: number;
  score: number;
}> {
  const recommendations = [];
  
  // Sort holidays by date
  const sortedHolidays = [...koreanHolidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const holiday of sortedHolidays) {
    const holidayDate = new Date(holiday.date);
    
    // Check for potential vacation periods around this holiday
    for (let leaveDays = 1; leaveDays <= Math.min(maxLeaveDays, 5); leaveDays++) {
      // Try extending before the holiday
      const extendedPeriods = calculateExtendedPeriods(holidayDate, leaveDays);
      
      for (const period of extendedPeriods) {
        if (period.totalDays >= 4) { // Only recommend 4+ day vacations
          recommendations.push({
            name: `${holiday.name} 연휴`,
            startDate: period.startDate.toISOString().split('T')[0],
            endDate: period.endDate.toISOString().split('T')[0],
            totalDays: period.totalDays,
            leaveDaysUsed: leaveDays,
            score: calculateVacationScore(period.totalDays, leaveDays),
          });
        }
      }
    }
  }

  // Sort by score (efficiency ratio) and return top recommendations
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function calculateExtendedPeriods(holidayDate: Date, leaveDays: number) {
  const periods = [];
  
  // Extend before holiday
  const beforeStart = new Date(holidayDate);
  beforeStart.setDate(beforeStart.getDate() - leaveDays);
  periods.push(calculatePeriodLength(beforeStart, holidayDate));
  
  // Extend after holiday
  const afterEnd = new Date(holidayDate);
  afterEnd.setDate(afterEnd.getDate() + leaveDays);
  periods.push(calculatePeriodLength(holidayDate, afterEnd));
  
  // Bridge gaps
  const bridgeStart = new Date(holidayDate);
  bridgeStart.setDate(bridgeStart.getDate() - Math.floor(leaveDays / 2));
  const bridgeEnd = new Date(holidayDate);
  bridgeEnd.setDate(bridgeEnd.getDate() + Math.ceil(leaveDays / 2));
  periods.push(calculatePeriodLength(bridgeStart, bridgeEnd));
  
  return periods;
}

function calculatePeriodLength(startDate: Date, endDate: Date) {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return {
    startDate,
    endDate,
    totalDays,
  };
}

function calculateVacationScore(totalDays: number, leaveDaysUsed: number): number {
  // Score based on efficiency (total days / leave days used)
  const efficiency = totalDays / leaveDaysUsed;
  
  // Bonus for longer vacations
  const lengthBonus = Math.min(totalDays / 7, 2);
  
  return efficiency * lengthBonus;
}

export function getHolidayColor(countryCode: string): string {
  switch (countryCode) {
    case 'KR': return 'korean-blue';
    case 'JP': return 'festival-amber';
    case 'TH': return 'vacation-green';
    case 'VN': return 'red-500';
    case 'US': return 'blue-500';
    default: return 'gray-500';
  }
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function formatKoreanDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
}
