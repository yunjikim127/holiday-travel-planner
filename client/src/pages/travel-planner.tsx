import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CompactStatsBar from "@/components/compact-stats-bar";
import AnnualLeaveForm from "@/components/annual-leave-form";
import CustomHolidaysForm from "@/components/custom-holidays-form";
import DestinationSelector from "@/components/destination-selector";
import VacationRecommendations from "@/components/vacation-recommendations";
import VacationPlans from "@/components/vacation-plans";
import TravelCalendar from "@/components/travel-calendar";
import TravelInsights from "@/components/travel-insights";
import { Bell, UserCircle } from "lucide-react";

const CURRENT_USER_ID = 1;

export default function TravelPlanner() {
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date(2025, 6, 1)); // July 2025
  
  const { data: user } = useQuery({
    queryKey: ["/api/user", CURRENT_USER_ID],
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/user", CURRENT_USER_ID, "destinations"],
  });

  return (
    <div className="min-h-screen bg-gray-50 font-noto">
      {/* Header */}
      <header className="bg-red-600 shadow-sm border-b" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">🇰🇷 한국 공휴일 여행 플래너</h1>
              <span className="bg-red-700 text-white px-2 py-1 rounded text-xs font-medium" aria-label="2025년 버전">2025</span>
            </div>
            <nav className="flex items-center space-x-4" aria-label="사용자 메뉴">
              <a 
                href="https://www.myrealtrip.com/promotions/benefit"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse hover:animate-none"
                aria-label="특가 보러가기"
              >
✨ 여행 특가 보러가기 ✨
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Compact Stats Bar */}
      <CompactStatsBar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" role="main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar */}
          <aside className="lg:col-span-1 space-y-6" role="complementary" aria-label="사이드바">
            <section aria-labelledby="annual-leave-heading">
              <AnnualLeaveForm userId={CURRENT_USER_ID} user={user} />
            </section>
            
            <section aria-labelledby="custom-holidays-heading">
              <CustomHolidaysForm userId={CURRENT_USER_ID} />
            </section>
            
            {/* Main Calendar - mobile */}
            <section className="lg:hidden" aria-labelledby="calendar-heading">
              <TravelCalendar userId={CURRENT_USER_ID} destinations={destinations} onDateChange={setCurrentCalendarDate} />
            </section>
            
            <section aria-labelledby="destinations-heading">
              <DestinationSelector userId={CURRENT_USER_ID} />
            </section>
            
            <section aria-labelledby="recommendations-heading">
              <VacationRecommendations userId={CURRENT_USER_ID} destinations={destinations} />
            </section>
            
            <section aria-labelledby="vacation-plans-heading">
              <VacationPlans userId={CURRENT_USER_ID} />
            </section>
          </aside>

          {/* Main Calendar - Desktop */}
          <section className="hidden lg:block lg:col-span-2" aria-labelledby="main-calendar-heading">
            <TravelCalendar userId={CURRENT_USER_ID} destinations={destinations} onDateChange={setCurrentCalendarDate} />
            <TravelInsights 
              destinations={destinations} 
              currentMonth={currentCalendarDate.getMonth() + 1} 
              currentYear={currentCalendarDate.getFullYear()} 
            />
          </section>
        </div>
      </main>
    </div>
  );
}
