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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarCheck className="text-vacation-green mr-2" size={20} />
          연차 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="totalLeaves" className="block text-sm font-medium text-gray-700 mb-2">
            총 연차 일수
          </Label>
          <Input
            id="totalLeaves"
            type="number"
            value={totalLeaves}
            onChange={(e) => setTotalLeaves(parseInt(e.target.value) || 0)}
            min="0"
            max="25"
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="usedLeaves" className="block text-sm font-medium text-gray-700 mb-2">
            사용한 연차
          </Label>
          <Input
            id="usedLeaves"
            type="number"
            value={usedLeaves}
            onChange={(e) => setUsedLeaves(parseInt(e.target.value) || 0)}
            min="0"
            max={totalLeaves}
            className="w-full"
          />
        </div>
        <div className="bg-vacation-green bg-opacity-10 p-3 rounded-md">
          <p className="text-sm text-vacation-green font-medium">
            남은 연차: {remainingLeaves}일
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateUserMutation.isPending}
          className="w-full bg-vacation-green hover:bg-vacation-green/90 text-white font-medium"
        >
          {updateUserMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
