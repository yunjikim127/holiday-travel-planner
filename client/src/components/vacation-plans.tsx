import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2 } from "lucide-react";
import { VacationPlan } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatKoreanDate } from "@/lib/holidays";

interface VacationPlansProps {
  userId: number;
}

export default function VacationPlans({ userId }: VacationPlansProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vacationPlans = [], isLoading } = useQuery<VacationPlan[]>({
    queryKey: ['/api/user', userId, 'vacation-plans'],
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
        description: "휴가 계획 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const calculateVacationDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="text-blue-500 mr-2" size={20} />
            나의 휴가 계획
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle id="vacation-plans-heading" className="flex items-center text-base">
          <Calendar className="text-blue-500 mr-2" size={16} aria-hidden="true" />
          나의 휴가 계획
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {vacationPlans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            아직 등록된 휴가 계획이 없습니다.
          </p>
        ) : (
          vacationPlans.map((plan) => {
            const totalDays = calculateVacationDays(plan.startDate, plan.endDate);
            const startDate = new Date(plan.startDate);
            const endDate = new Date(plan.endDate);
            
            return (
              <div key={plan.id} className="border border-blue-200 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{plan.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      연차 {plan.leaveDaysUsed}일
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteVacationPlanMutation.mutate(plan.id!)}
                      disabled={deleteVacationPlanMutation.isPending}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {formatKoreanDate(startDate)} ~ {formatKoreanDate(endDate)} • {totalDays}일간
                </p>
                {plan.destinations && plan.destinations.length > 0 && (
                  <p className="text-xs text-blue-600 mb-1">
                    목적지: {plan.destinations.join(', ')}
                  </p>
                )}
                {plan.notes && (
                  <p className="text-xs text-gray-500">
                    {plan.notes}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}