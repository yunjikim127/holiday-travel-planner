import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface AnnualLeaveFormProps {
  userId: number;
  user?: User;
}

export default function AnnualLeaveForm({ userId, user }: AnnualLeaveFormProps) {
  const [totalLeaves, setTotalLeaves] = useState(user?.totalLeaves || 15);
  const [usedLeaves, setUsedLeaves] = useState(user?.usedLeaves || 0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: async (data: { totalLeaves: number; usedLeaves: number }) => {
      return apiRequest("PATCH", `/api/user/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId] });
      toast({
        title: "연차 정보가 업데이트되었습니다",
        description: "변경된 연차 정보가 저장되었습니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "연차 정보 업데이트에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateUserMutation.mutate({ totalLeaves, usedLeaves });
  };

  const remainingLeaves = totalLeaves - usedLeaves;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle id="annual-leave-heading" className="flex items-center text-base">
          <CalendarCheck className="text-vacation-green mr-2" size={16} aria-hidden="true" />
          연차 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="totalLeaves" className="text-xs font-medium text-gray-700 mb-1 block">
              총 연차
            </Label>
            <Input
              id="totalLeaves"
              type="number"
              value={totalLeaves}
              onChange={(e) => setTotalLeaves(parseInt(e.target.value) || 0)}
              min="0"
              max="25"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="usedLeaves" className="text-xs font-medium text-gray-700 mb-1 block">
              사용 연차
            </Label>
            <Input
              id="usedLeaves"
              type="number"
              value={usedLeaves}
              onChange={(e) => setUsedLeaves(parseInt(e.target.value) || 0)}
              min="0"
              max={totalLeaves}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-2 rounded-md">
          <p className="text-xs text-blue-700 font-medium">
            남은 연차: {remainingLeaves}일
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateUserMutation.isPending}
          className="w-full h-8 text-sm"
        >
          {updateUserMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}