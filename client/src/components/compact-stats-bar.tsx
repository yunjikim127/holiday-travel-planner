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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Main Stats Row */}
        <div className="flex flex-wrap items-center justify-between text-sm font-bold mb-2 text-white">
          <div className="flex items-center space-x-6 text-white">
            <span className="text-white">올해 대한민국 공휴일: 총 <strong className="text-yellow-300">67일</strong></span>
            <span className="hidden sm:inline text-white">설 연휴: 2월 9일-12일 (<strong className="text-yellow-300">4일</strong>)</span>
            <span className="hidden md:inline text-white">추석: 9월 16일-18일 (<strong className="text-yellow-300">3일</strong>)</span>
          </div>
          <div className="flex items-center space-x-4 text-xs text-white">
            <span className="text-white">연차 1일: <strong className="text-yellow-300">3개</strong> 황금연휴</span>
            <span className="text-white">연차 2일: <strong className="text-yellow-300">6개</strong> 황금연휴</span>
          </div>
        </div>
        
        {/* Scrolling News Feeds */}
        <div className="space-y-1">
          {/* Travel News */}
          <div className="flex items-center text-xs overflow-hidden text-white">
            <span className="mr-3 font-bold flex-shrink-0 text-white">🌍 여행 소식:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-white">
                {travelNews.map((news, index) => (
                  <span key={index} className="text-white">
                    {news.title}
                    {index < travelNews.length - 1 && " • "}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Holiday Policy News */}
          <div className="flex items-center text-xs overflow-hidden text-white">
            <span className="mr-3 font-bold flex-shrink-0 text-white">📅 공휴일 소식:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-white">
                {holidayNews.map((news, index) => (
                  <span key={index} className="text-white">
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
