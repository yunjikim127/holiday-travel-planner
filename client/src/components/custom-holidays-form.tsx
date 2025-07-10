import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CustomHoliday } from "@shared/schema";

interface CustomHolidaysFormProps {
  userId: number;
}

export default function CustomHolidaysForm({ userId }: CustomHolidaysFormProps) {
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customHolidays = [] } = useQuery<CustomHoliday[]>({
    queryKey: ["/api/user", userId, "custom-holidays"],
  });

  const addHolidayMutation = useMutation({
    mutationFn: async (data: { userId: number; date: string; name: string }) => {
      return apiRequest("POST", "/api/custom-holidays", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "custom-holidays"] });
      setNewDate("");
      setNewName("");
      toast({
        title: "회사 휴무일이 추가되었습니다",
        description: "새로운 휴무일이 캘린더에 반영됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "휴무일 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/custom-holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "custom-holidays"] });
      toast({
        title: "휴무일이 삭제되었습니다",
        description: "해당 휴무일이 캘린더에서 제거됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "휴무일 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleAdd = () => {
    if (!newDate || !newName.trim()) {
      toast({
        title: "입력 오류",
        description: "날짜와 휴무일 이름을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    addHolidayMutation.mutate({
      userId,
      date: newDate,
      name: newName.trim(),
    });
  };

  const handleDelete = (id: number) => {
    deleteHolidayMutation.mutate(id);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <PlusCircle className="text-purple-500 mr-2" size={16} />
          회사 휴무일 추가
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="space-y-2">
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            type="text"
            placeholder="휴무일 이름 (예: 창립기념일)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-sm"
          />
          <Button
            onClick={handleAdd}
            disabled={addHolidayMutation.isPending}
            className="w-full h-8 text-sm"
          >
            {addHolidayMutation.isPending ? "추가 중..." : "추가"}
          </Button>
        </div>

        <div className="space-y-2">
          {customHolidays.map((holiday) => (
            <div
              key={holiday.id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs"
            >
              <span>
                {holiday.name} ({new Date(holiday.date).toLocaleDateString('ko-KR')})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(holiday.id)}
                disabled={deleteHolidayMutation.isPending}
                className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
          {customHolidays.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-2">
              등록된 회사 휴무일이 없습니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
