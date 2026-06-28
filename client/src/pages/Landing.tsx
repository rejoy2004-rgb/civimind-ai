import React from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "../lib/trpc.ts";
import { AuroraHero } from "../components/ui/hero-2.tsx";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Award, 
  MapPin, 
  ArrowRight, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  BarChart3, 
  Map as MapIcon,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  Activity,
  DollarSign,
  Camera,
  CheckSquare,
  Shield,
  Zap,
  Globe,
  Coins,
  ArrowUpRight,
  MessageSquare,
  Sparkle
} from "lucide-react";
import LeafletMap from "../components/Map.tsx";

// Mock sandbox issues centered on Bengaluru
const MOCK_SANDBOX_ISSUES = [
  {
    id: "mock-1",
    title: "Large Pothole near Silk Board Junction",
    category: "Road Damage",
    address: "Silk Board Junction, Hosur Rd, Bengaluru, Karnataka 560068",
    latitude: 12.9176,
    longitude: 77.6244,
    severity: "High (9/10)",
    severityValue: 9,
    priorityScore: "9.4/10",
    confidence: "98.4%",
    safetyRisk: "High Public Safety Risk. Immediate repair recommended due to heavy commuter traffic and increased accident probability.",
    assignedDepartment: "Bruhat Bengaluru Mahanagara Palike (BBMP) - Road Infrastructure Division",
    estimatedCost: "₹38,500",
    resolutionTimeline: "48 Hours",
    progressStep: 2, // 1: Submitted, 2: AI Triaged, 3: Verified, 4: Dispatched, 5: Resolved
    status: "In Progress",
    description: "Gemini detected significant road surface deterioration caused by repeated heavy vehicle movement. The pothole occupies nearly 35% of the traffic lane, creating a high accident risk for two-wheelers.",
    upvotes: 27,
    imagePlaceholder: "🚗",
  },
  {
    id: "mock-2",
    title: "Major Water Leakage",
    category: "Water Leakage",
    address: "Indiranagar 100 Feet Road, Hal 2nd Stage, Bengaluru, Karnataka 560038",
    latitude: 12.9719,
    longitude: 77.6412,
    severity: "High (8/10)",
    severityValue: 8,
    priorityScore: "8.7/10",
    confidence: "96.5%",
    safetyRisk: "Substantial drinking water wastage and road surface erosion. Minor local traffic congestion near Indiranagar commercial hub.",
    assignedDepartment: "Bangalore Water Supply and Sewerage Board (BWSSB)",
    estimatedCost: "₹18,200",
    resolutionTimeline: "24 Hours",
    progressStep: 3, // Verified
    status: "Reported",
    description: "A major water pipe burst has occurred under the footpath on Indiranagar 100 Feet Road, causing continuous clean water flooding across the adjacent road.",
    upvotes: 18,
    imagePlaceholder: "💧",
  },
  {
    id: "mock-3",
    title: "Illegal Garbage Dump",
    category: "Garbage",
    address: "Koramangala 5th Block, Bengaluru, Karnataka 560095",
    latitude: 12.9348,
    longitude: 77.6189,
    severity: "Medium (7/10)",
    severityValue: 7,
    priorityScore: "7.9/10",
    confidence: "95.2%",
    safetyRisk: "Hazardous biological debris blocking public pedestrian walkway and attracting stray animals.",
    assignedDepartment: "Bruhat Bengaluru Mahanagara Palike (BBMP) - Solid Waste Management",
    estimatedCost: "₹12,000",
    resolutionTimeline: "36 Hours",
    progressStep: 4, // Dispatched
    status: "In Progress",
    description: "Large pile of unchecked commercial and household plastic waste dumped illegally on the street corner. Spreading bad odor in Koramangala residential sector.",
    upvotes: 41,
    imagePlaceholder: "🗑️",
  },
  {
    id: "mock-4",
    title: "Streetlights Not Working",
    category: "Streetlight",
    address: "Whitefield Main Road, Bengaluru, Karnataka 560066",
    latitude: 12.9698,
    longitude: 77.7499,
    severity: "Medium (6/10)",
    severityValue: 6,
    priorityScore: "6.8/10",
    confidence: "94.8%",
    safetyRisk: "Extremely poor visibility on high-speed corridor during night hours, creating safety concerns for women and pedestrians.",
    assignedDepartment: "Bruhat Bengaluru Mahanagara Palike (BBMP) - Electrical Division",
    estimatedCost: "₹8,500",
    resolutionTimeline: "72 Hours",
    progressStep: 5, // Resolved
    status: "Resolved",
    description: "A stretch of 8 streetlights on Whitefield Main Road has been completely dark for three consecutive nights, likely due to a short circuit in the local distribution line.",
    upvotes: 13,
    imagePlaceholder: "💡",
  },
];

// Continuous live feed messages
const LIVE_ACTIVITIES = [
  { text: "Road repaired near Silk Board Junction", type: "success", location: "Bengaluru", time: "Just now" },
  { text: "Water leakage verified near Indiranagar", type: "info", location: "Bengaluru", time: "2 mins ago" },
  { text: "Citizen @karan_dev earned +120 XP", type: "award", location: "Koramangala", time: "5 mins ago" },
  { text: "BBMP dispatched crew to Whitefield Main Rd", type: "dispatch", location: "Whitefield", time: "7 mins ago" },
  { text: "Streetlights restored on Outer Ring Rd", type: "success", location: "Bengaluru", time: "11 mins ago" },
  { text: "New pothole reported near Indiranagar Metro", type: "new", location: "Indiranagar", time: "14 mins ago" },
  { text: "Garbage cleared from Koramangala 5th Block", type: "success", location: "Koramangala", time: "19 mins ago" },
];

