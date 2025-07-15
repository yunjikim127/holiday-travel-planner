import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { SelectedDestination, InsertVacationPlan } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VacationRecommendationsProps {
  userId: number;
  destinations: SelectedDestination[];
}

export default function VacationRecommendations({ userId, destinations }: VacationRecommendationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock recommendations based on Korean holidays and destinations
  const recommendations = [
    {
      id: 1,
      name: "어린이날 연휴",
      period: "5월 4일(토) ~ 5월 7일(화)",
      duration: "4일 연휴",
      leaveDays: 1,
      startDate: "2025-05-04",
      endDate: "2025-05-07",
      warning: destinations.find(d => d.countryCode === 'JP') ? "일본 골든위크와 겹침 주의" : null,
    },
    {
      id: 2,
      name: "한글날 연휴",
      period: "10월 7일(월) ~ 10월 11일(금)",
      duration: "5일 연휴",
      leaveDays: 2,
      startDate: "2025-10-07",
      endDate: "2025-10-11",
      warning: destinations.find(d => d.countryCode === 'TH') ? "태국 성수기 시작" : null,
    },
    {
      id: 3,
      name: "추석 연휴 확장",
      period: "10월 5일(일) ~ 10월 10일(금)",
      duration: "6일 연휴",
      leaveDays: 2,
      startDate: "2025-10-05",
      endDate: "2025-10-10",
      warning: null,
    },
  ];

  const createVacationPlanMutation = useMutation({
    mutationFn: async (plan: InsertVacationPlan) => {
      return apiRequest('POST', '/api/vacation-plans', plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'vacation-plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "휴가 계획이 추가되었습니다",
        description: "선택한 황금연휴가 나의 휴가 계획에 추가되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "휴가 계획 추가에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSelectRecommendation = (rec: typeof recommendations[0]) => {
    const vacationPlan: InsertVacationPlan = {
      userId,
      title: rec.name,
      startDate: rec.startDate,
      endDate: rec.endDate,
      leaveDaysUsed: rec.leaveDays,
      destinations: destinations.map(d => d.countryCode),
      notes: rec.warning || "추천 황금연휴",
    };

    createVacationPlanMutation.mutate(vacationPlan);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle id="recommendations-heading" className="flex items-center">
          <Lightbulb className="text-yellow-500 mr-2" size={20} aria-hidden="true" />
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
                onClick={() => handleSelectRecommendation(rec)}
                disabled={createVacationPlanMutation.isPending}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-bold border-0"
              >
                {createVacationPlanMutation.isPending ? "추가 중..." : "선택"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
