import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { SelectedDestination } from "@shared/schema";

interface VacationRecommendationsProps {
  userId: number;
  destinations: SelectedDestination[];
}

export default function VacationRecommendations({ userId, destinations }: VacationRecommendationsProps) {
  // Mock recommendations based on Korean holidays and destinations
  const recommendations = [
    {
      id: 1,
      name: "어린이날 연휴",
      period: "5월 4일(토) ~ 5월 7일(화)",
      duration: "4일 연휴",
      leaveDays: 1,
      warning: destinations.find(d => d.countryCode === 'JP') ? "일본 골든위크와 겹침 주의" : null,
    },
    {
      id: 2,
      name: "한글날 연휴",
      period: "10월 7일(월) ~ 10월 11일(금)",
      duration: "5일 연휴",
      leaveDays: 2,
      warning: destinations.find(d => d.countryCode === 'TH') ? "태국 성수기 시작" : null,
    },
    {
      id: 3,
      name: "추석 연휴 확장",
      period: "9월 14일(토) ~ 9월 18일(수)",
      duration: "5일 연휴",
      leaveDays: 1,
      warning: null,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="text-yellow-500 mr-2" size={20} />
          추천 황금연휴
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => (
          <div key={rec.id} className="border border-vacation-green rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">{rec.name}</h4>
              <span className="bg-vacation-green text-white px-2 py-1 rounded text-xs">
                연차 {rec.leaveDays}일
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {rec.period} • {rec.duration}
            </p>
            <div className="flex justify-between items-center">
              {rec.warning ? (
                <span className="text-xs text-vacation-green font-medium">
                  {rec.warning}
                </span>
              ) : (
                <span className="text-xs text-gray-500">최적의 여행 시기</span>
              )}
              <Button
                size="sm"
                className="text-xs bg-korean-blue text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                선택
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
