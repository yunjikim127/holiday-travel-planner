import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { SelectedDestination, TravelInsight } from "@shared/schema";

interface TravelInsightsProps {
  destinations: SelectedDestination[];
}

export default function TravelInsights({ destinations }: TravelInsightsProps) {
  const currentMonth = 5; // May
  const currentYear = 2024;

  // Fixed queries for travel insights
  const usInsights = useQuery<TravelInsight>({
    queryKey: ["/api/insights", "US", currentMonth, currentYear],
    enabled: destinations.some(d => d.countryCode === "US"),
  });

  const jpInsights = useQuery<TravelInsight>({
    queryKey: ["/api/insights", "JP", currentMonth, currentYear],
    enabled: destinations.some(d => d.countryCode === "JP"),
  });

  const thInsights = useQuery<TravelInsight>({
    queryKey: ["/api/insights", "TH", currentMonth, currentYear],
    enabled: destinations.some(d => d.countryCode === "TH"),
  });

  const vnInsights = useQuery<TravelInsight>({
    queryKey: ["/api/insights", "VN", currentMonth, currentYear],
    enabled: destinations.some(d => d.countryCode === "VN"),
  });

  const insights = destinations.map(destination => {
    let insight: TravelInsight | undefined;
    switch (destination.countryCode) {
      case "US":
        insight = usInsights.data;
        break;
      case "JP":
        insight = jpInsights.data;
        break;
      case "TH":
        insight = thInsights.data;
        break;
      case "VN":
        insight = vnInsights.data;
        break;
    }
    return { destination, insight };
  });

  const getScoreColor = (score: 'good' | 'fair' | 'poor' | 'low' | 'medium' | 'high') => {
    switch (score) {
      case 'good':
      case 'low':
        return 'text-vacation-green font-medium';
      case 'fair':
      case 'medium':
        return 'text-festival-amber font-medium';
      case 'poor':
      case 'high':
        return 'text-red-500 font-medium';
      default:
        return 'text-gray-600';
    }
  };

  if (destinations.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center text-gray-500">
          여행 목적지를 선택하면 상세한 여행 인사이트를 확인할 수 있습니다.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="text-festival-amber mr-2" size={20} />
          목적지별 여행 인사이트
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map(({ destination, insight }) => {
            if (!insight) return null;
            
            const country = destination;
            const emoji = destination.countryCode === 'JP' ? '🇯🇵' : 
                         destination.countryCode === 'TH' ? '🇹🇭' : 
                         destination.countryCode === 'US' ? '🇺🇸' : 
                         destination.countryCode === 'VN' ? '🇻🇳' : '🌍';

            return (
              <div key={destination.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{emoji}</span>
                  <div>
                    <h4 className="font-medium">{destination.countryName}</h4>
                    <p className="text-xs text-gray-500">
                      {currentMonth}월 여행 적합도: {insight.suitabilityScore}%
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">날씨</span>
                    <span className={getScoreColor(insight.weatherScore)}>
                      {insight.weather}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">항공료</span>
                    <span className={getScoreColor(insight.flightCostScore)}>
                      {insight.flightCost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">관광지 혼잡도</span>
                    <span className={getScoreColor(insight.crowdScore)}>
                      {insight.crowdLevel}
                    </span>
                  </div>
                  {insight.events.length > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                      <strong>주요 이벤트:</strong>{' '}
                      {insight.events.map(event => `${event.name} (${event.dates})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
