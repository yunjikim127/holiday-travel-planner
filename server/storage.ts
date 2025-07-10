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
    // Korean holidays for 2024
    const koreanHolidays: Holiday[] = [
      { date: "2024-01-01", name: "신정", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-02-09", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-02-10", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-02-11", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-02-12", name: "설날 대체공휴일", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-03-01", name: "삼일절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-05-01", name: "근로자의 날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-05-05", name: "어린이날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-05-06", name: "어린이날 대체공휴일", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-05-15", name: "부처님 오신날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-06-06", name: "현충일", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-08-15", name: "광복절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-09-16", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-09-17", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-09-18", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-10-03", name: "개천절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-10-09", name: "한글날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2024-12-25", name: "성탄절", type: "public", country: "South Korea", countryCode: "KR" },
    ];

    // Japanese holidays for 2024
    const japaneseHolidays: Holiday[] = [
      { date: "2024-01-01", name: "元日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-01-08", name: "成人の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-02-11", name: "建国記念の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-02-12", name: "建国記念の日 振替休日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-02-23", name: "天皇誕生日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-03-20", name: "春分の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-04-29", name: "昭和の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-05-03", name: "憲法記念日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-05-04", name: "みどりの日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-05-05", name: "こどもの日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-05-06", name: "振替休日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-07-15", name: "海の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-08-11", name: "山の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-08-12", name: "山の日 振替休日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-09-16", name: "敬老の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-09-22", name: "秋分の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-09-23", name: "秋分の日 振替休日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-10-14", name: "スポーツの日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-11-03", name: "文化の日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-11-04", name: "文化の日 振替休日", type: "public", country: "Japan", countryCode: "JP" },
      { date: "2024-11-23", name: "勤労感謝の日", type: "public", country: "Japan", countryCode: "JP" },
    ];

    // Thai holidays for 2024
    const thaiHolidays: Holiday[] = [
      { date: "2024-01-01", name: "วันขึ้นปีใหม่", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-02-24", name: "วันมาฆบูชา", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2024-04-06", name: "วันจักรี", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-04-13", name: "วันสงกรานต์", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-04-14", name: "วันสงกรานต์", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-04-15", name: "วันสงกรานต์", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-05-01", name: "วันแรงงานแห่งชาติ", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-05-04", name: "วันฉัตรมงคล", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-05-22", name: "วันวิสาขบูชา", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2024-07-20", name: "วันอาสาฬหบูชา", type: "religious", country: "Thailand", countryCode: "TH" },
      { date: "2024-07-28", name: "วันเฉลิมพระชนมพรรษา", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-08-12", name: "วันแม่แห่งชาติ", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-10-13", name: "วันคล้ายวันสวรรคต", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-10-23", name: "วันปิยมหาราช", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-12-05", name: "วันพ่อแห่งชาติ", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-12-10", name: "วันรัฐธรรมนูญ", type: "public", country: "Thailand", countryCode: "TH" },
      { date: "2024-12-31", name: "วันสิ้นปี", type: "public", country: "Thailand", countryCode: "TH" },
    ];

    const holidayMap: { [key: string]: Holiday[] } = {
      'KR': koreanHolidays,
      'JP': japaneseHolidays,
      'TH': thaiHolidays,
    };

    return holidayMap[countryCode] || [];
  }

  async getTravelNews(): Promise<NewsItem[]> {
    return [
      {
        title: "일본 벚꽃 개화 예상일 발표 (3월 말)",
        url: "#",
        publishedAt: "2024-02-15T10:00:00Z",
        source: "여행 뉴스"
      },
      {
        title: "태국 비자 면제 연장 확정",
        url: "#",
        publishedAt: "2024-02-14T15:30:00Z",
        source: "아시아 투데이"
      },
      {
        title: "유럽 항공료 여름 시즌 15% 인상",
        url: "#",
        publishedAt: "2024-02-13T09:15:00Z",
        source: "항공 뉴스"
      },
      {
        title: "베트남 다낭 직항편 증편",
        url: "#",
        publishedAt: "2024-02-12T14:20:00Z",
        source: "여행업계"
      },
      {
        title: "제주항공 동남아 노선 확대",
        url: "#",
        publishedAt: "2024-02-11T11:45:00Z",
        source: "항공 소식"
      }
    ];
  }

  async getHolidayNews(): Promise<NewsItem[]> {
    return [
      {
        title: "2024년 어린이날 대체공휴일 적용 확정",
        url: "#",
        publishedAt: "2024-01-20T14:00:00Z",
        source: "정책 뉴스"
      },
      {
        title: "근로자의 날 토요일 겹침으로 연휴 효과 감소",
        url: "#",
        publishedAt: "2024-01-18T16:30:00Z",
        source: "노동부"
      },
      {
        title: "개천절 화요일로 3일 연휴 가능",
        url: "#",
        publishedAt: "2024-01-15T10:20:00Z",
        source: "캘린더 분석"
      },
      {
        title: "한글날 수요일 배치",
        url: "#",
        publishedAt: "2024-01-12T13:15:00Z",
        source: "공휴일 정책"
      },
      {
        title: "추석 연휴 최대 6일 가능",
        url: "#",
        publishedAt: "2024-01-10T09:45:00Z",
        source: "연휴 계획"
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
