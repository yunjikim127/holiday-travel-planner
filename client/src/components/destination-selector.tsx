import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Globe, Search, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SelectedDestination } from "@shared/schema";
import { countries, popularDestinations } from "@/lib/countries";

interface DestinationSelectorProps {
  userId: number;
}

export default function DestinationSelector({ userId }: DestinationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: selectedDestinations = [] } = useQuery<SelectedDestination[]>({
    queryKey: ["/api/user", userId, "destinations"],
  });

  const addDestinationMutation = useMutation({
    mutationFn: async (data: { userId: number; countryCode: string; countryName: string }) => {
      return apiRequest("POST", "/api/destinations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "destinations"] });
      toast({
        title: "목적지가 추가되었습니다",
        description: "선택된 국가의 공휴일 정보가 캘린더에 표시됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "목적지 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const removeDestinationMutation = useMutation({
    mutationFn: async (countryCode: string) => {
      return apiRequest("DELETE", `/api/user/${userId}/destinations/${countryCode}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", userId, "destinations"] });
      toast({
        title: "목적지가 제거되었습니다",
        description: "해당 국가의 정보가 캘린더에서 제거됩니다.",
      });
    },
    onError: () => {
      toast({
        title: "오류가 발생했습니다",
        description: "목적지 제거에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const filteredCountries = countries.filter(country =>
    country.nameKr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCountrySelected = (countryCode: string) => {
    return selectedDestinations.some(dest => dest.countryCode === countryCode);
  };

  const handleAddDestination = (countryCode: string, countryName: string) => {
    if (isCountrySelected(countryCode)) {
      toast({
        title: "이미 선택된 목적지입니다",
        description: "해당 국가는 이미 선택되어 있습니다.",
        variant: "destructive",
      });
      return;
    }

    addDestinationMutation.mutate({
      userId,
      countryCode,
      countryName,
    });
  };

  const handleRemoveDestination = (countryCode: string) => {
    removeDestinationMutation.mutate(countryCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="text-festival-amber mr-2" size={20} />
          여행 목적지
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Popular Destinations Quick Select */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">인기 목적지</p>
          <div className="grid grid-cols-2 gap-2">
            {popularDestinations.map((country) => (
              <Button
                key={country.code}
                variant="outline"
                size="sm"
                onClick={() => handleAddDestination(country.code, country.nameKr)}
                disabled={isCountrySelected(country.code) || addDestinationMutation.isPending}
                className={`p-2 text-sm transition-colors border-2 ${
                  isCountrySelected(country.code)
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-black border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {country.emoji} {country.nameKr}
              </Button>
            ))}
          </div>
        </div>

        {/* Country Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <Input
            type="text"
            placeholder="국가명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="max-h-40 overflow-y-auto space-y-1">
            {filteredCountries.slice(0, 10).map((country) => (
              <Button
                key={country.code}
                variant="ghost"
                size="sm"
                onClick={() => handleAddDestination(country.code, country.nameKr)}
                disabled={isCountrySelected(country.code) || addDestinationMutation.isPending}
                className={`w-full justify-start text-sm border-2 ${
                  isCountrySelected(country.code)
                    ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-black border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                {country.emoji} {country.nameKr} ({country.name})
              </Button>
            ))}
          </div>
        )}

        {/* Selected Destinations */}
        <div className="space-y-2">
          {selectedDestinations.map((destination) => {
            const country = countries.find(c => c.code === destination.countryCode);
            const colorClass = destination.countryCode === 'JP' 
              ? 'bg-festival-amber bg-opacity-10' 
              : destination.countryCode === 'TH'
              ? 'bg-vacation-green bg-opacity-10'
              : 'bg-korean-blue bg-opacity-10';

            return (
              <div
                key={destination.id}
                className={`flex justify-between items-center p-3 rounded-md ${colorClass}`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{country?.emoji}</span>
                  <span className="font-medium">{destination.countryName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDestination(destination.countryCode)}
                  disabled={removeDestinationMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white p-1 font-bold border-0"
                >
                  <X size={16} />
                </Button>
              </div>
            );
          })}
          {selectedDestinations.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              선택된 목적지가 없습니다
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
