import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

interface CompactStatsBarProps {
  user?: User;
}

export default function CompactStatsBar({ user }: CompactStatsBarProps) {
  const { data: travelNews = [] } = useQuery({
    queryKey: ["/api/news/travel"],
  });

  const { data: holidayNews = [] } = useQuery({
    queryKey: ["/api/news/holidays"],
  });

  const remainingLeaves = user ? user.totalLeaves - user.usedLeaves : 0;

  return (
    <div className="bg-gradient-to-r from-korean-blue to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Stats Row */}
        <div className="flex flex-wrap items-center justify-between text-sm font-medium mb-2">
          <div className="flex items-center space-x-6">
            <span>올해 대한민국 공휴일: 총 <strong>67일</strong></span>
            <span className="hidden sm:inline">설 연휴: 2월 9일-12일 (<strong>4일</strong>)</span>
            <span className="hidden md:inline">추석: 9월 16일-18일 (<strong>3일</strong>)</span>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span>연차 1일: <strong className="text-vacation-green">3개</strong> 황금연휴</span>
            <span>연차 2일: <strong className="text-vacation-green">6개</strong> 황금연휴</span>
          </div>
        </div>
        
        {/* Scrolling News Feeds */}
        <div className="space-y-1">
          {/* Travel News */}
          <div className="flex items-center text-xs overflow-hidden">
            <span className="mr-3 font-medium flex-shrink-0">🌍 여행 소식:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap">
                {travelNews.map((news, index) => (
                  <span key={index}>
                    {news.title}
                    {index < travelNews.length - 1 && " • "}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Holiday Policy News */}
          <div className="flex items-center text-xs overflow-hidden">
            <span className="mr-3 font-medium flex-shrink-0">📅 공휴일 소식:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap">
                {holidayNews.map((news, index) => (
                  <span key={index}>
                    {news.title}
                    {index < holidayNews.length - 1 && " • "}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
