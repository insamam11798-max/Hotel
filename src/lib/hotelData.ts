export interface KPIItem {
  id: string;
  name: string;
  category: 'Rooms' | 'Financial' | 'F&B' | 'Operations' | 'Guest' | 'Commercial' | 'Workforce';
  actual: number;
  budget: number;
  priorYear: number;
  format: 'currency' | 'percent' | 'number' | 'ratio';
  unit?: string;
  description: string;
  goodDirection: 'up' | 'down';
}

export interface AttentionItem {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'Commercial' | 'F&B' | 'Operations' | 'Guest Experience' | 'Finance';
  estimatedImpact: string;
  estimatedImpactValue: number; // positive dollar savings or revenue gain
  evidence: string;
  rootCause: string;
  recommendedAction: string;
  status: 'Open' | 'In Progress' | 'Implemented' | 'Dismissed';
  assignee: string;
  dueDate: string;
}

export interface BenchmarkPeer {
  metric: string;
  myProperty: number;
  compSet: number;
  index: number; // MPI, ARI, or RGI
  rank: string;
  networkAvg: number;
  networkPercentile: number;
  format: 'currency' | 'percent' | 'index';
}

export interface FBAOutlet {
  name: string;
  type: string;
  covers: number;
  foodRev: number;
  bevRev: number;
  totalRev: number;
  foodCostPct: number;
  bevCostPct: number;
  payroll: number;
  profit: number;
  profitMargin: number;
}

export interface GlitchItem {
  id: string;
  type: string;
  subject: string;
  department: string;
  count: number;
  status: 'Closed' | 'Open' | 'Pending Parts';
  impactRating: string;
}

