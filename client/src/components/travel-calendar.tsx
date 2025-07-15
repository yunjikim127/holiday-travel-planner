import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from "lucide-react";
import { SelectedDestination, Holiday, CustomHoliday, VacationPlan, InsertVacationPlan, User } from "@shared/schema";
import { getHolidayColor } from "@/lib/holidays";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TravelCalendarProps {
  userId: number;
  destinations: SelectedDestination[];
  onDateChange?: (date: Date) => void;
}

export default function TravelCalendar({ userId, destinations, onDateChange }: TravelCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)); // July 2025
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [leaveTypeDialogOpen, setLeaveTypeDialogOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<"full" | "half" | "quarter">("full");
  const [pendingVacationPlan, setPendingVacationPlan] = useState<InsertVacationPlan | null>(null);
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
    onDateChange?.(newDate);
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
      const startDate = new Date(plan.startDate + 'T00:00:00');
      const endDate = new Date(plan.endDate + 'T00:00:00');
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return checkDate >= startDate && checkDate <= endDate;
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
      
      // 로컬 날짜를 정확히 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // 단일 날짜일 때만 휴가 유형 선택 다이얼로그 표시
      if (selectedDates.length === 1) {
        const vacationPlan: InsertVacationPlan = {
          userId,
          title: `휴가 계획 (${startDate.getMonth() + 1}/${startDate.getDate()})`,
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
          leaveDaysUsed: 1, // 기본값, 다이얼로그에서 변경됨
          leaveType: "full", // 기본값, 다이얼로그에서 변경됨
          destinations: destinations.map(d => d.countryCode),
          notes: "캘린더에서 직접 추가한 휴가",
        };
        
        setPendingVacationPlan(vacationPlan);
        setLeaveTypeDialogOpen(true);
      } else {
        // 여러 날짜일 때는 바로 전일 휴가로 생성
        const vacationPlan: InsertVacationPlan = {
          userId,
          title: `휴가 계획 (${startDate.getMonth() + 1}/${startDate.getDate()} ~ ${endDate.getMonth() + 1}/${endDate.getDate()})`,
          startDate: formatLocalDate(startDate),
          endDate: formatLocalDate(endDate),
          leaveDaysUsed: selectedDates.length,
          leaveType: "full",
          destinations: destinations.map(d => d.countryCode),
          notes: "캘린더에서 직접 추가한 휴가",
        };
        
        createVacationPlanMutation.mutate(vacationPlan);
      }
    }
    
    setIsDragging(false);
    setDragStartDate(null);
    setSelectedDates([]);
  };

  const handleLeaveTypeConfirm = () => {
    if (pendingVacationPlan) {
      const leaveDaysUsed = selectedLeaveType === "full" ? 1 : selectedLeaveType === "half" ? 0.5 : 0.25;
      const leaveTypeText = selectedLeaveType === "full" ? "종일" : selectedLeaveType === "half" ? "반차" : "반반차";
      
      const finalPlan: InsertVacationPlan = {
        ...pendingVacationPlan,
        leaveDaysUsed,
        leaveType: selectedLeaveType,
        title: `${leaveTypeText} 휴가 (${new Date(pendingVacationPlan.startDate).getMonth() + 1}/${new Date(pendingVacationPlan.startDate).getDate()})`,
      };
      
      createVacationPlanMutation.mutate(finalPlan);
    }
    
    setLeaveTypeDialogOpen(false);
    setPendingVacationPlan(null);
    setSelectedLeaveType("full");
  };

  // 병합 기능을 완전히 제거하여 무한 루프 방지

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
    // 로컬 날짜를 정확히 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return vacationPlans.some(plan => {
      const startDate = new Date(plan.startDate + 'T00:00:00');
      const endDate = new Date(plan.endDate + 'T00:00:00');
      const checkDate = new Date(dateStr + 'T00:00:00');
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
    // 로컬 날짜를 정확히 YYYY-MM-DD 형식으로 변환 (타임존 문제 해결)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
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

  // 현재 월과 다음 월 생성
  const currentMonthDays = getDaysInMonth(currentDate);
  const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
  const nextMonthDays = getDaysInMonth(nextMonth);

  const renderMonth = (date: Date, days: any[], monthIndex: number) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return (
      <div key={monthIndex} className="flex-1">
        {/* Month Header */}
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="text-base font-medium">
            {year}년 {monthNames[month]}
          </h3>
          {monthIndex === 0 && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')} className="h-6 w-6 p-0">
                <ChevronLeft size={12} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')} className="h-6 w-6 p-0">
                <ChevronRight size={12} />
              </Button>
            </div>
          )}
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-px">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div key={day} className={`text-center text-xs font-medium py-1 ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
            }`}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px" onMouseUp={handleMouseUp}>
          {days.map((day, index) => {
            const holidays = getHolidaysForDate(day.date);
            const isWeekendDay = isWeekend(day.date);
            const dayOfWeek = day.date.getDay();
            const isVacation = isVacationDay(day.date);
            const isSelected = isSelectedDate(day.date);

            return (
              <div
                key={index}
                className={`h-12 p-1 text-center border border-gray-100 relative cursor-pointer select-none ${
                  !day.isCurrentMonth ? 'opacity-30' : ''
                } ${
                  dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : ''
                } ${
                  isSelected ? 'bg-blue-200 border-blue-400' : 
                  isVacation ? 'bg-green-100 border-green-300' :
                  holidays.length > 0 ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                onMouseDown={() => day.isCurrentMonth && handleMouseDown(day.date)}
                onMouseEnter={() => day.isCurrentMonth && handleMouseEnter(day.date)}
                title={(() => {
                  const tooltipItems = [];
                  if (holidays.length > 0) {
                    tooltipItems.push(...holidays.map(h => `${h.name} (${h.country})`));
                  }
                  if (isVacation) {
                    const vacationPlan = vacationPlans.find(plan => {
                      const startDate = new Date(plan.startDate);
                      const endDate = new Date(plan.endDate);
                      return day.date >= startDate && day.date <= endDate;
                    });
                    if (vacationPlan) {
                      tooltipItems.push(`휴가 계획: ${vacationPlan.title}`);
                    }
                  }
                  return tooltipItems.join('\n');
                })()}
              >
                <div className="text-xs font-medium">{day.date.getDate()}</div>
                {holidays.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                    <div className="flex space-x-px">
                      {holidays.slice(0, 3).map((holiday, holidayIndex) => (
                        <div
                          key={holidayIndex}
                          className={`w-1 h-1 rounded-full ${getHolidayColorClass(holiday.type)}`}
                        />
                      ))}
                      {holidays.length > 3 && (
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      {/* Main Header */}
      <CardHeader className="flex flex-row justify-between items-center p-4 border-b">
        <div className="flex flex-col space-y-1">
          <h2 id="calendar-heading" className="text-lg font-semibold">
            2025년 대한민국 총 공휴일: 16일
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm bg-red-50 px-3 py-1 rounded-full border border-red-200">
              사용 연차: <span className="font-bold text-red-700">{totalUsed}일</span>
            </div>
            <div className="text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              잔여 연차: <span className="font-bold text-blue-700">{remaining}일</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            vacationPlans.forEach(plan => {
              if (plan.id) {
                deleteVacationPlanMutation.mutate(plan.id);
              }
            });
          }}
          disabled={vacationPlans.length === 0 || deleteVacationPlanMutation.isPending}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Reset
        </Button>
      </CardHeader>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-korean-blue rounded mr-1"></div>
            <span>한국 공휴일</span>
          </div>
          {destinations.map(dest => (
            <div key={dest.countryCode} className="flex items-center">
              <div className={`w-2 h-2 rounded mr-1 bg-${getHolidayColor(dest.countryCode)}`}></div>
              <span>{dest.countryName}</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded mr-1"></div>
            <span>회사 휴무일</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
            <span>휴가 계획</span>
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          💡 평일을 드래그하여 휴가 계획을 추가하거나, 기존 휴가 계획을 클릭하여 삭제할 수 있습니다.
        </div>
      </div>

      <CardContent className="p-4">
        {/* Two Month Calendar Display */}
        <div className="flex space-x-4">
          {renderMonth(currentDate, currentMonthDays, 0)}
          {renderMonth(nextMonth, nextMonthDays, 1)}
        </div>

        {/* 휴가 유형 선택 다이얼로그 */}
        <Dialog open={leaveTypeDialogOpen} onOpenChange={setLeaveTypeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>휴가 유형 선택</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                선택한 날짜에 어떤 종류의 휴가를 사용하시겠습니까?
              </p>
              <Select value={selectedLeaveType} onValueChange={(value: "full" | "half" | "quarter") => setSelectedLeaveType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">종일 휴가 (1일)</SelectItem>
                  <SelectItem value="half">반차 (0.5일)</SelectItem>
                  <SelectItem value="quarter">반반차 (0.25일)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLeaveTypeDialogOpen(false);
                    setPendingVacationPlan(null);
                    setSelectedLeaveType("full");
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleLeaveTypeConfirm}>
                  확인
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
