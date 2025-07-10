import { useQuery } from "@tanstack/react-query";
import CompactStatsBar from "@/components/compact-stats-bar";
import AnnualLeaveForm from "@/components/annual-leave-form";
import CustomHolidaysForm from "@/components/custom-holidays-form";
import DestinationSelector from "@/components/destination-selector";
import VacationRecommendations from "@/components/vacation-recommendations";
import TravelCalendar from "@/components/travel-calendar";
import TravelInsights from "@/components/travel-insights";
import { Bell, UserCircle } from "lucide-react";

const CURRENT_USER_ID = 1;

export default function TravelPlanner() {
  const { data: user } = useQuery({
    queryKey: ["/api/user", CURRENT_USER_ID],
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ["/api/user", CURRENT_USER_ID, "destinations"],
  });

  return (
    <div className="min-h-screen bg-gray-50 font-noto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">🇰🇷 한국 공휴일 여행 플래너</h1>
              <span className="bg-korean-blue text-white px-2 py-1 rounded text-xs font-medium">2024</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Bell size={20} />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <UserCircle size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Stats Bar */}
      <CompactStatsBar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AnnualLeaveForm userId={CURRENT_USER_ID} user={user} />
            <CustomHolidaysForm userId={CURRENT_USER_ID} />
            <DestinationSelector userId={CURRENT_USER_ID} />
            <VacationRecommendations userId={CURRENT_USER_ID} destinations={destinations} />
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <TravelCalendar userId={CURRENT_USER_ID} destinations={destinations} />
            <TravelInsights destinations={destinations} />
          </div>
        </div>
      </div>
    </div>
  );
}
