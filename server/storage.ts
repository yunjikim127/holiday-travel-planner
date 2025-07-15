import { 
  users, 
  customHolidays, 
  selectedDestinations, 
  vacationPlans,
  type User, 
  type InsertUser,
  type CustomHoliday,
  type InsertCustomHoliday,
  type SelectedDestination,
  type InsertDestination,
  type VacationPlan,
  type InsertVacationPlan,
  type Holiday,
  type NewsItem,
  type TravelInsight
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Custom holidays
  getCustomHolidays(userId: number): Promise<CustomHoliday[]>;
  createCustomHoliday(holiday: InsertCustomHoliday): Promise<CustomHoliday>;
  deleteCustomHoliday(id: number): Promise<void>;

  // Destinations
  getSelectedDestinations(userId: number): Promise<SelectedDestination[]>;
  addDestination(destination: InsertDestination): Promise<SelectedDestination>;
  removeDestination(userId: number, countryCode: string): Promise<void>;

  // Vacation plans
  getVacationPlans(userId: number): Promise<VacationPlan[]>;
  createVacationPlan(plan: InsertVacationPlan): Promise<VacationPlan>;
  updateVacationPlan(id: number, updates: Partial<InsertVacationPlan>): Promise<VacationPlan>;
  deleteVacationPlan(id: number): Promise<void>;

  // External data operations
  getHolidays(countryCode: string, year: number): Promise<Holiday[]>;
  getTravelNews(): Promise<NewsItem[]>;
  getHolidayNews(): Promise<NewsItem[]>;
  getTravelInsights(countryCode: string, month: number, year: number): Promise<TravelInsight>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private customHolidays: Map<number, CustomHoliday> = new Map();
  private selectedDestinations: Map<number, SelectedDestination> = new Map();
  private vacationPlans: Map<number, VacationPlan> = new Map();
  private currentUserId = 1;
  private currentCustomHolidayId = 1;
  private currentDestinationId = 1;
  private currentVacationPlanId = 1;

  constructor() {
    // Create a default user
    this.users.set(1, {
      id: 1,
      username: "user1",
      totalLeaves: 15,
      usedLeaves: 3,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = ++this.currentUserId;
    const user: User = { 
      ...insertUser, 
      id,
      totalLeaves: insertUser.totalLeaves ?? 15,
      usedLeaves: insertUser.usedLeaves ?? 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser: User = { 
      ...user, 
      ...updates,
      totalLeaves: updates.totalLeaves ?? user.totalLeaves,
      usedLeaves: updates.usedLeaves ?? user.usedLeaves
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getCustomHolidays(userId: number): Promise<CustomHoliday[]> {
    return Array.from(this.customHolidays.values()).filter(h => h.userId === userId);
  }

  async createCustomHoliday(holiday: InsertCustomHoliday): Promise<CustomHoliday> {
    const id = ++this.currentCustomHolidayId;
    const newHoliday: CustomHoliday = { ...holiday, id };
    this.customHolidays.set(id, newHoliday);
    return newHoliday;
  }

  async deleteCustomHoliday(id: number): Promise<void> {
    this.customHolidays.delete(id);
  }

  async getSelectedDestinations(userId: number): Promise<SelectedDestination[]> {
    return Array.from(this.selectedDestinations.values()).filter(d => d.userId === userId);
  }

  async addDestination(destination: InsertDestination): Promise<SelectedDestination> {
    const id = ++this.currentDestinationId;
    const newDestination: SelectedDestination = { ...destination, id };
    this.selectedDestinations.set(id, newDestination);
    return newDestination;
  }

  async removeDestination(userId: number, countryCode: string): Promise<void> {
    const destination = Array.from(this.selectedDestinations.values())
      .find(d => d.userId === userId && d.countryCode === countryCode);
    if (destination) {
      this.selectedDestinations.delete(destination.id);
    }
  }

  async getVacationPlans(userId: number): Promise<VacationPlan[]> {
    return Array.from(this.vacationPlans.values()).filter(p => p.userId === userId);
  }

  async createVacationPlan(plan: InsertVacationPlan): Promise<VacationPlan> {
    const id = ++this.currentVacationPlanId;
    const newPlan: VacationPlan = { 
      ...plan, 
      id,
      destinations: plan.destinations as string[],
      isSelected: plan.isSelected ?? false
    };
    this.vacationPlans.set(id, newPlan);
    return newPlan;
  }

  async updateVacationPlan(id: number, updates: Partial<InsertVacationPlan>): Promise<VacationPlan> {
    const plan = this.vacationPlans.get(id);
    if (!plan) throw new Error("Vacation plan not found");
    
    const updatedPlan: VacationPlan = { 
      ...plan, 
      ...updates,
      destinations: (updates.destinations as string[]) ?? plan.destinations
    };
    this.vacationPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async deleteVacationPlan(id: number): Promise<void> {
    this.vacationPlans.delete(id);
  }

  async getHolidays(countryCode: string, year: number): Promise<Holiday[]> {
    // Korean holidays for 2025
    const koreanHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-28", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-29", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-30", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-03-01", name: "삼일절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-01", name: "근로자의 날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-05", name: "어린이날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-12", name: "부처님 오신날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-06-06", name: "현충일", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-08-15", name: "광복절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-03", name: "개천절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-06", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-07", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-08", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-09", name: "한글날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-12-25", name: "성탄절", type: "public", country: "South Korea", countryCode: "KR" },
    ];

    // Japanese holidays for 2025
    const japaneseHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-01-13", name: "성인의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-02-11", name: "건국기념일", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-02-23", name: "천황탄생일", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-03-20", name: "춘분의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-04-29", name: "쇼와의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-05-03", name: "헌법기념일", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-05-04", name: "녹색의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-05-05", name: "어린이날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-05-06", name: "대체휴일", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-07-21", name: "바다의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-08-11", name: "산의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-09-15", name: "경로의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-09-23", name: "추분의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-10-13", name: "스포츠의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-11-03", name: "문화의 날", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2025-11-23", name: "근로감사의 날", type: "public", country: "Japan", countryCode: "JP" },
    ];

    // Thai holidays for 2025
    const thaiHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-02-12", name: "마카부차", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2025-04-06", name: "차크리 왕조 기념일", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-04-13", name: "송크란 축제", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-04-14", name: "송크란 축제", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-04-15", name: "송크란 축제", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-05-01", name: "노동절", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-05-04", name: "대관식 기념일", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-05-12", name: "위사카부차", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2025-07-28", name: "국왕 탄생일", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-08-11", name: "아살라부차", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2025-08-12", name: "어머니날", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-10-13", name: "라마 9세 기념일", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-10-23", name: "출라롱콘 대왕 기념일", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-12-05", name: "아버지날", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-12-10", name: "헌법절", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2025-12-31", name: "섣달그믐", type: "public", country: "Thailand", countryCode: "TH" },
    ];

    // Vietnamese holidays for 2025
    const vietnameseHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-01-29", name: "테트 (구정)", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-01-30", name: "테트 (구정)", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-01-31", name: "테트 (구정)", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-02-01", name: "테트 (구정)", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-02-02", name: "테트 (구정)", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-04-06", name: "흉왕 기념일", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-04-30", name: "해방절", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-05-01", name: "노동절", type: "public", country: "Vietnam", countryCode: "VN" },
      { date: "2025-05-12", name: "부처님 오신 날", type: "religious", country: "Vietnam", countryCode: "VN" },
      { date: "2025-09-02", name: "국경일", type: "public", country: "Vietnam", countryCode: "VN" },
    ];

    // US holidays for 2025
    const usHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-01-20", name: "마틴 루터 킹 데이", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-02-17", name: "대통령의 날", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-05-26", name: "현충일", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-06-19", name: "준틴스", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-07-04", name: "독립기념일", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-09-01", name: "노동절", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-10-13", name: "콜럼버스 데이", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-11-11", name: "재향군인의 날", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-11-27", name: "추수감사절", type: "public", country: "United States", countryCode: "US" },
      { date: "2025-12-25", name: "크리스마스", type: "public", country: "United States", countryCode: "US" },
    ];

    const holidayMap: { [key: string]: Holiday[] } = {
      'KR': koreanHolidays,
      'JP': japaneseHolidays,
      'TH': thaiHolidays,
      'VN': vietnameseHolidays,
      'US': usHolidays,
    };

    return holidayMap[countryCode] || [];
  }

  async getTravelNews(): Promise<NewsItem[]> {
    return [
      {
        title: "2025년 7월 국내 여행지 추천 TOP 11 - 보령 머드축제와 수국 명소",
        url: "https://brunch.co.kr/@qrssa/1094",
        publishedAt: "2025-07-15T10:00:00Z",
        source: "브런치"
      },
      {
        title: "김포 애기봉 스타벅스 북한 뷰 카페로 인기 급상승",
        url: "https://www.traveltimes.co.kr/",
        publishedAt: "2025-07-14T15:30:00Z",
        source: "여행신문"
      },
      {
        title: "2025년 하반기 크루즈 여행 가격 총정리 - 부산-후쿠오카 3박4일",
        url: "https://hiro.song67.co.kr/entry/2025%EB%85%84-%ED%95%9C%EA%B5%AD-%EC%B6%9C%EB%B0%9C-%ED%81%AC%EB%A3%A8%EC%A6%88-%EC%97%AC%ED%96%89-%EA%B0%80%EA%B2%A9-%EC%B4%9D%EC%A0%95%EB%A6%AC",
        publishedAt: "2025-07-13T09:15:00Z",
        source: "여행정보"
      },
      {
        title: "AI 기술 활용한 맞춤형 여행 서비스 확산",
        url: "https://www.tripstore.kr/blog/2025년-월별-해외-여행지-추천-나라별-여행하기-좋은-시",
        publishedAt: "2025-07-12T14:20:00Z",
        source: "트립스토어"
      },
      {
        title: "여행업계 하나투어 1위 유지, 외국계 업체 질주",
        url: "https://www.tour.go.kr/",
        publishedAt: "2025-07-11T11:45:00Z",
        source: "관광지식정보시스템"
      }
    ];
  }

  async getHolidayNews(): Promise<NewsItem[]> {
    return [
      {
        title: "2025년 119일 쉰다·공휴일 68일…3일 이상 연휴 6번",
        url: "https://www.newsspace.kr/news/article.html?no=2538",
        publishedAt: "2025-07-15T14:00:00Z",
        source: "뉴스스페이스"
      },
      {
        title: "2025년 10월 황금연휴 최대 10일 가능 - 효율적 연차 활용법",
        url: "https://superkts.com/day/holiday/2025",
        publishedAt: "2025-07-14T16:30:00Z",
        source: "공휴일 정보"
      },
      {
        title: "어린이날·부처님오신날 19년 만에 겹쳐 5월 6일 대체휴일 적용",
        url: "https://publicholidays.co.kr/ko/2025-dates/",
        publishedAt: "2025-07-13T10:20:00Z",
        source: "공휴일 달력"
      },
      {
        title: "2025년 설날 연휴 20년 만에 9일 황금연휴 가능",
        url: "https://sendbee.co.kr/archive/2025년-공휴일-및-연차-쓰기-좋은-날-총정리/",
        publishedAt: "2025-07-12T13:15:00Z",
        source: "센드비"
      },
      {
        title: "대체휴일 정책으로 2025년 모든 공휴일 평일 배치",
        url: "https://www.korea.kr/",
        publishedAt: "2025-07-11T09:45:00Z",
        source: "대한민국 정책브리핑"
      }
    ];
  }

  async getTravelInsights(countryCode: string, month: number, year: number): Promise<TravelInsight> {
    const insights: { [key: string]: TravelInsight } = {
      'JP': {
        countryCode: 'JP',
        countryName: '일본',
        month,
        year,
        suitabilityScore: 85,
        weather: '매우 좋음',
        weatherScore: 'good',
        flightCost: '높음 (골든위크)',
        flightCostScore: 'high',
        crowdLevel: '매우 높음',
        crowdScore: 'high',
        events: [
          { name: '골든위크', dates: '4/29-5/5' },
          { name: '도쿄 카츠도 축제', dates: '5/18-19' }
        ]
      },
      'TH': {
        countryCode: 'TH',
        countryName: '태국',
        month,
        year,
        suitabilityScore: 65,
        weather: '우기 시작',
        weatherScore: 'fair',
        flightCost: '보통',
        flightCostScore: 'medium',
        crowdLevel: '낮음',
        crowdScore: 'low',
        events: [
          { name: '로켓 페스티벌', dates: '5/11-13' },
          { name: '부처님 오신날', dates: '5/22' }
        ]
      }
    };

    return insights[countryCode] || {
      countryCode,
      countryName: countryCode,
      month,
      year,
      suitabilityScore: 70,
      weather: '보통',
      weatherScore: 'fair',
      flightCost: '보통',
      flightCostScore: 'medium',
      crowdLevel: '보통',
      crowdScore: 'medium',
      events: []
    };
  }
}

export const storage = new MemStorage();
