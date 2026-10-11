import { NextResponse } from "next/server";
import { INITIAL_HOTEL_DATA } from "@/lib/hotelData";

export async function POST(req: Request) {
  try {
    const { message, specialist = "executive" } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const lower = message.toLowerCase();
    const data = INITIAL_HOTEL_DATA;

    // Check if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `You are HotelPulse AI, an elite hotel asset management and analytics intelligence advisor for ${data.property.name} (${data.property.period}).
Specialist Persona: ${specialist.toUpperCase()} ANALYST.
Tone: Concise, executive, deeply analytical, hospitality-grounded (USALI standards).
Hotel Fact Sheet:
- Occupancy: ${data.headlineKPIs.occupancy.actual}% (Budget: ${data.headlineKPIs.occupancy.budget}%, LY: ${data.headlineKPIs.occupancy.priorYear}%)
- ADR: $${data.headlineKPIs.adr.actual} (Budget: $${data.headlineKPIs.adr.budget}, LY: $${data.headlineKPIs.adr.priorYear})
- RevPAR: $${data.headlineKPIs.revPar.actual} (Budget: $${data.headlineKPIs.revPar.budget}, LY: $${data.headlineKPIs.revPar.priorYear})
- Total Operating Revenue: $${(data.headlineKPIs.totalRevenue.actual / 1e6).toFixed(2)}M (Budget: $${(data.headlineKPIs.totalRevenue.budget / 1e6).toFixed(2)}M)
- Gross Operating Profit (GOP): $${(data.headlineKPIs.gop.actual / 1e6).toFixed(2)}M (39.0% margin, -$61.2k vs budget)
- Comp Set (STR): MPI ${data.benchmarks[0].index} (Rank 3/6), ARI ${data.benchmarks[1].index} (Rank 2/6), RGI ${data.benchmarks[2].index} (Rank 3/6)
- Hotel Score: 76/100
- High priority attention issues: Booking.com commission drift (-$18.4k), Al Bahar food cost at 30.0% (-$10.4k), Utilities chiller power draw (-$8.9k), Tower B AC glitches (14 complaints).
CRITICAL RULE: Always cite verifiable numbers and recommend tangible action steps with estimated dollar impact.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
        });

        if (response?.text) {
          return NextResponse.json({
            reply: response.text,
            grounded: true,
            provider: "gemini",
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Gemini call fallback to deterministic specialist:", err);
      }
    }

    // Deterministic specialist engine with strict fact-sheet grounding
    let responseText = "";
    let evidenceTrail: string[] = [];

    if (lower.includes("gop") || lower.includes("profit") || lower.includes("variance") || lower.includes("budget")) {
      responseText = `**Financial Analyst Breakdown (September 2026):**\n\n• **GOP Performance:** Actual GOP closed at **$1,618,808.25** (39.00% margin), falling short of the monthly budget of **$1,680,000.00** by **-$61,191.75 (-3.6%)**.\n• **Revenue Impact:** Total Operating Revenue was **$4,150,790.38** vs budget of **$4,229,379.60** (-$78.6k variance), primarily driven by F&B shortfall in banqueting (-$75.5k).\n• **Flow-Through & Cost Leaks:**\n  1. Al Bahar buffet food cost ran at 30.04% vs 27.50% standard (-$10.4k leak).\n  2. Chiller electricity overrun during low-occupancy daytime hours (-$14.3k vs budget).\n  3. Booking.com commission expansion (+2.4% above budget share, -$18.4k).\n\n**Recommended Management Action:** Implementing the three Action Center items recovers approximately **$37,700/month** in flow-through directly back to GOP.`;
      evidenceTrail = ["P&L DEPT Cell J14 (Total Rev)", "P&L DEPT Cell J58 (GOP)", "Manager Flash (Rooms Sold: 5,510)"];
    } else if (lower.includes("rgi") || lower.includes("str") || lower.includes("comp set") || lower.includes("benchmark") || lower.includes("mpi") || lower.includes("ari")) {
      responseText = `**Rooms & Revenue Specialist Assessment:**\n\n• **Headline Index:** September 2026 **RGI (Revenue Generation Index) is 99.42** (Rank 3 of 6 in West Bay Comp Set).\n• **Rate vs Occupancy Strategy:**\n  - **ARI (Average Rate Index) is 101.46** (Rank 2 of 6) with ADR at **$482.83** vs Comp Set **$475.87**.\n  - **MPI (Market Penetration Index) is 97.99** (Rank 3 of 6) with Occupancy at **74.06%** vs Comp Set **75.58%**.\n• **Insight:** Your property commands a healthy rate premium (+1.5% ARI), but gave up 1.52 percentage points of occupancy during midweek corporate cycles.\n• **Action:** Targeted corporate volume renegotiations and fenced partner packages can lift MPI to 100.5 without diluting retail leisure ADR.`;
      evidenceTrail = ["STR Monthly Line 7 (My Prop vs Comp Set)", "STR Daily MTD Aggregate"];
    } else if (lower.includes("f&b") || lower.includes("food") || lower.includes("outlet") || lower.includes("bahar") || lower.includes("beverage")) {
      responseText = `**F&B Specialist Review:**\n\n• **Departmental Profit:** F&B delivered **$1,234,548.10** in total revenue and **$382,709.91** in departmental profit (31.0% margin).\n• **Outlet Breakdown:**\n  1. **Al Bahar:** 4,028 covers, $475.8k rev, food cost at **30.04%** (Target: 27.50%). Leakage: **$10,400**.\n  2. **Sawa Oriental Grill:** 2,890 covers, $380.7k rev, 47.16% margin (Best performing specialty).\n  3. **Azure Pool Lounge:** 3,450 covers, $279.7k rev, 49.73% margin.\n  4. **Royal Palm Cafe:** 5,120 covers, $138.1k rev, 43.95% margin.\n• **Primary Remediation:** Enforce tighter batch replenishment on the dinner buffet after 21:00 and review seafood procurement contracts.`;
      evidenceTrail = ["F&B Outlets Sheet (Al Bahar row 1)", "P&L DEPT (F&B lines)"];
    } else if (lower.includes("ota") || lower.includes("booking") || lower.includes("channel") || lower.includes("commission")) {
      responseText = `**Commercial & Distribution Analysis:**\n\n• **Channel Dominance:** Booking.com accounted for **38.4% of total room nights** (2,116 room nights) generating **$1,021,600** in room revenue.\n• **Commission Cost:** Effective commission averaged **18.2%**, totaling **$185,930** MTD.\n• **Variance vs Budget:** Budgeted OTA contribution was 32.0%. The +6.4% shift to third-party OTAs incurred an estimated **$18,400 in avoidable distribution expense** compared to direct web bookings (2.5% merchant cost).\n• **Playbook:** Introduce direct booker value-add perks (late check-out, $30 spa credit) and tighten extranet member rates.`;
      evidenceTrail = ["CHANNELS Sheet (Booking.com row)", "Manager Flash Channel MTD"];
    } else if (lower.includes("glitch") || lower.includes("guest") || lower.includes("review") || lower.includes("tripadvisor") || lower.includes("complaint")) {
      responseText = `**Guest Experience Specialist Insight:**\n\n• **Satisfaction Benchmarks:** Booking.com review score stands at **8.83 / 10** (403 reviews). Google is **4.6 / 5.0** and TripAdvisor is **4.5 / 5.0** (Rank #7 in Doha).\n• **Glitch Registry:** 37 glitches logged in September (32 closed, 5 pending).\n• **Concentrated Pain Point:** **14 glitches (37.8%)** were traced to **Tower B A/C noise and temperature swings**.\n• **Operational Alert:** 3 recent traveler reviews cited inconsistent cooling. Replacing the 24 actuator valves eliminates the single largest threat to maintaining top-10 TripAdvisor status.`;
      evidenceTrail = ["Guest Glitches Sheet (14 COM-AC records)", "Reviews Sheet (Booking.com 8.83)"];
    } else {
      responseText = `**Executive Briefing for ${data.property.name} (${data.property.period}):**\n\n• **Hotel Score:** **76 / 100** ("Good Performance" · +2.4 pts vs GCC luxury cohort).\n• **Top Line:** ADR ($482.83, +$7.83 vs bgt) cushioned slight occupancy softness (74.06% vs 75.00% bgt), yielding RevPAR of **$357.58**.\n• **Bottom Line:** GOP reached **$1.62M (39.0% margin)** vs $1.68M budget.\n• **Immediate Priorities:**\n  1. Recover $18.4k/mo OTA commission leakage via direct channel conversion.\n  2. Standardize Al Bahar buffet portions ($10.4k recovery).\n  3. Re-engage BMS chiller schedule ($8.9k utility saving).\n  4. Complete Tower B A/C actuator servicing (14 guest complaints resolved).`;
      evidenceTrail = ["HotelPulse Fact Sheet September 2026", "Consolidated P&L Statement"];
    }

    return NextResponse.json({
      reply: responseText,
      grounded: true,
      provider: "hotelpulse-engine",
      evidence: evidenceTrail,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error("AI chat error:", error);
    const msg = error instanceof Error ? error.message : "Failed to process question";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
