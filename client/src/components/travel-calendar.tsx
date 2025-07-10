import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { SelectedDestination, Holiday, CustomHoliday, VacationPlan, InsertVacationPlan, User } from "@shared/schema";
import { getHolidayColor } from "@/lib/holidays";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TravelCalendarProps {
  userId: number;
  destinations: SelectedDestination[];
}

export default function TravelCalendar({ userId, destinations }: TravelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: koreanHolidays = [] } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays", "KR", currentYear],
  });

  const { data: customHolidays = [] } = useQuery<CustomHoliday[]>({
    queryKey: ["/api/user", userId, "custom-holidays"],
  });

  const { data: vacationPlans = [] } = useQuery<VacationPlan[]>({
    queryKey: ["/api/user", userId, "vacation-plans"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user", userId],
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

  const createVacationPlanMutation = useMutation({
    mutationFn: async (plan: InsertVacationPlan) => {
      return apiRequest('POST', '/api/vacation-plans', plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'vacation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "휴가 계획이 추가되었습니다",
        description: "선택한 날짜에 휴가 계획이 추가되었습니다.",
      });
      
      // 연속된 계획이 있는지 확인하고 병합
      setTimeout(() => {
        mergeConsecutivePlans();
      }, 500);
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "휴가 계획 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteVacationPlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      return apiRequest('DELETE', `/api/vacation-plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'vacation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "휴가 계획이 삭제되었습니다",
        description: "선택한 휴가 계획이 삭제되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "휴가 계획 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleMouseDown = (date: Date) => {
    if (isWeekend(date) || getHolidaysForDate(date).length > 0) return;
    
    // 이미 휴가 계획이 있는 날짜인지 확인
    const existingPlan = vacationPlans.find(plan => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      return date >= startDate && date <= endDate;
    });
    
    if (existingPlan) {
      // 기존 휴가 계획 삭제
      deleteVacationPlanMutation.mutate(existingPlan.id!);
      return;
    }
    
    setIsDragging(true);
    setDragStartDate(date);
    setSelectedDates([date]);
  };

  const handleMouseEnter = (date: Date) => {
    if (!isDragging || !dragStartDate || isWeekend(date) || getHolidaysForDate(date).length > 0) return;
    
    const dates = getDatesBetween(dragStartDate, date);
    setSelectedDates(dates);
  };

  const handleMouseUp = () => {
    if (isDragging && selectedDates.length > 0) {
      const startDate = new Date(Math.min(...selectedDates.map(d => d.getTime())));
      const endDate = new Date(Math.max(...selectedDates.map(d => d.getTime())));
      
      const vacationPlan: InsertVacationPlan = {
        userId,
        title: selectedDates.length === 1 
          ? `휴가 계획 (${startDate.getMonth() + 1}/${startDate.getDate()})`
          : `휴가 계획 (${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()})`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        leaveDaysUsed: selectedDates.length,
        destinations: destinations.map(d => d.countryCode),
        notes: "캘린더에서 직접 추가한 휴가",
      };
      
      createVacationPlanMutation.mutate(vacationPlan);
    }
    
    setIsDragging(false);
    setDragStartDate(null);
    setSelectedDates([]);
  };

  const mergeConsecutivePlans = () => {
    const sortedPlans = [...vacationPlans].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const mergedGroups: VacationPlan[][] = [];
    let currentGroup: VacationPlan[] = [];
    
    for (const plan of sortedPlans) {
      if (currentGroup.length === 0) {
        currentGroup.push(plan);
      } else {
        const lastPlan = currentGroup[currentGroup.length - 1];
        const lastEndDate = new Date(lastPlan.endDate);
        const currentStartDate = new Date(plan.startDate);
        
        // 연속된 날짜인지 확인 (하루 차이)
        const dayDiff = Math.ceil((currentStartDate.getTime() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff <= 1) {
          currentGroup.push(plan);
        } else {
          if (currentGroup.length > 1) {
            mergedGroups.push(currentGroup);
          }
          currentGroup = [plan];
        }
      }
    }
    
    if (currentGroup.length > 1) {
      mergedGroups.push(currentGroup);
    }
    
    // 병합 필요한 그룹들을 처리
    mergedGroups.forEach(group => {
      const firstPlan = group[0];
      const lastPlan = group[group.length - 1];
      const totalLeaveDays = group.reduce((sum, p) => sum + p.leaveDaysUsed, 0);
      
      // 새로운 병합된 계획 생성
      const mergedPlan: InsertVacationPlan = {
        userId,
        title: `휴가 계획 (${new Date(firstPlan.startDate).getMonth() + 1}/${new Date(firstPlan.startDate).getDate()} ~ ${new Date(lastPlan.endDate).getMonth() + 1}/${new Date(lastPlan.endDate).getDate()})`,
        startDate: firstPlan.startDate,
        endDate: lastPlan.endDate,
        leaveDaysUsed: totalLeaveDays,
        destinations: destinations.map(d => d.countryCode),
        notes: "연속된 휴가 계획 병합",
      };
      
      // 기존 개별 계획들 삭제
      group.forEach(plan => {
        if (plan.id) {
          deleteVacationPlanMutation.mutate(plan.id);
        }
      });
      
      // 새로운 병합된 계획 생성
      setTimeout(() => {
        createVacationPlanMutation.mutate(mergedPlan);
      }, 100);
    });
  };

  const getDatesBetween = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    if (currentDate > end) {
      [currentDate.setTime(end.getTime()), end.setTime(startDate.getTime())];
    }
    
    while (currentDate <= end) {
      if (!isWeekend(currentDate) && getHolidaysForDate(currentDate).length === 0) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isVacationDay = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return vacationPlans.some(plan => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      const checkDate = new Date(dateStr);
      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  const isSelectedDate = (date: Date): boolean => {
    return selectedDates.some(selectedDate => 
      selectedDate.toDateString() === date.toDateString()
    );
  };

  const calculateLeaveStats = () => {
    const totalUsed = vacationPlans.reduce((sum, plan) => sum + plan.leaveDaysUsed, 0);
    const totalLeaves = user?.totalLeaves || 15;
    const remaining = totalLeaves - totalUsed;
    return { totalUsed, remaining, totalLeaves };
  };

  const { totalUsed, remaining, totalLeaves } = calculateLeaveStats();

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

  const getHolidayColorClass = (type: string) => {
    switch (type) {
      case 'korean': return 'bg-korean-blue';
      case 'custom': return 'bg-purple-500';
      default: return `bg-${getHolidayColor(type.toUpperCase())}`;
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
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold">
            {currentYear}년 {monthNames[currentMonth]}
          </h2>
          <div className="text-sm text-gray-600">
            총 사용 연차 일 수: <span className="font-medium text-red-600">{totalUsed}일</span> / 
            잔여 연차 일 수: <span className="font-medium text-blue-600">{remaining}일</span>
          </div>
        </div>
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
              <div className={`w-3 h-3 rounded mr-2 bg-${getHolidayColor(dest.countryCode)}`}></div>
              <span>{dest.countryName} 공휴일</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
            <span>회사 휴무일</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>휴가 계획</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          💡 평일을 드래그하여 휴가 계획을 추가하거나, 기존 휴가 계획을 클릭하여 삭제할 수 있습니다.
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
        <div className="grid grid-cols-7 gap-1" onMouseUp={handleMouseUp}>
          {days.map((day, index) => {
            const holidays = getHolidaysForDate(day.date);
            const isWeekendDay = isWeekend(day.date);
            const dayOfWeek = day.date.getDay();
            const isVacation = isVacationDay(day.date);
            const isSelected = isSelectedDate(day.date);

            return (
              <div
                key={index}
                className={`h-20 p-1 text-center border border-gray-100 relative cursor-pointer select-none ${
                  !day.isCurrentMonth ? 'opacity-50' : ''
                } ${
                  dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''
                } ${
                  isSelected ? 'bg-blue-200 border-blue-400' : 
                  isVacation ? 'bg-green-100 border-green-300' :
                  isWeekendDay || holidays.length > 0 ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onMouseDown={() => day.isCurrentMonth && handleMouseDown(day.date)}
                onMouseEnter={() => day.isCurrentMonth && handleMouseEnter(day.date)}
              >
                <span className={`${day.isCurrentMonth ? 'font-medium' : 'text-gray-400'} text-sm`}>
                  {day.date.getDate()}
                </span>
                
                {isVacation && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
                
                {holidays.length > 0 && (
                  <div className="absolute bottom-1 left-1 right-1 space-y-1">
                    {holidays.slice(0, 2).map((holiday, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className={`h-1 ${getHolidayColorClass(holiday.type)} rounded`}></div>
                        {idx === 0 && (
                          <div className={`text-xs ${
                            holiday.type === 'korean' ? 'text-korean-blue' :
                            holiday.type === 'custom' ? 'text-purple-500' :
                            `text-${getHolidayColor(holiday.type.toUpperCase())}`
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
