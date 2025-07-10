import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { SelectedDestination, Holiday, CustomHoliday } from "@shared/schema";

interface TravelCalendarProps {
  userId: number;
  destinations: SelectedDestination[];
}

export default function TravelCalendar({ userId, destinations }: TravelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 4, 1)); // May 2024
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const { data: koreanHolidays = [] } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "KR", currentYear],
  });

  const { data: customHolidays = [] } = useQuery<CustomHoliday[]>({
    queryKey: ["/api/user", userId, "custom-holidays"],
  });

  // Get holidays for selected destinations with fixed queries
  const usDestinationHolidays = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "US", currentYear],
    enabled: destinations.some(d => d.countryCode === "US"),
  });

  const jpDestinationHolidays = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "JP", currentYear],
    enabled: destinations.some(d => d.countryCode === "JP"),
  });

  const thDestinationHolidays = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "TH", currentYear],
    enabled: destinations.some(d => d.countryCode === "TH"),
  });

  const vnDestinationHolidays = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "VN", currentYear],
    enabled: destinations.some(d => d.countryCode === "VN"),
  });

  // Map destination holidays
  const destinationHolidays = destinations.map(dest => {
    let holidays: Holiday[] = [];
    switch (dest.countryCode) {
      case "US":
        holidays = usDestinationHolidays.data || [];
        break;
      case "JP":
        holidays = jpDestinationHolidays.data || [];
        break;
      case "TH":
        holidays = thDestinationHolidays.data || [];
        break;
      case "VN":
        holidays = vnDestinationHolidays.data || [];
        break;
    }
    return { countryCode: dest.countryCode, holidays };
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getHolidaysForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const holidays: Array<{ name: string; type: string; country: string }> = [];

    // Korean holidays
    const koreanHoliday = koreanHolidays.find(h => h.date === dateStr);
    if (koreanHoliday) {
      holidays.push({ name: koreanHoliday.name, type: 'korean', country: 'KR' });
    }

    // Custom holidays
    const customHoliday = customHolidays.find(h => h.date === dateStr);
    if (customHoliday) {
      holidays.push({ name: customHoliday.name, type: 'custom', country: 'Custom' });
    }

    // Destination holidays
    destinationHolidays.forEach(({ countryCode, holidays: countryHolidays }) => {
      const holiday = countryHolidays.find(h => h.date === dateStr);
      if (holiday) {
        holidays.push({ name: holiday.name, type: countryCode.toLowerCase(), country: countryCode });
      }
    });

    return holidays;
  };

  const getHolidayColor = (type: string) => {
    switch (type) {
      case 'korean': return 'bg-korean-blue';
      case 'jp': return 'bg-festival-amber';
      case 'th': return 'bg-vacation-green';
      case 'vn': return 'bg-red-500';
      case 'us': return 'bg-blue-500';
      case 'custom': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateOfMonth = new Date(year, month, day);
      days.push({ date: currentDateOfMonth, isCurrentMonth: true });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ];

  return (
    <Card>
      {/* Calendar Header */}
      <CardHeader className="flex flex-row justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold">
          {currentYear}년 {monthNames[currentMonth]}
        </h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </CardHeader>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-korean-blue rounded mr-2"></div>
            <span>한국 공휴일</span>
          </div>
          {destinations.map(dest => (
            <div key={dest.countryCode} className="flex items-center">
              <div className={`w-3 h-3 rounded mr-2 ${
                dest.countryCode === 'JP' ? 'bg-festival-amber' :
                dest.countryCode === 'TH' ? 'bg-vacation-green' :
                'bg-gray-500'
              }`}></div>
              <span>{dest.countryName} 공휴일</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>회사 휴무일</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Calendar Header Days */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const holidays = getHolidaysForDate(day.date);
            const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
            const dayOfWeek = day.date.getDay();

            return (
              <div
                key={index}
                className={`h-20 p-1 text-center border border-gray-100 relative cursor-pointer hover:bg-gray-50 ${
                  !day.isCurrentMonth ? 'opacity-50' : ''
                } ${
                  dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''
                }`}
              >
                <span className={`${day.isCurrentMonth ? 'font-medium' : 'text-gray-400'} text-sm`}>
                  {day.date.getDate()}
                </span>
                
                {holidays.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 space-y-1">
                    {holidays.slice(0, 2).map((holiday, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className={`h-1 ${getHolidayColor(holiday.type)} rounded`}></div>
                        {idx === 0 && (
                          <div className={`text-xs ${
                            holiday.type === 'korean' ? 'text-korean-blue' :
                            holiday.type === 'jp' ? 'text-festival-amber' :
                            holiday.type === 'th' ? 'text-vacation-green' :
                            holiday.type === 'custom' ? 'text-purple-500' :
                            'text-gray-500'
                          } truncate`}>
                            {holiday.name.length > 8 ? holiday.name.substring(0, 8) + '...' : holiday.name}
                          </div>
                        )}
                      </div>
                    ))}
                    {holidays.length > 2 && (
                      <div className="text-xs text-gray-500">+{holidays.length - 2}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Calendar Footer with Insights */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <Calendar className="text-korean-blue mr-2" size={16} />
              이번 달 여행 최적기
            </h4>
            <p className="text-sm text-gray-600">5월 4일-7일 어린이날 연휴 추천</p>
            <p className="text-xs text-gray-500 mt-1">연차 1일로 4일 연휴 가능</p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center">
              <AlertTriangle className="text-red-500 mr-2" size={16} />
              주의사항
            </h4>
            <p className="text-sm text-gray-600">일본 골든위크 기간</p>
            <p className="text-xs text-gray-500 mt-1">숙박비 상승, 조기 예약 필수</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
