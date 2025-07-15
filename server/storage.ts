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
    // Korean holidays for 2025 (첨부 이미지 기준 정확한 관공서 공휴일)
    const koreanHolidays: Holiday[] = [
      { date: "2025-01-01", name: "신정", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-28", name: "설날(연휴)", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-29", name: "설날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-01-30", name: "설날(연휴)", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-03-01", name: "삼일절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-03-03", name: "대체공휴일(삼일절)", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-05", name: "어린이날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-05", name: "부처님오신날", type: "religious", country: "South Korea", countryCode: "KR" },
      { date: "2025-05-06", name: "대체공휴일(부처님오신날)", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-06-06", name: "현충일", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-08-15", name: "광복절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-03", name: "개천절", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-06", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-07", name: "추석", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-08", name: "대체공휴일(추석)", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-10-09", name: "한글날", type: "public", country: "South Korea", countryCode: "KR" },
      { date: "2025-12-25", name: "기독탄신일", type: "public", country: "South Korea", countryCode: "KR" },
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
    const getMonthlyInsights = (country: string, monthNum: number) => {
      const monthData = {
        'JP': {
          1: { weather: '추위, 설 연휴', weatherScore: 'fair', flightCost: '높음', events: [{ name: '신정 연휴', dates: '1/1-3' }] },
          2: { weather: '추위, 매화 개화', weatherScore: 'fair', flightCost: '보통', events: [{ name: '매화축제', dates: '2월 중순' }] },
          3: { weather: '봄 시작, 벚꽃 준비', weatherScore: 'good', flightCost: '높음', events: [{ name: '벚꽃 개화 시작', dates: '3월 말' }] },
          4: { weather: '벚꽃 만개', weatherScore: 'good', flightCost: '매우 높음', events: [{ name: '벚꽃축제', dates: '4월 전체' }] },
          5: { weather: '완벽한 날씨', weatherScore: 'good', flightCost: '매우 높음', events: [{ name: '골든위크', dates: '4/29-5/5' }] },
          6: { weather: '장마 시작', weatherScore: 'fair', flightCost: '보통', events: [{ name: '수국축제', dates: '6월 중순' }] },
          7: { weather: '무더위, 여름축제', weatherScore: 'fair', flightCost: '높음', events: [{ name: '기온축제', dates: '7월 중순' }] },
          8: { weather: '무더위 절정', weatherScore: 'poor', flightCost: '높음', events: [{ name: '오봉축제', dates: '8월 중순' }] },
          9: { weather: '태풍 시즌', weatherScore: 'fair', flightCost: '보통', events: [{ name: '가을축제', dates: '9월 말' }] },
          10: { weather: '가을 단풍', weatherScore: 'good', flightCost: '높음', events: [{ name: '단풍축제', dates: '10월 전체' }] },
          11: { weather: '선선한 가을', weatherScore: 'good', flightCost: '보통', events: [{ name: '국화축제', dates: '11월 중순' }] },
          12: { weather: '겨울 시작', weatherScore: 'fair', flightCost: '높음', events: [{ name: '일루미네이션', dates: '12월 전체' }] }
        },
        'TH': {
          1: { weather: '건기, 완벽한 날씨', weatherScore: 'good', flightCost: '높음', events: [{ name: '신정축제', dates: '1/1' }] },
          2: { weather: '건기, 매우 좋음', weatherScore: 'good', flightCost: '높음', events: [{ name: '마카부차', dates: '2월 중순' }] },
          3: { weather: '더워지기 시작', weatherScore: 'good', flightCost: '보통', events: [{ name: '코끼리축제', dates: '3월 중순' }] },
          4: { weather: '매우 더움', weatherScore: 'fair', flightCost: '보통', events: [{ name: '송크란', dates: '4/13-15' }] },
          5: { weather: '우기 시작', weatherScore: 'fair', flightCost: '낮음', events: [{ name: '로켓축제', dates: '5월 중순' }] },
          6: { weather: '우기', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '과일축제', dates: '6월 말' }] },
          7: { weather: '우기 절정', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '촛불축제', dates: '7월 중순' }] },
          8: { weather: '우기', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '어머니날', dates: '8/12' }] },
          9: { weather: '우기 끝', weatherScore: 'fair', flightCost: '보통', events: [{ name: '수상축제', dates: '9월 말' }] },
          10: { weather: '건기 시작', weatherScore: 'good', flightCost: '보통', events: [{ name: '베지터리안축제', dates: '10월 중순' }] },
          11: { weather: '완벽한 날씨', weatherScore: 'good', flightCost: '높음', events: [{ name: '로이크라통', dates: '11월 보름달' }] },
          12: { weather: '건기, 성수기', weatherScore: 'good', flightCost: '매우 높음', events: [{ name: '신년준비축제', dates: '12월 말' }] }
        },
        'VN': {
          1: { weather: '건기, 서늘함', weatherScore: 'good', flightCost: '높음', events: [{ name: '테트준비', dates: '1월 말' }] },
          2: { weather: '테트 시즌', weatherScore: 'good', flightCost: '매우 높음', events: [{ name: '테트(구정)', dates: '2월 초' }] },
          3: { weather: '봄날씨', weatherScore: 'good', flightCost: '보통', events: [{ name: '꽃축제', dates: '3월 중순' }] },
          4: { weather: '완벽한 날씨', weatherScore: 'good', flightCost: '보통', events: [{ name: '흉왕기념일', dates: '4/6' }] },
          5: { weather: '더워지기 시작', weatherScore: 'fair', flightCost: '낮음', events: [{ name: '노동절', dates: '5/1' }] },
          6: { weather: '우기 시작', weatherScore: 'fair', flightCost: '낮음', events: [{ name: '여름축제', dates: '6월 중순' }] },
          7: { weather: '우기, 더움', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '가우다이축제', dates: '7월 말' }] },
          8: { weather: '우기 절정', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '유령의 달', dates: '8월 전체' }] },
          9: { weather: '우기 끝', weatherScore: 'fair', flightCost: '보통', events: [{ name: '국경일', dates: '9/2' }] },
          10: { weather: '건기 시작', weatherScore: 'good', flightCost: '보통', events: [{ name: '추수축제', dates: '10월 중순' }] },
          11: { weather: '완벽한 날씨', weatherScore: 'good', flightCost: '높음', events: [{ name: '달팟축제', dates: '11월 보름달' }] },
          12: { weather: '건기, 성수기', weatherScore: 'good', flightCost: '높음', events: [{ name: '크리스마스', dates: '12/25' }] }
        },
        'US': {
          1: { weather: '겨울, 추위', weatherScore: 'poor', flightCost: '낮음', events: [{ name: '신정', dates: '1/1' }] },
          2: { weather: '겨울 끝', weatherScore: 'fair', flightCost: '낮음', events: [{ name: '대통령의날', dates: '2월 3주' }] },
          3: { weather: '봄 시작', weatherScore: 'good', flightCost: '보통', events: [{ name: '봄방학', dates: '3월 중순' }] },
          4: { weather: '완벽한 봄', weatherScore: 'good', flightCost: '높음', events: [{ name: '벚꽃축제', dates: '4월 초' }] },
          5: { weather: '따뜻한 봄', weatherScore: 'good', flightCost: '높음', events: [{ name: '현충일', dates: '5월 마지막주' }] },
          6: { weather: '여름 시작', weatherScore: 'good', flightCost: '높음', events: [{ name: '졸업시즌', dates: '6월 전체' }] },
          7: { weather: '여름 성수기', weatherScore: 'good', flightCost: '매우 높음', events: [{ name: '독립기념일', dates: '7/4' }] },
          8: { weather: '무더위', weatherScore: 'fair', flightCost: '높음', events: [{ name: '여름휴가철', dates: '8월 전체' }] },
          9: { weather: '가을 시작', weatherScore: 'good', flightCost: '보통', events: [{ name: '노동절', dates: '9월 첫주' }] },
          10: { weather: '가을 단풍', weatherScore: 'good', flightCost: '높음', events: [{ name: '할로윈', dates: '10/31' }] },
          11: { weather: '쌀쌀한 가을', weatherScore: 'fair', flightCost: '보통', events: [{ name: '추수감사절', dates: '11월 4주' }] },
          12: { weather: '겨울 시작', weatherScore: 'fair', flightCost: '매우 높음', events: [{ name: '크리스마스', dates: '12/25' }] }
        }
      };

      const defaultData = { weather: '보통', weatherScore: 'fair', flightCost: '보통', events: [] };
      return monthData[country]?.[monthNum] || defaultData;
    };

    const monthlyData = getMonthlyInsights(countryCode, month);
    const countryNames = {
      'JP': '일본',
      'TH': '태국', 
      'VN': '베트남',
      'US': '미국',
      'FR': '프랑스',
      'IT': '이탈리아'
    };

    const flightCostScore = monthlyData.flightCost === '매우 높음' ? 'high' : 
                           monthlyData.flightCost === '높음' ? 'high' : 
                           monthlyData.flightCost === '낮음' ? 'low' : 'medium';

    const crowdScore = flightCostScore === 'high' ? 'high' : 
                       flightCostScore === 'low' ? 'low' : 'medium';

    const suitabilityScore = monthlyData.weatherScore === 'good' ? 85 :
                             monthlyData.weatherScore === 'fair' ? 65 : 45;

    return {
      countryCode,
      countryName: countryNames[countryCode] || countryCode,
      month,
      year,
      suitabilityScore,
      weather: monthlyData.weather,
      weatherScore: monthlyData.weatherScore as 'good' | 'fair' | 'poor',
      flightCost: monthlyData.flightCost,
      flightCostScore: flightCostScore as 'low' | 'medium' | 'high',
      crowdLevel: monthlyData.flightCost,
      crowdScore: crowdScore as 'low' | 'medium' | 'high',
      events: monthlyData.events
    };
  }
}

export const storage = new MemStorage();