export const INITIAL_HOTEL_DATA = {
  property: {
    id: "prop-01",
    name: "Sample Hotel (fictional luxury 5★ resort)",
    location: "West Bay Lagoon, Doha, Qatar",
    totalRooms: 248,
    roomDaysInMonth: 7440,
    period: "September 2026",
    currency: "USD",
    currencySymbol: "$",
    hotelScore: 76,
    scoreVerdict: "Good Performance",
    scoreBenchmarkDelta: "+2.4 pts vs Luxury GCC Peer Avg (73.6)",
  },
  scores: [
    { area: "Rooms & Revenue", score: 82, target: 80, weight: 20, description: "Strong ADR resilience; slight room to capture occupancy" },
    { area: "Financial & GOP", score: 78, target: 80, weight: 25, description: "GOP margin at 39.0% vs budget 39.7%; solid flow-through" },
    { area: "Guest Experience", score: 84, target: 85, weight: 12, description: "8.83/10 Booking.com score; A/C glitch resolution prioritized" },
    { area: "Operational & Energy", score: 75, target: 75, weight: 8, description: "Chiller optimization needed; preventative maintenance on schedule" },
    { area: "Commercial & Distribution", score: 74, target: 80, weight: 13, description: "High Booking.com reliance; opportunity to shift to direct web" },
    { area: "F&B Operations", score: 71, target: 78, weight: 12, description: "Al Bahar food cost at 30.0% vs 27.5% target requires portion audit" },
    { area: "Workforce & Productivity", score: 69, target: 75, weight: 10, description: "Turnover at 1.8% MTD; banquet overtime requires flex staffing" },
  ],
  headlineKPIs: {
    occupancy: { actual: 74.06, budget: 75.00, priorYear: 71.80, unit: "%" },
    adr: { actual: 482.83, budget: 475.00, priorYear: 462.10, unit: "$" },
    revPar: { actual: 357.58, budget: 356.25, priorYear: 331.79, unit: "$" },
    totalRevenue: { actual: 4150790.38, budget: 4229379.60, priorYear: 3892100.00, unit: "$" },
    gop: { actual: 1618808.25, budget: 1680000.00, priorYear: 1473160.00, unit: "$" },
    gopMargin: { actual: 39.00, budget: 39.72, priorYear: 37.85, unit: "%" },
    trevPar: { actual: 557.90, budget: 568.46, priorYear: 523.13, unit: "$" },
    gopPar: { actual: 217.58, budget: 225.81, priorYear: 198.01, unit: "$" },
  },
  pnl: {
    revenues: [
      { name: "Room Revenue", actual: 2660387.69, budget: 2650500.00, priorYear: 2468500.00, share: 64.09 },
      { name: "Food & Beverage Revenue", actual: 1234548.10, budget: 1310000.00, priorYear: 1180000.00, share: 29.74 },
      { name: "Spa & Recreation", actual: 142100.00, budget: 155000.00, priorYear: 135000.00, share: 3.42 },
      { name: "Other Operating Departments", actual: 113754.59, budget: 113879.60, priorYear: 108600.00, share: 2.74 },
      { name: "Total Operating Revenue", actual: 4150790.38, budget: 4229379.60, priorYear: 3892100.00, share: 100.0 },
    ],
    departmentalExpenses: [
      { name: "Rooms Expenses & Payroll", actual: 426800.00, budget: 424000.00, priorYear: 410000.00, pctOfDeptRev: 16.04 },
      { name: "F&B Cost of Sales (30.0%)", actual: 370364.43, budget: 360250.00, priorYear: 336300.00, pctOfDeptRev: 30.00 },
      { name: "F&B Payroll & Other Expenses", actual: 481473.76, budget: 495000.00, priorYear: 462000.00, pctOfDeptRev: 39.00 },
      { name: "Other Operated Dept Expenses", actual: 118693.94, budget: 120129.60, priorYear: 114500.00, pctOfDeptRev: 46.40 },
      { name: "Total Departmental Profit", actual: 2753458.25, budget: 2830000.00, priorYear: 2569300.00, pctOfDeptRev: 66.34 },
    ],
    undistributedExpenses: [
      { name: "Administrative & General", actual: 265400.00, budget: 270000.00, priorYear: 255000.00, pctOfTotalRev: 6.39 },
      { name: "Information & Telecom Systems", actual: 56210.00, budget: 58000.00, priorYear: 52000.00, pctOfTotalRev: 1.35 },
      { name: "Sales & Marketing", actual: 228290.00, budget: 232000.00, priorYear: 220000.00, pctOfTotalRev: 5.50 },
      { name: "Property Operation & Maintenance (POM)", actual: 198450.00, budget: 202000.00, priorYear: 192000.00, pctOfTotalRev: 4.78 },
      { name: "Utilities / Energy & Water", actual: 210340.00, budget: 196000.00, priorYear: 184200.00, pctOfTotalRev: 5.07 },
      { name: "Total Undistributed Expenses", actual: 958690.00, budget: 958000.00, priorYear: 903200.00, pctOfTotalRev: 23.10 },
      { name: "Management Fees (Incentive & Base)", actual: 175960.00, budget: 192000.00, priorYear: 192940.00, pctOfTotalRev: 4.24 },
    ],
    gop: 1618808.25,
    gopMargin: 39.00,
  },
  benchmarks: [
    { metric: "Occupancy Rate", myProperty: 74.06, compSet: 75.58, index: 97.99, rank: "3 of 6", networkAvg: 73.10, networkPercentile: 58, format: "percent" },
    { metric: "Average Daily Rate (ADR)", myProperty: 482.83, compSet: 475.87, index: 101.46, rank: "2 of 6", networkAvg: 464.20, networkPercentile: 72, format: "currency" },
    { metric: "RevPAR", myProperty: 357.58, compSet: 359.65, index: 99.42, rank: "3 of 6", networkAvg: 339.33, networkPercentile: 68, format: "currency" },
    { metric: "TRevPAR", myProperty: 557.90, compSet: 548.20, index: 101.77, rank: "2 of 6", networkAvg: 526.40, networkPercentile: 74, format: "currency" },
    { metric: "GOPPAR", myProperty: 217.58, compSet: 212.40, index: 102.44, rank: "2 of 6", networkAvg: 201.10, networkPercentile: 69, format: "currency" },
    { metric: "F&B Capture Rate", myProperty: 68.20, compSet: 64.50, index: 105.74, rank: "1 of 6", networkAvg: 62.40, networkPercentile: 82, format: "percent" },
  ] as BenchmarkPeer[],
  compSetInfo: {
    name: "Luxury Waterfront Doha Comp Set",
    sampleSize: 6,
    networkSampleSize: 14,
    segment: "5-Star Luxury Resorts (GCC / Doha Bay)",
    methodology: "STR / CoStar aggregate data feed + Anonymous HotelPulse Network peer ratios (HMAC hashed, N>=5 min threshold)",
  },
  dailyTrend: [
    { day: "Sep 01", occ: 68.2, adr: 445, revpar: 303.5, compRevpar: 310 },
    { day: "Sep 05", occ: 82.4, adr: 510, revpar: 420.2, compRevpar: 415 },
    { day: "Sep 10", occ: 71.0, adr: 470, revpar: 333.7, compRevpar: 340 },
    { day: "Sep 15", occ: 79.5, adr: 495, revpar: 393.5, compRevpar: 388 },
    { day: "Sep 20", occ: 84.1, adr: 525, revpar: 441.5, compRevpar: 432 },
    { day: "Sep 25", occ: 73.8, adr: 480, revpar: 354.2, compRevpar: 360 },
    { day: "Sep 30", occ: 72.1, adr: 468, revpar: 337.4, compRevpar: 345 },
  ],
  outlets: [
    { name: "Al Bahar (All-day Dining)", type: "All-day International", covers: 4028, foodRev: 418696.90, bevRev: 57095.03, totalRev: 475791.93, foodCostPct: 30.04, bevCostPct: 22.01, payroll: 126945.77, profit: 194382.72, profitMargin: 40.85 },
    { name: "Sawa Oriental Grill", type: "Specialty Fine Dining", covers: 2890, foodRev: 312450.00, bevRev: 68200.00, totalRev: 380650.00, foodCostPct: 28.10, bevCostPct: 21.50, payroll: 98400.00, profit: 179500.00, profitMargin: 47.16 },
    { name: "Azure Pool Lounge", type: "Casual / Poolside", covers: 3450, foodRev: 195400.00, bevRev: 84300.00, totalRev: 279700.00, foodCostPct: 26.40, bevCostPct: 19.80, payroll: 72300.00, profit: 139100.00, profitMargin: 49.73 },
    { name: "Royal Palm Lobby Cafe", type: "Lounge & Pastry", covers: 5120, foodRev: 92300.00, bevRev: 45800.00, totalRev: 138100.00, foodCostPct: 24.20, bevCostPct: 18.50, payroll: 46500.00, profit: 60700.00, profitMargin: 43.95 },
  ] as FBAOutlet[],
  channels: [
    { name: "Booking.com (OTA)", share: 38.4, roomNights: 2116, revenue: 1021600, commissionRate: 18.2, status: "Excessive Leakage" },
    { name: "Direct Brand Web", share: 28.5, roomNights: 1570, revenue: 758200, commissionRate: 2.5, status: "Profitable" },
    { name: "Expedia Group (OTA)", share: 14.2, roomNights: 782, revenue: 377700, commissionRate: 17.5, status: "Monitored" },
    { name: "Corporate & GDS", share: 12.1, roomNights: 667, revenue: 321900, commissionRate: 8.0, status: "Contracted" },
    { name: "Direct Voice & Walk-In", share: 6.8, roomNights: 375, revenue: 180900, commissionRate: 0.0, status: "Highly Profitable" },
  ],
  glitches: [
    { id: "GL-01", type: "Maintenance", subject: "A/C cooling & noisy fan coils in Tower B", department: "Engineering", count: 14, status: "Open", impactRating: "High (TripAdvisor Risk)" },
    { id: "GL-02", type: "Housekeeping", subject: "Check-in cleanliness delay during 15:00 peak", department: "Rooms", count: 9, status: "Closed", impactRating: "Medium" },
    { id: "GL-03", type: "F&B Service", subject: "Room service breakfast delivery timing >40 min", department: "In-Room Dining", count: 8, status: "Closed", impactRating: "Medium" },
    { id: "GL-04", type: "Front Office", subject: "Pre-authorization release inquiry upon departure", department: "Front Desk", count: 6, status: "Closed", impactRating: "Low" },
  ] as GlitchItem[],
  attentionItems: [
    {
      id: "ATT-01",
      title: "Booking.com Commission Drift (+2.4% above budget share)",
      severity: "critical",
      category: "Commercial",
      estimatedImpact: "-$18,400 / month",
      estimatedImpactValue: 18400,
      evidence: "Booking.com accounted for 38.4% of room nights vs 32.0% budgeted. Average OTA commission paid was 18.2% ($185,930 total MTD), leading to $18.4k in avoidable channel distribution expense.",
      rootCause: "Late parity rate discrepancies on corporate booking days and non-fenced closed-user-group discounts on third-party extranet.",
      recommendedAction: "Activate member-only direct rates with complimentary airport transfer perk; enforce rate parity scraping across mobile channels.",
      status: "Open",
      assignee: "Revenue Director (S. Tariq)",
      dueDate: "Oct 20, 2026",
    },
    {
      id: "ATT-02",
      title: "Al Bahar Buffet Food Cost Variance (30.0% vs 27.5% target)",
      severity: "warning",
      category: "F&B",
      estimatedImpact: "-$10,400 / month",
      estimatedImpactValue: 10400,
      evidence: "Al Bahar food cost reached 30.04% ($125,803 cost on $418,697 food revenue). Standard recipe target was 27.50%, generating a $10.4k negative departmental cost variance across 4,028 covers.",
      rootCause: "Elevated waste in Sunday seafood buffet carvery and unhedged premium tiger prawn supplier spot pricing.",
      recommendedAction: "Shift to batch buffet replenishments after 21:00 and renegotiate quarterly contracts with primary Gulf seafood vendor.",
      status: "In Progress",
      assignee: "Executive Chef & F&B Manager",
      dueDate: "Oct 25, 2026",
    },
    {
      id: "ATT-03",
      title: "Utilities HVAC Power Draw Spike in Shoulder Season (+14.2% YoY)",
      severity: "warning",
      category: "Operations",
      estimatedImpact: "-$8,900 / month",
      estimatedImpactValue: 8900,
      evidence: "Energy and chiller consumption rose to $210,340 (+14.2% YoY and +$14,340 vs budget), despite moderate outdoor September temperatures (average 36°C vs 38°C LY).",
      rootCause: "Chiller loop secondary pumps ran 24/7 at 100% capacity on unassigned floors 8-12 due to manual override during August maintenance.",
      recommendedAction: "Restore automated building management system (BMS) setback schedule to modulate airflow when floor occupancy falls below 40%.",
      status: "Open",
      assignee: "Director of Engineering (M. Al-Kuwari)",
      dueDate: "Oct 18, 2026",
    },
    {
      id: "ATT-04",
      title: "Tower B A/C Noise & Thermostat Glitches (14 guest complaints)",
      severity: "critical",
      category: "Guest Experience",
      estimatedImpact: "Reputational (Target: 9.0 Rating)",
      estimatedImpactValue: 0,
      evidence: "14 of 37 logged guest glitches in September were related to Tower B air conditioning valve actuators. 3 Booking.com review scores cited room temperature instability.",
      rootCause: "Aging actuator valves in 24 deluxe sea-view suites causing erratic valve cycling and acoustic vibration.",
      recommendedAction: "Expedite replacement batch of 24 digital actuators; place impacted suites on priority room maintenance block during upcoming midweek lull.",
      status: "In Progress",
      assignee: "Chief Engineer & Rooms Director",
      dueDate: "Oct 22, 2026",
    },
  ] as AttentionItem[],
};