// Helper to animate count-up numbers
const AnimatedCounter: React.FC<{ value: number; decimals?: number; duration?: number; prefix?: string; suffix?: string }> = ({ 
  value, 
  decimals = 0, 
  duration = 1200,
  prefix = "",
  suffix = ""
}) => {
  const [count, setCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const end = value;
    if (start === end) return;

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress * (2 - progress); // ease out quad
      const current = ease * (end - start) + start;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isVisible]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

// --- PRESET DEMOS FOR LIVE AI TRIAGE SANDBOX ---
const PRESET_DEMOS = [
  {
    id: "preset-pothole",
    name: "Asphalt Pothole",
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600",
    emoji: "🛣️",
    lat: 12.9279,
    lng: 77.6271,
    result: {
      title: "Extensive Pavement Breakdown & Asphalt Crater",
      category: "Road Hazards & Potholes",
      severity: "High",
      routingSLA: "48 Hours SLA",
      description: "Severe base-aggregate pavement failure forming a deep structural crater on main transit corridor. Water pooling indicates active moisture erosion. High direct safety threat to single-track vehicles (bicycles, motorbikes).",
      reasoning: "Visual distress analysis calculated multi-point structural pavement fracturing. High traffic volume triggers rapid dispatch protocol to BBMP Road Infrastructure Division."
    }
  },
  {
    id: "preset-garbage",
    name: "Illegal Waste Dump",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600",
    emoji: "🗑️",
    lat: 12.9118,
    lng: 77.6385,
    result: {
      title: "Illegal Secondary Waste Accumulation Corridor",
      category: "Waste & Sanitation",
      severity: "Medium",
      routingSLA: "36 Hours SLA",
      description: "Uncontrolled household and plastic polymer solid waste dumped on active pedestrian pavement. Severe vectors and odor issues observed, obstructing public space access.",
      reasoning: "Classified under sanitation municipal codes. Dispatched to BBMP Solid Waste Management Division with automated routing parameters."
    }
  },
  {
    id: "preset-wire",
    name: "Dangling Cables",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=600",
    emoji: "🔌",
    lat: 12.9698,
    lng: 77.6415,
    result: {
      title: "Exposed High-Voltage Electrical Overhead Ballast",
      category: "Electrical & Streetlights",
      severity: "Critical",
      routingSLA: "12 Hours SLA",
      description: "Hanging electrical cables and sparking streetlamp ballast. High shock hazards under wet monsoon weather. Presents severe risk of fires and injury to pedestrians.",
      reasoning: "Critical hazard priority score applied based on visual ignition and exposure indicators. Dispatched to BESCOM Emergency Repair Crew."
    }
  },
  {
    id: "preset-water",
    name: "Water Main Burst",
    image: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&q=80&w=600",
    emoji: "💧",
    lat: 12.9625,
    lng: 77.6321,
    result: {
      title: "Potable Underground Water Pipeline Rupture",
      category: "Water & Utilities",
      severity: "High",
      routingSLA: "24 Hours SLA",
      description: "Pressurized subterranean main line failure flooding surface pavement. Risk of continuous water resource loss and sub-surface erosion weakening the road's aggregate layer.",
      reasoning: "Severe water utility rupture threatening arterial stability. Direct digital dispatch payload compiled and transmitted to BWSSB Central Unit."
    }
  }
];

export const Landing: React.FC = () => {
  const [_, setLocation] = useLocation();
  // Fetch statistics from real database (tRPC)
  const { data: stats } = trpc.issues.stats.useQuery();
  const { data: leaderboard } = trpc.gamification.getLeaderboard.useQuery();
  const { data: realIssues } = trpc.issues.list.useQuery();

  const totalIssues = stats ? stats.total : 108;
  const resolvedIssues = stats ? stats.resolved : 47;
  const activeCitizens = leaderboard ? leaderboard.length + 308 : 312;

  // Selected mock issue for the interactive simulation
  const [selectedMockIndex, setSelectedMockIndex] = React.useState(0);
  const [isScanning, setIsScanning] = React.useState(false);
  const [mapCenter, setMapCenter] = React.useState({ lat: 12.9176, lng: 77.6244 });

  // --- Live Interactive AI Triage Demo States ---
  const [demoFileBase64, setDemoFileBase64] = React.useState<string | null>(null);
  const [demoFileRaw, setDemoFileRaw] = React.useState<File | null>(null);
  const [demoLoading, setDemoLoading] = React.useState(false);
  const [selectedPresetCoords, setSelectedPresetCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [demoResult, setDemoResult] = React.useState<{
    title: string;
    description: string;
    category: string;
    severity: string;
    routingSLA: string;
    reasoning: string;
    isCustom?: boolean;
  } | null>(null);
  const [demoCountdown, setDemoCountdown] = React.useState(12);
  const [demoError, setDemoError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [customLandingIssues, setCustomLandingIssues] = React.useState<any[]>([]);

  const selectedMock = MOCK_SANDBOX_ISSUES[selectedMockIndex];

  // Dynamic ticking values for premium feel
  const [animatedConfidence, setAnimatedConfidence] = React.useState(0);
  const [animatedPriority, setAnimatedPriority] = React.useState(0);

  // Auto-scrolling live activity ticker state
  const [activityIndex, setActivityIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % LIVE_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!selectedMock) return;
    const targetConf = parseFloat(selectedMock.confidence);
    const targetPriority = parseFloat(selectedMock.priorityScore);
    
    let confStart = targetConf - 10;
    if (confStart < 0) confStart = 0;
    let priorityStart = targetPriority - 3.0;
    if (priorityStart < 0) priorityStart = 0;

    setAnimatedConfidence(confStart);
    setAnimatedPriority(priorityStart);

    const startTime = performance.now();
    const duration = 850; // ms

    let animId: number;
    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      
      setAnimatedConfidence(confStart + (targetConf - confStart) * ease);
      setAnimatedPriority(priorityStart + (targetPriority - priorityStart) * ease);

      if (progress < 1) {
        animId = requestAnimationFrame(update);
      } else {
        setAnimatedConfidence(targetConf);
        setAnimatedPriority(targetPriority);
      }
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [selectedMockIndex]);

  // Combined issues to feed the map
  const combinedIssues = React.useMemo(() => {
    const mockFormatted = MOCK_SANDBOX_ISSUES.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      severity: issue.severityValue,
      priorityScore: Math.round(issue.severityValue * 8.5 + issue.upvotes * 0.3),
      latitude: issue.latitude,
      longitude: issue.longitude,
      address: issue.address,
      status: issue.status,
      createdAt: new Date().toISOString(),
      verifications: Array.from({ length: issue.upvotes }).map((_, i) => ({ id: `v-${i}` })),
    }));
    return [...mockFormatted, ...customLandingIssues, ...(realIssues ?? [])];
  }, [realIssues, customLandingIssues]);

  const handleMockClick = (index: number) => {
    if (index === selectedMockIndex || isScanning) return;
    setIsScanning(true);
    setTimeout(() => {
      setSelectedMockIndex(index);
      const mock = MOCK_SANDBOX_ISSUES[index];
      setMapCenter({ lat: mock.latitude, lng: mock.longitude });
      setIsScanning(false);
    }, 1100);
  };

  // --- Live Triage Demo Event Handlers & API Processors ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFileForDemo(file);
    }
  };

  const handleFileChangeDemo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFileForDemo(file);
    }
  };

  const processFileForDemo = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setDemoError("Please select or upload a valid image file.");
      return;
    }
    setDemoFileRaw(file);
    setDemoError(null);
    setDemoLoading(true);
    setDemoResult(null);
    setDemoCountdown(12);
    setSelectedPresetCoords(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setDemoFileBase64(base64String);

      // Start Countdown Timer
      let countdownVal = 12;
      const interval = setInterval(() => {
        countdownVal -= 1;
        if (countdownVal <= 1) {
          clearInterval(interval);
        } else {
          setDemoCountdown(countdownVal);
        }
      }, 1000);

      try {
        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageBase64: base64String, fileName: file.name, isVideo: false }),
        });

        clearInterval(interval);

        if (!response.ok) {
          throw new Error("Failed to analyze image");
        }

        const data = await response.json();
        setDemoResult({
          title: data.title,
          description: data.description,
          category: data.category,
          severity: data.severity,
          routingSLA: data.routingSLA,
          reasoning: data.reasoning,
          isCustom: true
        });
        setDemoLoading(false);
      } catch (err: any) {
        clearInterval(interval);
        setDemoError("AI Triage failed. Please try again with a smaller image or another format.");
        setDemoLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePresetClick = (preset: typeof PRESET_DEMOS[0]) => {
    setDemoFileRaw(null);
    setDemoFileBase64(preset.image);
    setDemoError(null);
    setDemoLoading(true);
    setDemoResult(null);
    setDemoCountdown(12);
    setSelectedPresetCoords({ lat: preset.lat, lng: preset.lng });

    // Simulated high fidelity countdown matching 12s SLA triage
    let countdownVal = 12;
    const interval = setInterval(() => {
      countdownVal -= 1;
      if (countdownVal <= 1) {
        clearInterval(interval);
      } else {
        setDemoCountdown(countdownVal);
      }
    }, 250); // fast count for demo feedback (total ~3 seconds of beautiful ticking!)

    setTimeout(() => {
      clearInterval(interval);
      setDemoResult({
        ...preset.result,
        isCustom: false
      });
      setDemoLoading(false);
    }, 3000);
  };

  // Storytelling interactive timeline step
  const [activeStoryStep, setActiveStoryStep] = React.useState(0);
  const [autoPlayStory, setAutoPlayStory] = React.useState(true);

  React.useEffect(() => {
    if (!autoPlayStory) return;
    const interval = setInterval(() => {
      setActiveStoryStep((prev) => (prev + 1) % 7);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlayStory]);

  const storySteps = [
    {
      title: "01. Citizen Snap & Pin",
      label: "Citizen uploads image",
      badge: "SUBMISSION",
      description: "A resident notices a street hazard, snaps a photo inside the app, and posts it. High-precision GPS coordinates are automatically embedded from the metadata.",
      mockupType: "camera",
    },
    {
      title: "02. Gemini Vision Triage",
      label: "Gemini analyzes damage",
      badge: "AI VISION",
      description: "Our advanced multi-modal pipeline feeds the photo to Gemini. The model categorizes the incident, flags immediate hazards, and drafts detailed damage reports.",
      mockupType: "ai-vision",
    },
    {
      title: "03. Priority Score Formula",
      label: "AI estimates severity",
      badge: "ALGORITHMIC ROUTING",
      description: "The platform calculates a priority score (1-10) factoring in damage scale, traffic density of the road, proximity to schools, and pedestrian exposure.",
      mockupType: "priority-score",
    },
    {
      title: "04. Neighborhood Validation",
      label: "Community verifies",
      badge: "SOCIAL TRUST",
      description: "Neighboring citizens receive real-time feed updates. They upvote and vouch for reports nearby to establish trusted local consensus.",
      mockupType: "upvote",
    },
    {
      title: "05. Municipal Dispatch",
      label: "Municipality receives work order",
      badge: "AUTOMATED CRM",
      description: "Verified tickets are mapped instantly and delivered directly to the Bruhat Bengaluru Mahanagara Palike (BBMP) crew dashboard as active work orders.",
      mockupType: "dispatch",
    },
    {
      title: "06. Field SLA Execution",
      label: "Repair completed",
      badge: "CIVIC SLA",
      description: "Assigned municipal repair crews perform on-site fixes, uploading verified 'after' photos to close the ticket under rigorous SLA oversight.",
      mockupType: "repair",
    },
    {
      title: "07. Gamified Rewards",
      label: "Citizen earns rewards",
      badge: "COMMUNITY ENGAGEMENT",
      description: "The original reporter and community verifiers receive Civic XP, rank badges, and local tokens as a token of appreciation for keeping Bengaluru safe.",
      mockupType: "rewards",
    },
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } }
  } as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  } as const;

  return (
    <AuroraHero className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-500/10 overflow-x-hidden relative">
      
      {/* Absolute Background Layer: Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.015] mix-blend-multiply dark:mix-blend-overlay bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:44px_44px]"
        />
        {/* Subtle noise pattern overlay */}
        <div className="absolute inset-0 opacity-[0.012] mix-blend-overlay bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Styled Inline Scrollbar & Utility Overrides */}
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee 35s linear infinite;
        }
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.7; }
          50% { top: 100%; opacity: 0.7; }
          100% { top: 0%; opacity: 0.7; }
        }
        .animate-scan-laser {
          animation: scanLaser 2.5s ease-in-out infinite;
        }
        @keyframes floatingSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-float {
          animation: floatingSlow 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: floatingSlow 6s ease-in-out infinite;
          animation-delay: 3s;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.08); border-color: rgba(99, 102, 241, 0.15); }
          50% { box-shadow: 0 4px 40px rgba(99, 102, 241, 0.22); border-color: rgba(99, 102, 241, 0.45); }
        }
        .premium-dashboard-glow {
          animation: pulseGlow 5s ease-in-out infinite;
        }
      `}</style>

      {/* CiviMind Custom Premium Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-950/45 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-800/40 transition-all duration-300">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <div className="flex items-center -space-x-1.5 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-black shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">C</div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-[11px] font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">M</div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Civi<span className="text-indigo-600 dark:text-indigo-400">Mind</span>
                <span className="font-black text-[9px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/50 px-1.5 py-0.5 rounded-md ml-2 uppercase tracking-widest relative -top-0.5">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How It Works</a>
            <a href="#dashboard-console" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Operations Console</a>
            <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Core Platform</a>
            <a href="#statistics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Impact & Stats</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-6">
            <Link href="/app-auth">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">
                Login
              </span>
            </Link>
            <Link href="/app-auth">
              <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-extrabold text-xs rounded-full transition-all tracking-wider cursor-pointer shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 duration-300">
                Launch Platform
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* CiviMind Premium Hero Block */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 max-w-[1360px] mx-auto px-6 sm:px-10 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4.5 py-1.5 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100/60 dark:border-indigo-900/40 rounded-full text-xs font-black tracking-wide text-indigo-700 dark:text-indigo-300 uppercase shadow-sm">
            <Sparkle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse shrink-0" />
            <span>✨ Gemini-Powered Civic Intelligence</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
            Cities that <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">think</span>. <br />
            Resolve faster.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            CiviMind is a Gemini-powered civic operations platform closing the gap between community reports and city action. Real-time visual intelligence, automated triaging, and verified resolutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4.5 pt-4">
            <Link href="/app-auth">
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-extrabold text-sm rounded-full transition-all tracking-wider shadow-lg shadow-slate-950/10 dark:shadow-white/5 hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-indigo-500/10 hover:-translate-y-0.5 duration-300 flex items-center justify-center space-x-2 cursor-pointer">
                <span>Report a Hazard</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </Link>
            <button 
              onClick={() => document.getElementById("dashboard-console")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full sm:w-auto px-8 py-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-sm rounded-full transition-all tracking-wider hover:bg-white/60 dark:hover:bg-slate-900/60 duration-300 cursor-pointer"
            >
              Explore Operations Console
            </button>
          </div>

          {/* Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-10">
            {[
              { label: "12s AI Triaging SLA", icon: "⚡", desc: "Fast automated category and department routing" },
              { label: "Verified Social Trust", icon: "🤝", desc: "Citizen-driven confirmation & consensus" },
              { label: "Automated Municipal Routing", icon: "🗺️", desc: "Direct integration with city departments" }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white/45 dark:bg-slate-950/45 border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md rounded-2xl p-4 text-left space-y-1.5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="font-extrabold text-xs sm:text-xs text-slate-900 dark:text-white uppercase tracking-wider">{feature.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-normal">{feature.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <main className="flex-grow z-10 relative">


        {/* TRUST SECTION (MONOCHROME LOGOS) */}
        <section className="bg-slate-50/50 dark:bg-slate-900/20 border-t border-b border-slate-200/50 dark:border-slate-800/60 py-10 overflow-hidden relative">
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              INTEGRATED CIVIC INTELLIGENCE PLATFORM POWERED BY
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-60 hover:opacity-85 transition-opacity duration-300">
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-slate-600 flex items-center">
                <Sparkles className="w-5 h-5 text-indigo-600 mr-2 shrink-0 animate-pulse" />
                GOOGLE GEMINI
              </span>
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-slate-600 flex items-center">
                <MapIcon className="w-5 h-5 text-indigo-500 mr-2 shrink-0" />
                GOOGLE MAPS PLATFORM
              </span>
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-slate-600 flex items-center">
                <Zap className="w-5 h-5 text-amber-500 mr-2 shrink-0 fill-amber-400" />
                FIREBASE DB
              </span>
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-slate-600 flex items-center">
                <Shield className="w-5 h-5 text-indigo-600 mr-2 shrink-0" />
                CLOUD RUN
              </span>
              <span className="font-black text-sm sm:text-base tracking-widest text-slate-600">
                NEXT.JS FRAMEWORK
              </span>
            </div>
          </div>
        </section>


        {/* LIVE ACTIVITY TICKER PANEL (Floating Live Stream) */}
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10 mt-14">
          <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5 px-2 py-1 bg-rose-500/10 border border-rose-500/25 text-[9px] font-black text-rose-600 tracking-wider rounded-md font-mono shrink-0 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                <span>REAL-TIME LIVE FEED</span>
              </span>
              <span className="text-xs font-bold text-[#111111] dark:text-slate-300 hidden md:block">Streaming verified community activities:</span>
            </div>
            
            {/* Smooth Ticker text wrapper */}
            <div className="flex-grow flex justify-center sm:justify-start min-h-[24px] relative overflow-hidden px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activityIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="flex items-center space-x-2 text-xs font-semibold text-slate-600 text-center sm:text-left"
                >
                  <span className="text-indigo-600 font-extrabold">[{LIVE_ACTIVITIES[activityIndex].location}]</span>
                  <span>{LIVE_ACTIVITIES[activityIndex].text}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({LIVE_ACTIVITIES[activityIndex].time})</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <Link href="/app-auth">
              <span className="text-xs font-black text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center space-x-1 shrink-0 group">
                <span>View Global Feed</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </div>
        </div>


        {/* THE CORE INTERACTIVE OPERATIONS ENGINE SECTION */}
        <section id="dashboard-console" className="max-w-[1360px] mx-auto px-6 sm:px-10 pt-20 pb-16">
          
          {/* Main Console Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <span className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-extrabold tracking-wider text-indigo-700 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Interactive AI Operations Engine</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] dark:text-white tracking-tight leading-[1.15]">
              Civic Operations Control Center
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base font-semibold leading-relaxed max-w-2xl mx-auto">
              Interact with our Gemini-powered civic intelligence platform. Select any active citizen report below to watch AI classify hazards, calculate severity, estimate repair costs, assign municipal departments, and visualize locations across Bengaluru in real time.
            </p>
          </div>

          {/* Interactive Simulation Dashboard & Map Frame */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mt-10">
            
            {/* Left Column: Report Selector List & Gemini Analyzer */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Selector List */}
              <div className="space-y-3.5 flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 text-[#111111] dark:text-slate-200">
                    <Activity className="w-4.5 h-4.5 text-indigo-600 shrink-0 animate-pulse" />
                    <span className="font-extrabold text-xs uppercase tracking-widest">Active Citizen Reports</span>
                  </div>
                  <span className="flex items-center space-x-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[9px] font-black text-rose-600 tracking-wider rounded-md font-mono shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                    <span>ACTIVE POOL</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {MOCK_SANDBOX_ISSUES.map((issue, idx) => {
                    const isSelected = selectedMockIndex === idx;
                    return (
                      <div
                        key={issue.id}
                        onClick={() => handleMockClick(idx)}
                        className={`w-full p-4.5 text-left border rounded-2xl flex items-start space-x-4 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50/30 border-indigo-500/80 shadow-md translate-x-1.5"
                            : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                        }`}
                      >
                        {/* Selected Indicator Bar */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-2xl"></div>
                        )}
                        <div className="text-2xl mt-0.5 shrink-0 select-none group-hover:scale-110 transition-transform duration-300">{issue.imagePlaceholder}</div>
                        <div className="min-w-0 flex-grow space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                              issue.category === "Road Damage"
                                ? "bg-orange-50 text-orange-700 border-orange-100"
                                : issue.category === "Water Leakage"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : issue.category === "Garbage"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-purple-50 text-purple-700 border-purple-100"
                            }`}>
                              {issue.category}
                            </span>
                            <span className="flex items-center text-[10px] font-bold text-slate-400">
                              <Users className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                              +{issue.upvotes} confirmations
                            </span>
                          </div>
                          <h4 className={`text-sm font-extrabold truncate leading-tight transition-colors duration-300 ${
                            isSelected ? "text-indigo-950 dark:text-indigo-200" : "text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                          }`}>
                            {issue.title}
                          </h4>
                          <p className="text-[11px] text-[#6B7280] font-medium truncate">{issue.address.split(',')[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gemini AI Dispatch Analyzer Box */}
              <div className="bg-slate-950 border border-slate-850 rounded-[24px] p-6 text-white space-y-4.5 shadow-xl relative overflow-hidden min-h-[440px] flex flex-col justify-between premium-dashboard-glow">
                
                {/* Scanner effect line overlay */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan-laser z-20"></div>
                )}

                {/* Analyzer Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />
                    <span className="font-extrabold text-[10px] uppercase tracking-widest text-slate-200 font-mono">Gemini Civic Analyzer</span>
                  </div>
                  {isScanning ? (
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest font-mono animate-pulse">
                      Triaging Report...
                    </span>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shrink-0 animate-pulse">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider font-mono">
                        98.4% Confidence
                      </span>
                    </div>
                  )}
                </div>

                {/* Shimmer skeleton screen while AI scanning is in progress */}
                {isScanning ? (
                  <div className="flex-grow flex flex-col justify-center space-y-4 py-8">
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-850 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-slate-850 rounded w-5/6 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <div className="h-14 bg-slate-850 rounded-xl animate-pulse"></div>
                      <div className="h-14 bg-slate-850 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="h-12 bg-slate-850 rounded-xl animate-pulse"></div>
                  </div>
                ) : (
                  /* Loaded AI Triaged Parameters */
                  <motion.div 
                    key={selectedMock.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="flex-grow flex flex-col justify-between space-y-4"
                  >
                    {/* Quotation text */}
                    <p className="text-[12px] text-slate-200 font-semibold leading-relaxed bg-slate-900/60 border border-slate-800/60 p-4 rounded-xl italic">
                      &ldquo;{selectedMock.description}&rdquo;
                    </p>

                    {/* Meta grids */}
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-medium">
                      
                      {/* Priority Score counter */}
                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 space-y-1 hover:border-slate-800 transition-colors duration-300">
                        <span className="text-slate-500 font-extrabold uppercase text-[8px] tracking-widest block">Priority Score</span>
                        <span className="text-lg font-black text-indigo-400 font-mono">
                          {animatedPriority.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">/ 10</span>
                        </span>
                        <span className="text-[8px] text-indigo-400 font-extrabold uppercase block leading-none tracking-wider">High Safety Threat</span>
                      </div>

                      {/* Dispatch target department */}
                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 space-y-1 hover:border-slate-800 transition-colors duration-300">
                        <span className="text-slate-500 font-extrabold uppercase text-[8px] tracking-widest block">Dispatch Target</span>
                        <span className="text-[11px] font-black text-slate-100 leading-snug block truncate">{selectedMock.assignedDepartment.split(' - ')[0]}</span>
                        <span className="text-[8px] text-slate-400 block font-bold truncate">{selectedMock.assignedDepartment.split(' - ')[1] || "Municipal Crew"}</span>
                      </div>

                      {/* Estimated cost of remediation */}
                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 space-y-1 hover:border-slate-800 transition-colors duration-300">
                        <span className="text-slate-500 font-extrabold uppercase text-[8px] tracking-widest block">Remediation Budget</span>
                        <span className="text-lg font-black text-emerald-400 font-mono flex items-center">
                          {selectedMock.estimatedCost}
                        </span>
                      </div>

                      {/* ETA timeline */}
                      <div className="bg-slate-900 border border-slate-850 rounded-xl p-3.5 space-y-1 hover:border-slate-800 transition-colors duration-300">
                        <span className="text-slate-500 font-extrabold uppercase text-[8px] tracking-widest block">ETA Resolution</span>
                        <span className="text-[11px] font-black text-amber-400 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 shrink-0" />
                          {selectedMock.resolutionTimeline}
                        </span>
                      </div>
                    </div>

                    {/* Identified risk warning box */}
                    <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex items-start space-x-2.5 text-[11px]">
                      <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-rose-300 uppercase text-[8.5px] tracking-wider block font-mono">Verified Risk Assessment</span>
                        <p className="text-slate-300 font-semibold leading-normal">{selectedMock.safetyRisk}</p>
                      </div>
                    </div>

                    {/* Bottom metrics stats strip */}
                    <div className="border-t border-slate-800/85 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                          <Activity className="w-3 h-3 text-indigo-400 mr-1.5 shrink-0" />
                          Real-time telemetry indicators
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[9.5px] font-mono">
                        <div className="bg-slate-900/60 p-2 border border-slate-850 rounded-lg text-center">
                          <span className="text-slate-500 block text-[7px] font-sans font-extrabold uppercase mb-0.5">AI Confidence</span>
                          <span className="font-extrabold text-indigo-300">{(animatedConfidence).toFixed(1)}%</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 border border-slate-850 rounded-lg text-center">
                          <span className="text-slate-500 block text-[7px] font-sans font-extrabold uppercase mb-0.5">Severity Index</span>
                          <span className="font-extrabold text-rose-400">{selectedMock.severity.split(' ')[0]}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 border border-slate-850 rounded-lg text-center">
                          <span className="text-slate-500 block text-[7px] font-sans font-extrabold uppercase mb-0.5">Consensus</span>
                          <span className="font-extrabold text-emerald-400">+{selectedMock.upvotes} confirmations</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column: High-contrast Live Operations Map & Resolution Flow */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              
              {/* Map block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm flex flex-col h-full min-h-[460px] hover:shadow-md transition-shadow duration-300">
                <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between text-xs font-semibold text-[#111111] dark:text-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono uppercase tracking-widest">BENGALURU OPERATIONS MAP (LIVE GRID)</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 font-bold text-[10px]">
                    <Compass className="w-4 h-4 text-slate-400 animate-spin-slow" />
                    <span>Focus: {selectedMock.address.split(',')[0]}</span>
                  </div>
                </div>
                
                <div className="flex-grow w-full relative">
                  <LeafletMap 
                    issues={combinedIssues} 
                    latitude={mapCenter.lat} 
                    longitude={mapCenter.lng}
                    className="h-full w-full animate-fade-in"
                  />
                </div>
              </div>

              {/* Horizontal Stepper Flow */}
              <div className="bg-[#FAFAFA] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2 text-[#111111] dark:text-slate-200">
                    <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-extrabold text-xs uppercase tracking-widest">Resolution Pipeline Flow</span>
                  </div>
                  <span className="text-[9px] font-black text-indigo-700 font-mono bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">Auto-Triage Sync</span>
                </div>

                <div className="grid grid-cols-5 gap-2 relative">
                  {[
                    { step: 1, label: "Citizen Filed", desc: "Photo & GPS", icon: Camera },
                    { step: 2, label: "AI Triaged", desc: "Category & Risk", icon: BrainCircuit },
                    { step: 3, label: "Verified", desc: "Crowd consensus", icon: CheckSquare },
                    { step: 4, label: "Dispatched", desc: "Work order ready", icon: FileText },
                    { step: 5, label: "Resolved", desc: "SLA completed", icon: CheckCircle2 }
                  ].map((pipeline) => {
                    const isCompleted = selectedMock.progressStep >= pipeline.step;
                    const isActive = selectedMock.progressStep === pipeline.step;
                    const IconComponent = pipeline.icon;
                    
                    return (
                      <div key={pipeline.step} className="text-center relative flex flex-col items-center group z-10">
                        {/* Circle badge */}
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: isActive ? 1.15 : 1 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 text-xs font-black transition-all duration-500 ${
                            isCompleted 
                              ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/15" 
                              : "bg-white border-slate-200 text-[#9CA3AF]"
                          } ${isActive ? "ring-4 ring-emerald-500/20" : ""}`}
                        >
                          <IconComponent className={`w-4.5 h-4.5 ${isCompleted ? "text-white" : "text-slate-400"}`} />
                        </motion.div>
                        
                        {/* Labels */}
                        <div className="mt-2.5 space-y-0.5">
                          <div className={`text-[10px] font-extrabold leading-tight ${
                            isCompleted ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
                          }`}>
                            {pipeline.label}
                          </div>
                          <div className="text-[8px] font-semibold text-slate-400 hidden md:block leading-snug">
                            {pipeline.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Stepper progress connector line */}
                  <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700 animate-pulse shadow-[0_0_8px_1px_rgba(16,185,129,0.3)]" 
                      style={{ width: `${((selectedMock.progressStep - 1) / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* LIVE AI TRIAGE SANDBOX DEMO SECTION */}
        <section id="ai-sandbox" className="bg-slate-950 text-white py-24 relative overflow-hidden border-t border-b border-slate-900">
          {/* Shimmer glowing backgrounds */}
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-[1360px] mx-auto px-6 sm:px-10 relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <span className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-extrabold tracking-wider text-indigo-400 uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Interactive Sandbox</span>
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Try the Live AI Triage Demo
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed max-w-2xl mx-auto font-sans">
                Test the actual Google Gemini multimodal engine! Upload any custom photo of city damage or click on one of our high-resolution presets to watch the system classify, score, and route the hazard in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch max-w-6xl mx-auto">
              
              {/* Left Column: Selector & Uploader */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                
                {/* File Uploader */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-200">
                    <Camera className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="font-extrabold text-xs uppercase tracking-widest">Option A: Upload Custom Photo</span>
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 relative group cursor-pointer flex flex-col items-center justify-center min-h-[220px] ${
                      dragActive
                        ? "border-indigo-400 bg-indigo-500/5 shadow-md shadow-indigo-500/5"
                        : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    <input
                      type="file"
                      id="file-demo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChangeDemo}
                      disabled={demoLoading}
                    />
                    <label htmlFor="file-demo-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-black text-slate-100 block mb-1">Drag & drop your photo here</span>
                      <span className="text-xs text-slate-500 font-bold block mb-4">or click to browse from files</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">Supported: JPG, PNG, WEBP</span>
                    </label>
                  </div>
                  {demoError && (
                    <div className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{demoError}</span>
                    </div>
                  )}
                </div>

                {/* Preset Selector */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-200">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                    <span className="font-extrabold text-xs uppercase tracking-widest">Option B: Select Presets</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {PRESET_DEMOS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        disabled={demoLoading}
                        className="p-3 bg-slate-900/50 border border-slate-850 hover:border-slate-700 hover:bg-slate-900 rounded-2xl text-left transition-all duration-300 group flex items-center space-x-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 bg-slate-850 border border-slate-800">
                          <img src={preset.image} alt={preset.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide leading-none">{preset.emoji} Preset</div>
                          <div className="text-xs font-extrabold text-white truncate mt-1">{preset.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Live Gemini Analyzer Screen */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative min-h-[460px] flex flex-col justify-between h-full">
                  {/* Top terminal bar */}
                  <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-200 font-mono">Multimodal Triage Terminal</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                    </div>
                  </div>

                  {/* Inside card content */}
                  <div className="p-6 flex-grow flex flex-col justify-center">
                    {demoLoading ? (
                      /* LOADING STATE */
                      <div className="space-y-6 text-center py-8">
                        {/* Interactive scan loader */}
                        <div className="relative w-48 h-32 mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                          {demoFileBase64 && (
                            <img src={demoFileBase64} alt="Scanning" className="w-full h-full object-cover opacity-40 blur-[1px]" referrerPolicy="no-referrer" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-indigo-500/30 to-indigo-500/10 animate-pulse flex flex-col items-center justify-center">
                            <BrainCircuit className="w-10 h-10 text-indigo-400 animate-bounce mb-2" />
                            <span className="text-[9px] font-mono font-black tracking-widest text-indigo-300 uppercase animate-pulse">Scanning Visuals</span>
                          </div>
                          {/* Laser scanning line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-indigo-400 shadow-[0_0_8px_2px_rgba(129,140,248,0.5)] animate-scan-laser"></div>
                        </div>

                        <div className="space-y-2 max-w-sm mx-auto">
                          <div className="text-sm font-black text-indigo-300">Gemini Live Multi-Agent Pipeline Active</div>
                          <p className="text-xs text-slate-400 font-bold leading-normal">
                            Extracting structural contours, assessing community impact score, and compiling geo-routing instructions in <span className="text-indigo-400 font-mono font-black">{demoCountdown}s</span>...
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full max-w-xs mx-auto bg-slate-950 rounded-full h-1.5 border border-slate-850 overflow-hidden">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: demoFileRaw ? 12 : 3, ease: "linear" }}
                            className="bg-indigo-500 h-full rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    ) : demoResult ? (
                      /* RESULT STATE */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                      >
                        {/* Title and Category Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-400">
                              {demoResult.category}
                            </span>
                            <h3 className="text-lg font-black text-white mt-1.5">{demoResult.title}</h3>
                          </div>
                          <div className="flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full shrink-0">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">Verified Active</span>
                          </div>
                        </div>

                        {/* Description Box */}
                        <div className="bg-slate-950 border border-slate-850/60 rounded-2xl p-4 italic text-slate-300 text-xs font-semibold leading-relaxed font-sans">
                          &ldquo;{demoResult.description}&rdquo;
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-center">
                            <span className="text-slate-500 block text-[8px] font-extrabold uppercase tracking-widest mb-1">Severity Scale</span>
                            <span className={`text-base font-black ${
                              demoResult.severity === "Critical"
                                ? "text-rose-400"
                                : demoResult.severity === "High"
                                ? "text-orange-400"
                                : "text-amber-400"
                            }`}>
                              {demoResult.severity}
                            </span>
                          </div>

                          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-center">
                            <span className="text-slate-500 block text-[8px] font-extrabold uppercase tracking-widest mb-1">Routing SLA</span>
                            <span className="text-base font-black text-indigo-400">{demoResult.routingSLA}</span>
                          </div>

                          <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-center">
                            <span className="text-slate-500 block text-[8px] font-extrabold uppercase tracking-widest mb-1">Confidence Score</span>
                            <span className="text-base font-black text-emerald-400">99.4%</span>
                          </div>
                        </div>

                        {/* Reasoning / Action plan */}
                        <div className="space-y-1">
                          <span className="text-slate-500 text-[8px] font-extrabold uppercase tracking-widest">Triage Reasoning & Municipal Assignment</span>
                          <p className="text-xs text-slate-300 font-semibold leading-relaxed font-sans">
                            {demoResult.reasoning}
                          </p>
                        </div>

                        {/* Submit Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                          <button
                            onClick={() => {
                              const lat = selectedPresetCoords ? selectedPresetCoords.lat : (12.92 + (Math.random() - 0.5) * 0.05);
                              const lng = selectedPresetCoords ? selectedPresetCoords.lng : (77.62 + (Math.random() - 0.5) * 0.05);
                              
                              const newIssue = {
                                id: `demo-user-issue-${Date.now()}`,
                                title: demoResult.title,
                                description: demoResult.description,
                                category: demoResult.category,
                                severityValue: demoResult.severity === "Critical" ? 10 : demoResult.severity === "High" ? 8 : demoResult.severity === "Medium" ? 6 : 4,
                                severity: demoResult.severity + " (Live Demo)",
                                priorityScore: demoResult.severity === "Critical" ? "9.8/10" : "8.5/10",
                                confidence: "99.4%",
                                safetyRisk: demoResult.reasoning,
                                assignedDepartment: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
                                estimatedCost: demoResult.severity === "Critical" ? "₹45,000" : "₹18,500",
                                resolutionTimeline: demoResult.routingSLA,
                                progressStep: 2,
                                status: "Reported",
                                latitude: lat,
                                longitude: lng,
                                address: demoResult.category + " Near Bengaluru Center",
                                upvotes: 1,
                                imagePlaceholder: "📸",
                                imageUrls: [demoFileBase64]
                              };

                              setCustomLandingIssues(prev => [newIssue, ...prev]);
                              setMapCenter({ lat, lng });

                              const el = document.getElementById("dashboard-console");
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth" });
                              }
                            }}
                            className="flex-grow py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl tracking-wider uppercase transition-all duration-300 shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2"
                          >
                            <span>⚡ File Report & Add to Live Map Grid</span>
                          </button>

                          <button
                            onClick={() => {
                              setDemoFileBase64(null);
                              setDemoFileRaw(null);
                              setDemoResult(null);
                            }}
                            className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-xl tracking-wider uppercase transition-all duration-300"
                          >
                            Reset Demo
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      /* IDLE STATE */
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 mx-auto bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center text-slate-500">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-black text-slate-200">Waiting for Image Input</h3>
                          <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-normal">
                            Upload a custom infrastructure photo or click one of the preset images to trigger the live multimodal analysis.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terminal footer */}
                  <div className="bg-slate-950/40 border-t border-slate-800/60 px-6 py-4 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                    <span>SYS_PIPELINE: ACTIVE</span>
                    <span>GEMINI-1.5-FLASH-COGNITIVE-AGENT</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* STORYTELLING INTERACTIVE STEPPED SECTION ("From Hazard to Resolution") */}
        <section id="how-it-works" className="bg-slate-50/40 border-t border-b border-slate-200/50 py-24 relative overflow-hidden">
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3.5 mb-16">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">THE COLLABORATIVE STORY</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] dark:text-white tracking-tight">
                From Report to Resolution
              </h2>
              <p className="text-[#6B7280] text-sm md:text-base font-semibold leading-relaxed">
                Watch how CiviMind automates city management. Click on each step to see how AI and community action turn report uploads into verified resolved infrastructure.
              </p>
            </div>

            {/* Interactive Split Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center max-w-6xl mx-auto">
              
              {/* Left Side: 7 Step Clickable Tickers */}
              <div className="lg:col-span-6 space-y-3">
                {storySteps.map((step, idx) => {
                  const isActive = activeStoryStep === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => {
                        setActiveStoryStep(idx);
                        setAutoPlayStory(false); // pause autoplay on hover
                      }}
                      onClick={() => {
                        setActiveStoryStep(idx);
                        setAutoPlayStory(false);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex items-center space-x-4 relative ${
                        isActive 
                          ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900 shadow-md translate-x-1.5"
                          : "bg-transparent border-transparent opacity-60 hover:opacity-100 hover:translate-x-1"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-full"></div>
                      )}
                      
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-black ${
                        isActive ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" : "bg-slate-100/60 dark:bg-slate-800/40 text-slate-400"
                      }`}>
                        {idx + 1}
                      </div>
                      
                      <div className="min-w-0 flex-grow">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-black transition-colors ${
                            isActive ? "text-indigo-950" : "text-slate-800"
                          }`}>
                            {step.label}
                          </h4>
                        </div>
                        {isActive && (
                          <p className="text-[11.5px] text-[#6B7280] font-semibold leading-relaxed mt-1 animate-fade-in">
                            {step.description}
                          </p>
                        )}
                      </div>

                      <ChevronDown className={`w-4.5 h-4.5 text-slate-400 shrink-0 transform transition-transform duration-300 ${isActive ? "rotate-180" : ""}`} />
                    </div>
                  );
                })}
              </div>

              {/* Right Side: Smartphone Live App Mockup Viewport */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-[330px] h-[550px] bg-slate-950 rounded-[44px] p-4.5 border-8 border-slate-900 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                  
                  {/* Smartphone camera island cutout */}
                  <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-30 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 ml-3"></div>
                  </div>

                  {/* Shimmer ambient glow background */}
                  <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none z-10"></div>
                  <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none z-10"></div>

                  {/* Header bar in smartphone */}
                  <div className="relative z-20 flex items-center justify-between text-white border-b border-slate-800/80 pb-3 pt-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center text-[8px] font-bold">C</div>
                      <span className="text-[9px] font-black tracking-wider uppercase font-mono">CiviMind App</span>
                    </div>
                    <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest animate-pulse">
                      {storySteps[activeStoryStep].badge}
                    </span>
                  </div>

                  {/* Smartphone screen dynamic area based on active step */}
                  <div className="relative z-20 flex-grow py-5 px-1 flex flex-col justify-center text-white">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStoryStep}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Step 0: Camera / Upload */}
                        {storySteps[activeStoryStep].mockupType === "camera" && (
                          <div className="space-y-4.5 text-center">
                            <div className="w-24 h-24 mx-auto bg-slate-900 rounded-full border-2 border-indigo-500 border-dashed flex items-center justify-center animate-pulse">
                              <Camera className="w-9 h-9 text-indigo-400" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-black text-white">Capturing Street Hazard...</div>
                              <div className="text-[9.5px] text-slate-400 font-semibold leading-normal max-w-[200px] mx-auto">GPS coordinates automatic mapping & high-resolution metadata packaging.</div>
                            </div>
                            <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-[9px] font-mono text-indigo-300">
                              Latitude: 12.9176 | Longitude: 77.6244
                            </div>
                          </div>
                        )}

                        {/* Step 1: AI Vision Analysis */}
                        {storySteps[activeStoryStep].mockupType === "ai-vision" && (
                          <div className="space-y-3 text-center">
                            <div className="w-full h-32 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                              <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=300')] opacity-50"></div>
                              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 animate-pulse"></div>
                              <div className="absolute top-2 left-2 bg-indigo-500/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black">SCANNING ASYNC</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-black text-indigo-300 flex items-center justify-center space-x-1">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                                <span>Gemini Vision Triaging</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 leading-normal max-w-[190px] mx-auto">Classified: Asphalt Pothole. Confidence: 99.4%. Estimated Depth: 4.2 inches.</div>
                            </div>
                          </div>
                        )}

                        {/* Step 2: Severity Assessment */}
                        {storySteps[activeStoryStep].mockupType === "priority-score" && (
                          <div className="space-y-3.5 text-center">
                            <div className="w-20 h-20 mx-auto bg-slate-900 rounded-full border-2 border-indigo-400/30 flex items-center justify-center text-indigo-400 text-lg font-black font-mono">
                              9.4
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-xs font-black">Algorithmic Severity</div>
                              <p className="text-[9.5px] text-slate-400 leading-normal max-w-[190px] mx-auto">Multi-factor score calculation: road traffic density * safety damage scale.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                              <div className="bg-slate-900 p-2 border border-slate-850 rounded-lg">
                                <span className="text-slate-500 block uppercase text-[7px]">BUDGET EST</span>
                                <span className="font-extrabold text-emerald-400">₹38,500</span>
                              </div>
                              <div className="bg-slate-900 p-2 border border-slate-850 rounded-lg">
                                <span className="text-slate-500 block uppercase text-[7px]">SLA ETA</span>
                                <span className="font-extrabold text-amber-400">48 Hours</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step 3: Upvotes / Consensus */}
                        {storySteps[activeStoryStep].mockupType === "upvote" && (
                          <div className="space-y-3.5 text-center">
                            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-slate-400 font-bold">Consensus Gauge</span>
                                <span className="text-[9px] font-black text-emerald-400">VERIFIED</span>
                              </div>
                              <div className="flex -space-x-1.5 justify-center">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 border border-slate-900 text-[9px] font-bold flex items-center justify-center">AK</div>
                                <div className="w-7 h-7 rounded-full bg-emerald-500 border border-slate-900 text-[9px] font-bold flex items-center justify-center">RS</div>
                                <div className="w-7 h-7 rounded-full bg-amber-500 border border-slate-900 text-[9px] font-bold flex items-center justify-center">PM</div>
                              </div>
                              <div className="text-[10px] font-bold">27 neighbors confirmed this hazard</div>
                            </div>
                            <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-lg tracking-wider transition-colors">
                              + VOUCH FOR HAZARD
                            </button>
                          </div>
                        )}

                        {/* Step 4: Dispatch Work Order */}
                        {storySteps[activeStoryStep].mockupType === "dispatch" && (
                          <div className="space-y-3 text-center">
                            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850 text-left font-mono space-y-1.5 text-[8.5px] leading-relaxed">
                              <div className="text-slate-500">// BBMP DISPATCH INTEGRATION</div>
                              <div className="text-indigo-400">&gt; Payload package built successfully.</div>
                              <div className="text-indigo-400">&gt; Routing to BBMP Road division...</div>
                              <div className="text-emerald-400">&gt; Work order #4402 dispatched.</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-black">BBMP System Synced</div>
                              <p className="text-[9.5px] text-slate-400 leading-normal max-w-[190px] mx-auto">No manual intervention needed. Direct digital dispatch pipeline.</p>
                            </div>
                          </div>
                        )}

                        {/* Step 5: Repair completed */}
                        {storySteps[activeStoryStep].mockupType === "repair" && (
                          <div className="space-y-3 text-center">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-slate-900 rounded-lg p-2 border border-slate-850">
                                <div className="text-[7px] text-slate-500 uppercase font-black mb-1">Before (Pothole)</div>
                                <div className="h-14 bg-cover bg-center rounded bg-[url('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=150')]"></div>
                              </div>
                              <div className="bg-slate-900 rounded-lg p-2 border border-slate-850">
                                <div className="text-[7px] text-slate-500 uppercase font-black mb-1">After (Resolved)</div>
                                <div className="h-14 bg-slate-800 rounded flex items-center justify-center text-[10px] text-emerald-400 font-bold">🛣️ Smooth</div>
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <div className="text-xs font-black text-emerald-400">SLA Status: Resolved</div>
                              <p className="text-[9.5px] text-slate-400 leading-normal max-w-[190px] mx-auto">Repair completed by BBMP Division crew within 48-hour deadline.</p>
                            </div>
                          </div>
                        )}

                        {/* Step 6: Rewards and tokens */}
                        {storySteps[activeStoryStep].mockupType === "rewards" && (
                          <div className="space-y-4 text-center">
                            <div className="w-14 h-14 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                              <Coins className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs font-black text-emerald-400">Earned +120 Civic XP</div>
                              <p className="text-[9.5px] text-slate-400 leading-normal max-w-[200px] mx-auto">Congratulations! You earned XP points, neighborhood reputation, and local tokens.</p>
                            </div>
                            <div className="flex justify-center space-x-1.5">
                              <span className="text-[8px] font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-indigo-400">Gold Tier Rank</span>
                              <span className="text-[8px] font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-emerald-400">Token +25</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Smartphone footer controls placeholder */}
                  <div className="relative z-20 bg-slate-900/60 border-t border-slate-850/80 pt-3 pb-1 flex items-center justify-between text-[8px] font-bold px-2">
                    <span className="text-[#6B7280]">COMMUNITY SCORE</span>
                    <span className="text-emerald-400">98.4% METRIC ACCURACY</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* PREMIUM BENTO FEATURE CARDS (Series A Layout) */}
        <section id="features" className="max-w-[1360px] mx-auto px-6 sm:px-10 py-24">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">ROBUST PLATFORM SUITE</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] dark:text-white tracking-tight">
              Designed for Scale & Action
            </h2>
            <p className="text-[#6B7280] text-sm md:text-base font-semibold leading-relaxed">
              Every detail is designed to remove friction from public services. Experience the power of our state-of-the-art civic intelligence stack.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {/* Bento Card 1: Warm Amber Potholes */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="p-8 bg-amber-50/25 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-[24px] space-y-8 flex flex-col justify-between group hover:border-amber-200 dark:hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 relative overflow-hidden min-h-[400px]"
            >
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest block mb-1">Instant Logging</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                    Report Hazards in 12 Seconds
                  </h3>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 leading-relaxed mt-3">
                    Snap a photo or short video on site, select a category, and let our system automatically pack GPS coordinates and file a structured report directly into the map.
                  </p>
                </div>
              </div>
              
              {/* Micro UI Widget inside Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-amber-800 uppercase bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-200/40">Road Deterioration</span>
                  <span className="text-[9.5px] font-bold text-slate-400">Just Now</span>
                </div>
                <div className="text-[11.5px] font-extrabold text-slate-900 dark:text-white">Main St. Asphalt Breakdown</div>
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div className="bg-amber-500 h-1 rounded-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 2: Indigo Gemini AI */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="p-8 bg-indigo-50/25 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-[24px] space-y-8 flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden min-h-[400px]"
            >
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block mb-1">AI Classification</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                    Google Gemini Multimodal Analysis
                  </h3>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 leading-relaxed mt-3">
                    Our multimodal AI pipeline scans image payloads, identifies specific damages, calculates urgency parameters, and auto-generates dispatch summaries automatically.
                  </p>
                </div>
              </div>
              
              {/* Micro UI Widget inside Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-[9px] font-black text-indigo-600 uppercase">AI TRIAGE SUCCESS</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">High Confidence</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Classified Address:</div>
                  <div className="text-[10.5px] font-extrabold text-slate-800 dark:text-slate-100">100 Feet Rd, Indiranagar, Bengaluru</div>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3: Emerald Gamification */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -6 }}
              className="p-8 bg-emerald-50/25 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-[24px] space-y-8 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 relative overflow-hidden min-h-[400px]"
            >
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">Reputation Engine</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                    XP Leaderboards & Ranks
                  </h3>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-slate-400 leading-relaxed mt-3">
                    Build public credit. Citizens earn leaderboard ranks, custom badges, and tokens of appreciation whenever they report hazards, upvote, or verify fixes.
                  </p>
                </div>
              </div>
              
              {/* Micro UI Widget inside Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Rank Gold Champion</span>
                  <div className="flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-orange-600 font-mono">5 Day Streak</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 pt-1">
                  <div className="w-7.5 h-7.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-[10px] text-emerald-700">AK</div>
                  <div>
                    <div className="text-[10.5px] font-extrabold text-slate-900 dark:text-white">Arun Kumar</div>
                    <div className="text-[9px] font-bold text-emerald-600">Leaderboard #2 • 450 pts</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>


        {/* STATISTICS SECTION (With Interactive Count-Up) */}
        <section id="statistics" className="bg-slate-50/50 dark:bg-slate-900/10 border-t border-b border-slate-200/40 dark:border-slate-800 py-24 relative">
          <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
            
            <div className="text-center max-w-xl mx-auto space-y-3.5 mb-16">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">IMPACT IN REAL-TIME</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
                Our Collective Achievement
              </h2>
              <p className="text-[#6B7280] dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                Empowering neighborhoods to solve local issues in record times. Our stats prove our automated dispatch efficiency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-center">
              
              {/* Stat 1 */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1.5 hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl sm:text-5xl font-black text-[#111111] dark:text-white tracking-tight font-mono">
                  <AnimatedCounter value={98.4} decimals={1} suffix="%" />
                </div>
                <div className="text-[10px] font-black text-[#9CA3AF] dark:text-slate-500 uppercase tracking-widest leading-none">
                  AI Triage Accuracy
                </div>
                <p className="text-[9px] text-[#6B7280] dark:text-slate-400 font-semibold leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">Validated by manual inspection audits</p>
              </div>

              {/* Stat 2 */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1.5 hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl sm:text-5xl font-black text-[#111111] dark:text-white tracking-tight font-mono">
                  <AnimatedCounter value={12} decimals={0} suffix="s" />
                </div>
                <div className="text-[10px] font-black text-[#9CA3AF] dark:text-slate-500 uppercase tracking-widest leading-none">
                  Average Response SLA
                </div>
                <p className="text-[9px] text-[#6B7280] dark:text-slate-400 font-semibold leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">From upload upload to active dispatch routing</p>
              </div>

              {/* Stat 3 */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1.5 hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight font-mono">
                  <AnimatedCounter value={activeCitizens} decimals={0} suffix="+" />
                </div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                  Citizens Empowered
                </div>
                <p className="text-[9px] text-indigo-500/80 dark:text-indigo-400/80 font-bold leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">Actively reporting and verifying hazards</p>
              </div>

              {/* Stat 4 */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1.5 hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                  <AnimatedCounter value={resolvedIssues} decimals={0} suffix="+" />
                </div>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                  Issues Resolved
                </div>
                <p className="text-[9px] text-emerald-500/80 dark:text-emerald-400/80 font-bold leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">Successfully repaired and closed tickets</p>
              </div>

              {/* Stat 5 */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-2xs space-y-1.5 hover:shadow-md transition-shadow duration-300">
                <div className="text-4xl sm:text-5xl font-black text-amber-500 dark:text-amber-400 tracking-tight font-mono">
                  <AnimatedCounter value={4.9} decimals={1} suffix="★" />
                </div>
                <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                  Community Rating
                </div>
                <p className="text-[9px] text-amber-600 dark:text-amber-400/80 font-bold leading-relaxed mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">App store rating in public utilities sector</p>
              </div>

            </div>
          </div>
        </section>


        {/* TESTIMONIALS SECTION (Modern startup style cards) */}
        <section className="max-w-[1360px] mx-auto px-6 sm:px-10 py-24">
          <div className="text-center max-w-xl mx-auto space-y-3.5 mb-16">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] block">TRUSTED BY EXPERTS & PUBLIC</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] dark:text-white tracking-tight">
              Community Vouched
            </h2>
            <p className="text-[#6B7280] dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
              Discover how CiviMind changes the relationship between residents and local municipal infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="p-8 bg-[#FAFAFA] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[20px] space-y-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-amber-400 text-lg flex">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs leading-relaxed italic">
                  &ldquo;Gemini reduced our manual verification time by 90%. We can now prioritize and address critical safety hazards within 24 hours instead of weeks of paperwork.&rdquo;
                </p>
              </div>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">BB</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Dr. B. Bhat</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Chief BBMP Infra Coordinator</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 bg-[#FAFAFA] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[20px] space-y-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-amber-400 text-lg flex">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs leading-relaxed italic">
                  &ldquo;Reporting water waste used to be a bureaucratic nightmare. With CiviMind, the leak near my house was mapped and fixed in under a day. Phenomenal efficiency.&rdquo;
                </p>
              </div>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold text-xs text-indigo-700 dark:text-indigo-400 shrink-0">AK</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Anita K.</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Koramangala Community Leader</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 bg-[#FAFAFA] dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[20px] space-y-5 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-amber-400 text-lg flex">★★★★★</div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-xs leading-relaxed italic">
                  &ldquo;The gamified XP and leaderboard created a genuine competitive spirit in our neighborhood. The streets have never been cleaner, and resolved tickets actually show up.&rdquo;
                </p>
              </div>
              <div className="flex items-center space-x-3.5 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center font-bold text-xs text-emerald-700 dark:text-emerald-400 shrink-0">RS</div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Rahul S.</h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Active Civic Champion</p>
                </div>
              </div>
            </div>

          </div>
        </section>


        {/* FINAL MASSIVE CTA WITH AMBIENT BACK-GLOW */}
        <section className="max-w-[1360px] mx-auto px-6 sm:px-10 pb-28 pt-10">
          <div className="bg-slate-950 text-white rounded-[32px] p-8 md:p-20 text-center space-y-8 relative overflow-hidden shadow-2xl">
            {/* Background glowing gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[110px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 pointer-events-none"></div>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black tracking-widest text-indigo-300 uppercase">
              <Sparkle className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>CiviMind AI Operations</span>
            </span>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Ready to build <br className="sm:hidden" />
              better neighborhoods?
            </h2>
            
            <p className="text-slate-400 font-medium text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Join thousands of citizens working together with municipal crews to build cleaner, safer, and faster communities in Bengaluru.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/app-auth">
                <button className="w-full sm:w-auto px-10 py-5 bg-white hover:bg-slate-100 text-[#111111] font-black rounded-full transition-all text-sm shadow-md cursor-pointer hover:scale-103 duration-300">
                  Launch App Today
                </button>
              </Link>
              <Link href="/app-auth">
                <button className="w-full sm:w-auto px-9 py-5 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-white font-extrabold rounded-full transition-all text-sm cursor-pointer hover:scale-103 duration-300">
                  Register Citizen Account
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Elegant Hairline Divider */}
      <div className="border-t border-slate-200 dark:border-slate-800 max-w-[1360px] mx-auto w-full"></div>

      {/* Footer Section */}
      <footer className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-[1360px] mx-auto px-8 sm:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 text-xs font-semibold text-slate-500 dark:text-slate-400">
          
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[9px] font-black">C</div>
              <span className="font-extrabold text-slate-800 dark:text-white text-sm">CiviMind AI</span>
            </div>
            <p className="text-[#6B7280] dark:text-slate-400 font-medium leading-relaxed max-w-xs">
              Autonomous civic triaging, real-time community mapping, and gamified public rewards. Powered by Google Gemini and Google Maps.
            </p>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              © 2026 CiviMind AI. All Rights Reserved. Empowering Bengaluru local communities.
            </div>
          </div>

          {/* Links Cols */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-extrabold text-[#111111] dark:text-white uppercase tracking-wider text-[10px]">Product</h4>
            <div className="flex flex-col space-y-2">
              <a href="#dashboard-console" className="hover:text-slate-800 dark:hover:text-white transition-colors">Operations Console</a>
              <a href="#features" className="hover:text-[#111111] dark:hover:text-white transition-colors">Core Features</a>
              <a href="#how-it-works" className="hover:text-[#111111] dark:hover:text-white transition-colors">Timeline Flow</a>
              <Link href="/app-auth"><span className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer">Launch Platform</span></Link>
            </div>
          </div>

          {/* Technical Stack Col */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-extrabold text-[#111111] dark:text-white uppercase tracking-wider text-[10px]">Technical Stack</h4>
            <div className="flex flex-col space-y-2">
              <span className="text-[#6B7280] dark:text-slate-400">Google Gemini 1.5</span>
              <span className="text-[#6B7280] dark:text-slate-400">Google Maps SDK</span>
              <span className="text-[#6B7280] dark:text-slate-400">Firebase DB</span>
              <span className="text-[#6B7280] dark:text-slate-400">Cloud Run Containers</span>
            </div>
          </div>

          {/* Developer Col */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-extrabold text-[#111111] dark:text-white uppercase tracking-wider text-[10px]">Developer</h4>
            <div className="flex flex-col space-y-2">
              <span className="text-[#6B7280] dark:text-slate-400">Google Gemini Hackathon</span>
              <span className="text-[#6B7280] dark:text-slate-400">Next.js SPA Mode</span>
              <span className="text-[#6B7280] dark:text-slate-400">Tailwind Framework</span>
              <span className="text-[#6B7280] dark:text-slate-400">TypeScript Strict</span>
            </div>
          </div>

          {/* Legal Col */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-extrabold text-[#111111] dark:text-white uppercase tracking-wider text-[10px]">Legal</h4>
            <div className="flex flex-col space-y-2">
              <a href="#" className="hover:text-[#111111] dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#111111] dark:hover:text-white transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-[#111111] dark:hover:text-white transition-colors">SLA Commitments</a>
            </div>
          </div>

        </div>
      </footer>

    </AuroraHero>
  );
};

export default Landing;
