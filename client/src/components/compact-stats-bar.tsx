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
          <div className="flex flex-col space-y-2 text-white">
            <span className="text-white">2025년 대한민국 총 공휴일: <strong className="text-yellow-300">16일</strong></span>
            <div className="text-xs text-white">
              <div>주요 연휴 기간:</div>
              <div>1. 설 연휴: 1월 28일-30일 (<strong className="text-yellow-300">3일</strong>)</div>
              <div>2. 추석 연휴: 10월 6일-8일 (<strong className="text-yellow-300">3일</strong>)</div>
            </div>
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
