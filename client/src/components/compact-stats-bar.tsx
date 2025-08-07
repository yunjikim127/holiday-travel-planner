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
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

        
        {/* Scrolling News Feeds */}
        <div className="space-y-1">
          {/* Travel News */}
          <div className="flex items-center text-xs overflow-hidden text-white">
            <span className="mr-3 font-bold flex-shrink-0 text-white">🌍 여행 소식:</span>
            <div className="overflow-hidden flex-1">
              <div className="animate-scroll whitespace-nowrap text-white">
                {travelNews.map((news, index) => (
                  <a 
                    key={index} 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-300 underline"
                  >
                    {news.title}
                    {index < travelNews.length - 1 && " • "}
                  </a>
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
                  <a 
                    key={index} 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-yellow-300 underline"
                  >
                    {news.title}
                    {index < holidayNews.length - 1 && " • "}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
