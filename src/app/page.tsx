"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Bot,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Send,
  Download,
  RefreshCw,
  Calendar,
  MapPin,
  Percent,
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { INITIAL_HOTEL_DATA, AttentionItem } from "@/lib/hotelData";

type TabType = "overview" | "benchmark" | "attention" | "ask" | "reports";

export default function HotelPulseApp() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [hotelData, setHotelData] = useState(INITIAL_HOTEL_DATA);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>(INITIAL_HOTEL_DATA.attentionItems);
  
  // Drill-down states
  const [selectedDrillDown, setSelectedDrillDown] = useState<"pnl" | "outlets" | "channels" | "glitches" | null>(null);

  // AI Chat state
  const [specialist, setSpecialist] = useState<string>("executive");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string; evidence?: string[]; timestamp: string }>>([
    {
      role: "ai",
      text: "Welcome to HotelPulse AI. I have reviewed the September 2026 monthly operating pack for Sample Hotel (5★ Doha). Occupancy finished at 74.06% with an ADR of $482.83, generating $1.62M in GOP (39.0% margin). How can I assist with your performance review?",
      evidence: ["Consolidated P&L Statement", "Manager Flash MTD"],
      timestamp: "10:00 AM",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Calculate Realized Savings
  const realizedSavings = attentionItems
    .filter((item) => item.status === "Implemented")
    .reduce((sum, item) => sum + item.estimatedImpactValue, 0);

  const potentialSavings = attentionItems.reduce((sum, item) => sum + item.estimatedImpactValue, 0);

  const openAttentionCount = attentionItems.filter((i) => i.status === "Open" || i.status === "In Progress").length;

  const toggleAttentionStatus = (id: string, newStatus: AttentionItem["status"]) => {
    setAttentionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isAiLoading) return;

    const userMsg = {
      role: "user" as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, specialist }),
      });
      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "ai",
            text: data.reply,
            evidence: data.evidence,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I analyzed the September 2026 pack. Our RGI is 99.42 with 101.46 ARI. We have $37.7k/mo in identified leakages in F&B, OTA commissions, and HVAC.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Parsing sheets: P&L DEPT, Manager Flash, STR Monthly, F&B Outlets, Reviews...");
    setTimeout(() => {
      setUploadStatus("Successfully validated 85 metrics across 12 sheets with 98% confidence. Updated to active view!");
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadStatus(null);
      }, 1500);
    }, 1200);
  };

  const exportReport = (format: "Excel" | "PDF" | "PowerPoint") => {
    // Generate downloadable file
    const content = `HotelPulse AI - Monthly Executive Report
Property: ${hotelData.property.name}
Period: ${hotelData.property.period}
Hotel Score: ${hotelData.property.hotelScore}/100
Occupancy: ${hotelData.headlineKPIs.occupancy.actual}%
ADR: $${hotelData.headlineKPIs.adr.actual}
RevPAR: $${hotelData.headlineKPIs.revPar.actual}
GOP: $${hotelData.headlineKPIs.gop.actual} (39.0% Margin)
Comp Set RGI: ${hotelData.benchmarks[2].index}

Action Center Status:
${attentionItems.map((a) => `- [${a.status}] ${a.title}: ${a.estimatedImpact}`).join("\n")}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HotelPulse-Report-September-2026.${format === "Excel" ? "xlsx" : format === "PDF" ? "pdf" : "pptx"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Slogan */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-inner">
                <Building2 className="h-5 w-5 text-slate-950 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white">HotelPulse<span className="text-emerald-400">AI</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    DEMO DATA
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Your hotel. Compared. Explained. Improved.
                </p>
              </div>
            </div>

            {/* Property & Period Selector */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-slate-100">{hotelData.property.name}</span>
                <span className="text-slate-500">|</span>
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">{hotelData.property.period}</span>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload Pack</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-800/80 pt-1 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-emerald-400 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("benchmark")}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "benchmark"
                  ? "border-emerald-400 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Benchmark & Comp Set</span>
            </button>

            <button
              onClick={() => setActiveTab("attention")}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap relative ${
                activeTab === "attention"
                  ? "border-emerald-400 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Attention</span>
              {openAttentionCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {openAttentionCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("ask")}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "ask"
                  ? "border-emerald-400 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <Bot className="h-4 w-4 text-emerald-400" />
              <span>Ask AI Specialist</span>
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                activeTab === "reports"
                  ? "border-emerald-400 text-emerald-400 font-semibold"
                  : "border-transparent text-slate-300 hover:text-white hover:border-slate-600"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* DESTINATION 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top Score & Headline Banner */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center space-x-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex flex-col items-center justify-center text-white shadow-md">
                    <span className="text-2xl font-black tracking-tight">{hotelData.property.hotelScore}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">/ 100</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-slate-900">Hotel Score: {hotelData.property.scoreVerdict}</h1>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Solid Month
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {hotelData.property.scoreBenchmarkDelta} · RevPAR index is 99.4 with rate resilience ($482.83 ADR)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Action items present <span className="font-semibold text-emerald-700">${potentialSavings.toLocaleString()}/mo</span> in identified margin recovery opportunities.
                  </p>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedDrillDown("pnl")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  P&L Statement
                </button>
                <button
                  onClick={() => setSelectedDrillDown("outlets")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  F&B Outlets ({hotelData.outlets.length})
                </button>
                <button
                  onClick={() => setSelectedDrillDown("channels")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Distribution Channels
                </button>
                <button
                  onClick={() => setSelectedDrillDown("glitches")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Guest Glitches ({hotelData.glitches.length})
                </button>
              </div>
            </div>

            {/* Key Performance Indicators Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Occupancy */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Occupancy</span>
                  <Percent className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{hotelData.headlineKPIs.occupancy.actual}%</span>
                  <span className="text-xs font-medium text-red-600 flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    -0.9% vs Bgt
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                  <span>Budget: {hotelData.headlineKPIs.occupancy.budget}%</span>
                  <span className="text-emerald-700">LY: {hotelData.headlineKPIs.occupancy.priorYear}% (+2.3%)</span>
                </div>
              </div>

              {/* ADR */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Average Daily Rate (ADR)</span>
                  <DollarSign className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">${hotelData.headlineKPIs.adr.actual}</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +$7.83 vs Bgt
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                  <span>Budget: ${hotelData.headlineKPIs.adr.budget}</span>
                  <span className="text-emerald-700">LY: ${hotelData.headlineKPIs.adr.priorYear} (+4.5%)</span>
                </div>
              </div>

              {/* RevPAR */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>RevPAR</span>
                  <TrendingUp className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">${hotelData.headlineKPIs.revPar.actual}</span>
                  <span className="text-xs font-medium text-emerald-600 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +$1.33 vs Bgt
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                  <span>Budget: ${hotelData.headlineKPIs.revPar.budget}</span>
                  <span className="text-emerald-700">LY: ${hotelData.headlineKPIs.revPar.priorYear} (+7.8%)</span>
                </div>
              </div>

              {/* Gross Operating Profit */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>GOP & Margin</span>
                  <Award className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">${(hotelData.headlineKPIs.gop.actual / 1e6).toFixed(2)}M</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    {hotelData.headlineKPIs.gopMargin.actual}%
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1.5">
                  <span>Bgt: ${(hotelData.headlineKPIs.gop.budget / 1e6).toFixed(2)}M</span>
                  <span>GOPPAR: ${hotelData.headlineKPIs.gopPar.actual}</span>
                </div>
              </div>
            </div>

            {/* Interactive Charts & Hotel Score Dimensions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">September RevPAR vs Comp Set Trend</h2>
                    <p className="text-xs text-slate-500">Daily performance tracking property RevPAR vs comp-set average</p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Opera & STR Daily Sync</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hotelData.dailyTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                      <Line type="monotone" dataKey="revpar" name="My Property ($)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="compRevpar" name="Comp Set Avg ($)" stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 7 Hotel Score Dimension Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900">Hotel Score Dimensions</h2>
                    <span className="text-xs font-semibold text-emerald-600">7 Pillars</span>
                  </div>
                  <div className="space-y-3">
                    {hotelData.scores.map((s, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">{s.area}</span>
                          <span className="font-bold text-slate-900">{s.score} <span className="text-slate-400 font-normal">/ {s.target}</span></span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              s.score >= 80 ? "bg-emerald-500" : s.score >= 70 ? "bg-teal-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Calculated against STR comp set, monthly budget targets, and prior-year historical flow-through.
                </div>
              </div>
            </div>

            {/* Departmental Revenue Waterfall */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-1">Total Operating Revenue Structure ($4.15M)</h2>
              <p className="text-xs text-slate-500 mb-4">Departmental contribution to total hotel gross revenues</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {hotelData.pnl.revenues.slice(0, 4).map((rev, i) => (
                  <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="text-xs text-slate-600 font-medium">{rev.name}</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">${(rev.actual / 1e6).toFixed(2)}M</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{rev.share.toFixed(1)}% of total</span>
                      <span className={rev.actual >= rev.budget ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
                        {rev.actual >= rev.budget ? "+On Budget" : "-Soft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DESTINATION 2: BENCHMARK & COMP SET */}
        {activeTab === "benchmark" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-900">{hotelData.compSetInfo.name}</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hotelData.compSetInfo.segment} · Sample Size: {hotelData.compSetInfo.sampleSize} luxury properties
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Confidential STR & Anonymous HotelPulse Network Ratios</span>
                </div>
              </div>

              {/* Benchmark Summary Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3">My Property</th>
                      <th className="py-2.5 px-3">Comp Set Avg</th>
                      <th className="py-2.5 px-3">Index (Score)</th>
                      <th className="py-2.5 px-3">Rank</th>
                      <th className="py-2.5 px-3">Network Cohort Avg</th>
                      <th className="py-2.5 px-3">Percentile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {hotelData.benchmarks.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">{b.metric}</td>
                        <td className="py-3 px-3">
                          {b.format === "percent" ? `${b.myProperty}%` : `$${b.myProperty.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {b.format === "percent" ? `${b.compSet}%` : `$${b.compSet.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              b.index >= 100 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {b.index.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-semibold">{b.rank}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {b.format === "percent" ? `${b.networkAvg}%` : `$${b.networkAvg.toFixed(2)}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${b.networkPercentile}%` }} />
                            </div>
                            <span className="text-xs text-slate-600">{b.networkPercentile}th</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Benchmark Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Average Rate Index</div>
                <div className="text-2xl font-black text-slate-900 mt-1">101.5 ARI</div>
                <p className="text-xs text-slate-600 mt-2">
                  Commanding a <span className="font-semibold text-emerald-700">+1.5% premium</span> over the direct luxury competitor set. Premium pricing power remains intact.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Market Penetration Index</div>
                <div className="text-2xl font-black text-amber-600 mt-1">98.0 MPI</div>
                <p className="text-xs text-slate-600 mt-2">
                  Occupancy reached 74.06% vs comp-set 75.58%. Opportunity to capture corporate volume during shoulder Tuesdays & Wednesdays.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">Revenue Generation Index</div>
                <div className="text-2xl font-black text-slate-900 mt-1">99.4 RGI</div>
                <p className="text-xs text-slate-600 mt-2">
                  RevPAR of $357.58 trails the comp-set average by $2.07. Balanced mix of rate and occupancy positioning.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DESTINATION 3: ATTENTION & ACTION CENTER */}
        {activeTab === "attention" && (
          <div className="space-y-6">
            {/* Header & Value Creation Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold">Action Center & Profit Leakage Recovery</h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {openAttentionCount} Active Items
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  Every recommendation is rooted in verified evidence from the September 2026 data pack with calculated dollar impacts.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 px-5 flex items-center space-x-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Identified Value</div>
                  <div className="text-xl font-black text-emerald-400">${potentialSavings.toLocaleString()}<span className="text-xs font-normal text-slate-300">/mo</span></div>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Realized to Date</div>
                  <div className="text-xl font-black text-white">${realizedSavings.toLocaleString()}<span className="text-xs font-normal text-slate-400">/mo</span></div>
                </div>
              </div>
            </div>

            {/* Attention Cards List */}
            <div className="space-y-4">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition ${
                    item.status === "Implemented"
                      ? "border-emerald-200 bg-emerald-50/20"
                      : item.severity === "critical"
                      ? "border-amber-300 hover:border-amber-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.severity === "critical"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Due: {item.dueDate}</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">{item.title}</h2>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                        {item.estimatedImpact}
                      </span>
                      {/* Status Dropdown */}
                      <select
                        value={item.status}
                        onChange={(e) => toggleAttentionStatus(item.id, e.target.value as AttentionItem["status"])}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border transition cursor-pointer ${
                          item.status === "Implemented"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : item.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-800 border-slate-300"
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Implemented">Implemented</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </div>
                  </div>

                  {/* Evidence & Root Cause */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Data Evidence Trail:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.evidence}</p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="font-semibold text-slate-700 flex items-center space-x-1 mb-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Prescribed Action Plan:</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.recommendedAction}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Root Cause: {item.rootCause}</span>
                    <span>Assignee: <strong className="text-slate-600">{item.assignee}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DESTINATION 4: ASK AI SPECIALIST */}
        {activeTab === "ask" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
              {/* Specialist Selector Bar */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-emerald-400" />
                  <span className="font-bold text-sm">HotelPulse Analyst Engine</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Grounded on September 2026 Pack
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Specialist:</span>
                  <select
                    value={specialist}
                    onChange={(e) => setSpecialist(e.target.value)}
                    className="bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="executive">Executive Analyst</option>
                    <option value="financial">Financial & GOP Analyst</option>
                    <option value="rooms">Rooms & STR Comp Set Analyst</option>
                    <option value="f&b">Food & Beverage Specialist</option>
                    <option value="commercial">Commercial & Channel Distribution</option>
                    <option value="guest">Guest Experience & Glitch Analyst</option>
                    <option value="advisor">Action & Value Advisor</option>
                  </select>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-2xl rounded-xl p-4 text-xs sm:text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-slate-900 text-white rounded-br-none"
                          : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>

                      {msg.evidence && msg.evidence.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Evidence:</span>
                          {msg.evidence.map((ev, evIdx) => (
                            <span
                              key={evIdx}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200"
                            >
                              {ev}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 w-fit">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
                    <span>Analyzing monthly ledger and calculating variance metrics...</span>
                  </div>
                )}
              </div>

              {/* Prompt Chips */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
                <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Suggested:</span>
                <button
                  onClick={() => handleSendChat("Explain the GOP variance vs budget this month")}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition"
                >
                  GOP variance vs budget
                </button>
                <button
                  onClick={() => handleSendChat("Why is our RGI slightly below 100?")}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition"
                >
                  Comp set RGI analysis
                </button>
                <button
                  onClick={() => handleSendChat("What is our OTA commission leakage and how do we fix it?")}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition"
                >
                  Booking.com commission leak
                </button>
                <button
                  onClick={() => handleSendChat("Which F&B outlets are dragging down departmental profit?")}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 whitespace-nowrap transition"
                >
                  F&B food cost leaks
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask any question about September 2026 numbers, P&L, comp set, or opportunities..."
                    className="flex-1 px-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !inputQuery.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition shadow-sm"
                  >
                    <span>Ask</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* DESTINATION 5: REPORTS BUILDER */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Executive Monthly Management Report</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Standardized 33-section hospitality intelligence report for owners, asset managers, and executive committee.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportReport("Excel")}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => exportReport("PowerPoint")}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Download className="h-3.5 w-3.5 text-blue-600" />
                    <span>Export PPTX</span>
                  </button>
                  <button
                    onClick={() => exportReport("PDF")}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Printable Deck View */}
              <div className="mt-6 border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-6 font-serif text-slate-800">
                <div className="border-b border-slate-300 pb-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-sans">Confidential Asset Management Review</div>
                  <h2 className="text-2xl font-bold font-sans text-slate-950 mt-1">{hotelData.property.name}</h2>
                  <div className="flex items-center space-x-4 text-xs font-sans text-slate-600 mt-2">
                    <span>Period: {hotelData.property.period}</span>
                    <span>·</span>
                    <span>Published: October 2026</span>
                    <span>·</span>
                    <span>Standard: USALI 11th Revised Edition</span>
                  </div>
                </div>

                {/* Section 1: Executive Summary */}
                <div className="space-y-2 font-sans">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    1. Executive Summary & Hotel Score
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    During September 2026, {hotelData.property.name} achieved an overall Hotel Score of <strong>76/100</strong>, ranking in the 68th percentile of regional 5-star luxury peers. Total operating revenue finished at <strong>${(hotelData.headlineKPIs.totalRevenue.actual / 1e6).toFixed(2)}M</strong> against a budget of <strong>${(hotelData.headlineKPIs.totalRevenue.budget / 1e6).toFixed(2)}M</strong>. Gross Operating Profit reached <strong>${(hotelData.headlineKPIs.gop.actual / 1e6).toFixed(2)}M (39.0% GOP margin)</strong>.
                  </p>
                </div>

                {/* Section 2: Comp Set & Rooms */}
                <div className="space-y-2 font-sans">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    2. STR Comp Set Indexation
                  </h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500">RevPAR Index (RGI)</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">99.4</div>
                      <div className="text-[11px] text-slate-500">Rank #3 of 6 hotels</div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500">Average Rate Index (ARI)</div>
                      <div className="text-lg font-bold text-emerald-700 mt-0.5">101.5</div>
                      <div className="text-[11px] text-emerald-600">Rate premium intact</div>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg">
                      <div className="text-slate-500">Market Penetration (MPI)</div>
                      <div className="text-lg font-bold text-amber-600 mt-0.5">98.0</div>
                      <div className="text-[11px] text-amber-700">74.06% occupancy</div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Action Center Recommendations */}
                <div className="space-y-2 font-sans">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                    3. Prioritized Value Creation & Margin Recovery ($37,700/mo)
                  </h3>
                  <div className="space-y-2 text-xs">
                    {attentionItems.map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg">
                        <div>
                          <strong className="text-slate-900">{a.title}</strong>
                          <div className="text-[11px] text-slate-500">{a.recommendedAction}</div>
                        </div>
                        <span className="font-bold text-red-600 whitespace-nowrap ml-4">{a.estimatedImpact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DRILL DOWN MODAL (P&L / Outlets / Channels / Glitches) */}
      {selectedDrillDown && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center space-x-2">
                <span>
                  {selectedDrillDown === "pnl" && "Consolidated P&L Statement (USALI)"}
                  {selectedDrillDown === "outlets" && "Food & Beverage Outlets Breakdown"}
                  {selectedDrillDown === "channels" && "Channel Mix & Distribution Costs"}
                  {selectedDrillDown === "glitches" && "Guest Glitches & Maintenance Log"}
                </span>
              </h2>
              <button
                onClick={() => setSelectedDrillDown(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {selectedDrillDown === "pnl" && (
                <div className="space-y-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                        <th className="py-2">Line Item</th>
                        <th className="py-2">Actual MTD</th>
                        <th className="py-2">Budget MTD</th>
                        <th className="py-2">Variance</th>
                        <th className="py-2">Prior Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td colSpan={5} className="py-2 px-1">OPERATING REVENUES</td>
                      </tr>
                      {hotelData.pnl.revenues.map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 text-slate-800">{r.name}</td>
                          <td className="py-2 font-semibold">${r.actual.toLocaleString()}</td>
                          <td className="py-2 text-slate-600">${r.budget.toLocaleString()}</td>
                          <td className={`py-2 font-semibold ${r.actual >= r.budget ? "text-emerald-700" : "text-red-600"}`}>
                            ${(r.actual - r.budget).toLocaleString()}
                          </td>
                          <td className="py-2 text-slate-500">${r.priorYear.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold text-slate-900">
                        <td colSpan={5} className="py-2 px-1">UNDISTRIBUTED EXPENSES</td>
                      </tr>
                      {hotelData.pnl.undistributedExpenses.map((u, i) => (
                        <tr key={i}>
                          <td className="py-2 text-slate-800">{u.name}</td>
                          <td className="py-2 font-semibold">${u.actual.toLocaleString()}</td>
                          <td className="py-2 text-slate-600">${u.budget.toLocaleString()}</td>
                          <td className={`py-2 font-semibold ${u.actual <= u.budget ? "text-emerald-700" : "text-red-600"}`}>
                            ${(u.budget - u.actual).toLocaleString()}
                          </td>
                          <td className="py-2 text-slate-500">${u.priorYear.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedDrillDown === "outlets" && (
                <div className="space-y-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                        <th className="py-2">Outlet</th>
                        <th className="py-2">Covers</th>
                        <th className="py-2">Revenue</th>
                        <th className="py-2">Food Cost %</th>
                        <th className="py-2">Bev Cost %</th>
                        <th className="py-2">Profit Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {hotelData.outlets.map((o, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-bold text-slate-900">{o.name}</td>
                          <td className="py-2.5">{o.covers.toLocaleString()}</td>
                          <td className="py-2.5 font-semibold">${o.totalRev.toLocaleString()}</td>
                          <td className={`py-2.5 font-semibold ${o.foodCostPct > 28 ? "text-red-600" : "text-emerald-700"}`}>
                            {o.foodCostPct.toFixed(1)}%
                          </td>
                          <td className="py-2.5 text-slate-600">{o.bevCostPct.toFixed(1)}%</td>
                          <td className="py-2.5 text-emerald-700 font-bold">{o.profitMargin.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedDrillDown === "channels" && (
                <div className="space-y-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                        <th className="py-2">Booking Channel</th>
                        <th className="py-2">Share %</th>
                        <th className="py-2">Room Nights</th>
                        <th className="py-2">Revenue</th>
                        <th className="py-2">Commission %</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {hotelData.channels.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-bold text-slate-900">{c.name}</td>
                          <td className="py-2.5 font-semibold">{c.share}%</td>
                          <td className="py-2.5">{c.roomNights.toLocaleString()}</td>
                          <td className="py-2.5 font-semibold">${c.revenue.toLocaleString()}</td>
                          <td className={`py-2.5 font-bold ${c.commissionRate > 15 ? "text-red-600" : "text-emerald-700"}`}>
                            {c.commissionRate.toFixed(1)}%
                          </td>
                          <td className="py-2.5 text-xs text-slate-600">{c.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedDrillDown === "glitches" && (
                <div className="space-y-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                        <th className="py-2">ID</th>
                        <th className="py-2">Department</th>
                        <th className="py-2">Glitch Issue</th>
                        <th className="py-2">Occurrences</th>
                        <th className="py-2">Impact Rating</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {hotelData.glitches.map((g, i) => (
                        <tr key={i}>
                          <td className="py-2.5 font-mono text-xs text-slate-500">{g.id}</td>
                          <td className="py-2.5 font-semibold text-slate-800">{g.department}</td>
                          <td className="py-2.5 text-slate-900">{g.subject}</td>
                          <td className="py-2.5 font-bold">{g.count}</td>
                          <td className="py-2.5 text-xs text-amber-700">{g.impactRating}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${g.status === "Open" ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                <span>Upload Monthly Data Pack</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Upload your monthly hotel reporting pack (e.g., <code>HotelPulse-SAMPLE-synthetic-2026-09.xlsx</code>, P&L, STR monthly, or Opera exports).
            </p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition cursor-pointer bg-slate-50">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block">
                <FileText className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-slate-700 block">Click to select or drag & drop</span>
                <span className="text-[11px] text-slate-500 mt-1 block">Supports .xlsx, .csv (USALI, Opera, STR format)</span>
              </label>
            </div>

            {uploadStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin" />
                <span>{uploadStatus}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setHotelData(INITIAL_HOTEL_DATA);
                  setAttentionItems(INITIAL_HOTEL_DATA.attentionItems);
                  setShowUploadModal(false);
                }}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Reset to Synthetic Demo Pack
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
