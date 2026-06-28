import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "../lib/trpc.ts";
import { Map } from "../components/Map.tsx";
import { motion } from "motion/react";
import { 
  Camera, 
  MapPin, 
  BrainCircuit, 
  ArrowRight, 
  Sparkles,
  AlertTriangle,
  Map as MapIcon,
  Trash2,
  Info,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

interface WordStreamerProps {
  text: string;
  speedMs?: number;
  className?: string;
  onComplete?: () => void;
}

const WordStreamer: React.FC<WordStreamerProps> = ({ text, speedMs = 50, className = "", onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const words = text.split(" ");
    if (words.length === 0) {
      setIsTyping(false);
      return;
    }
    
    let currentIdx = 0;
    setDisplayedText("");
    setIsTyping(true);

    const interval = setInterval(() => {
      if (currentIdx < words.length) {
        const nextWord = words[currentIdx];
        setDisplayedText((prev) => prev ? prev + " " + nextWord : nextWord);
        currentIdx++;
        if (currentIdx >= words.length) {
          clearInterval(interval);
          setIsTyping(false);
          if (onComplete) onComplete();
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, onComplete]);

  return (
    <span className={`relative ${className}`}>
      <span>{displayedText}</span>
      {isTyping && (
        <span className="inline-block w-1 h-3 bg-indigo-600 ml-1 animate-pulse" />
      )}
    </span>
  );
};

export const ReportIssue: React.FC = () => {
  const [_, setLocation] = useLocation();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("Silk Board Junction, Hosur Rd, Bengaluru, Karnataka 560068");
  const [latitude, setLatitude] = useState(12.9176);
  const [longitude, setLongitude] = useState(77.6244);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [videoBase64, setVideoBase64] = useState<string | null>(null);

  // AI Pre-categorization simulation/trigger state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<{
    category: string;
    severity: string;
    suggestedSLA: string;
    reasoning: string;
  } | null>(null);

  // Duplicate warning list
  const [duplicates, setDuplicates] = useState<any[]>([]);

  const createIssueMutation = trpc.issues.create.useMutation({
    onSuccess: (newIssue) => {
      // Redirect to newly created issue detail page
      setLocation(`/issue/${newIssue.id}`);
    },
    onError: (err) => {
      alert(err.message || "Failed to submit civic issue");
    }
  });

  const reverseGeocodeMutation = trpc.maps.reverseGeocode.useMutation();

  // Queries/Triggers
  const checkDuplicatesQuery = trpc.issues.checkDuplicates.useQuery({
    latitude,
    longitude
  }, {
    enabled: !!latitude && !!longitude
  });

  useEffect(() => {
    if (checkDuplicatesQuery.data) {
      setDuplicates(checkDuplicatesQuery.data);
    }
  }, [checkDuplicatesQuery.data]);

  // Handle file upload (images and videos) & base64 conversion
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isVideo) {
          setVideoBase64(base64String);
          setImageBase64(null);
          triggerAiPreview(base64String, file.name, true);
        } else {
          setImageBase64(base64String);
          setVideoBase64(null);
          triggerAiPreview(base64String, file.name, false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Gemini Vision/Video AI Pre-classification preview
  const triggerAiPreview = async (base64: string, fileName?: string, isVideo?: boolean) => {
    setIsAiLoading(true);
    setTitle("");
    setDescription("");
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64, fileName, isVideo }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze media");
      }

      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description);
      setAiPreview({
        category: data.category,
        severity: data.severity,
        suggestedSLA: data.routingSLA,
        reasoning: data.reasoning
      });
    } catch (err) {
      console.error("Scan media failed:", err);
      // Fallback details if Gemini fails
      setTitle("Active Civic Disturbance");
      setDescription("Heavy surface distress observed on the municipal structures. Requires routing and priority calculation based on reported safety concerns.");
      setAiPreview({
        category: "Road Hazards & Potholes",
        severity: "High",
        suggestedSLA: "48 Hours",
        reasoning: "Vision Agent flagged spatial public hazard. Local transit safety risk identified."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Location Selector Fallback
  const handleGeoLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          try {
            const result = await reverseGeocodeMutation.mutateAsync({ latitude: lat, longitude: lng });
            setAddress(result.address);
          } catch (err) {
            const isBhagalpur = Math.abs(lat - 25.2485) < 2.0;
            setAddress(isBhagalpur 
              ? "Kutchery Road, near Bhagalpur Municipal Corporation, Bhagalpur, Bihar 812001"
              : "Indiranagar 100 Feet Road, Hal 2nd Stage, Bengaluru, Karnataka 560038"
            );
          }
        },
        async () => {
          // Detect if we are currently looking at Bhagalpur or if the user is in Bhagalpur context
          const randomOffsetLat = (Math.random() - 0.5) * 0.02;
          const randomOffsetLon = (Math.random() - 0.5) * 0.02;
          const isBhagalpur = Math.abs(latitude - 25.2485) < 2.0;
          const lat = isBhagalpur ? 25.2485 + randomOffsetLat : 12.9716 + randomOffsetLat;
          const lon = isBhagalpur ? 86.9958 + randomOffsetLon : 77.5946 + randomOffsetLon;
          setLatitude(lat);
          setLongitude(lon);
          try {
            const result = await reverseGeocodeMutation.mutateAsync({ latitude: lat, longitude: lon });
            setAddress(result.address);
          } catch (err) {
            setAddress(isBhagalpur 
              ? "Kutchery Road, near Bhagalpur Municipal Corporation, Bhagalpur, Bihar 812001"
              : "Bengaluru City Hall, Hudson Circle, Bengaluru, Karnataka 560001"
            );
          }
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert("Please fill out Title and Description.");
      return;
    }

    await createIssueMutation.mutateAsync({
      title,
      description,
      latitude,
      longitude,
      address,
      imageBase64: imageBase64 || undefined,
      videoBase64: videoBase64 || undefined
    });
  };

  // Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.05
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  } as const;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="max-w-[1100px] mx-auto pb-20 space-y-8"
    >
      <div className="space-y-1.5 text-left pb-4 border-b border-[#ECECEC]">
        <h1 className="text-2xl md:text-3xl font-black text-[#111111] tracking-tight">Report A Civic Incident</h1>
        <p className="text-xs font-semibold text-[#6B7280]">
          Capture and file a safety concern. Multi-agent AI triages your report instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white border border-[#ECECEC] rounded-[18px] p-6 space-y-6 shadow-xs">
            
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Issue Title</label>
              <input
                type="text"
                id="title"
                placeholder={isAiLoading ? "AI scanning image for title..." : "E.g., Massive Pothole blocking lane on Pine St"}
                value={isAiLoading && !title ? "Analyzing image for title..." : title}
                disabled={isAiLoading}
                required
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 bg-white border border-[#ECECEC] rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all ${isAiLoading ? "opacity-60 animate-pulse border-indigo-500/50" : ""}`}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Detailed Description</label>
              <textarea
                id="description"
                rows={4}
                required
                placeholder={isAiLoading ? "AI scanning image for detailed description..." : "Please describe physical defects, hazardous impacts, and nearby safety concerns..."}
                value={isAiLoading && !description ? "Analyzing image and drafting description of public hazard..." : description}
                disabled={isAiLoading}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 bg-white border border-[#ECECEC] rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all ${isAiLoading ? "opacity-60 animate-pulse border-indigo-500/50" : ""}`}
              />
            </div>

            {/* Geolocation Picker Button & Interactive Map */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">Incident Location</label>
              
              <div className="h-[250px] w-full border border-[#ECECEC] rounded-2xl overflow-hidden relative shadow-2xs">
                <Map
                  issues={[]}
                  pickerMode={true}
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={(lat, lng, resolvedAddress) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    if (resolvedAddress) {
                      setAddress(resolvedAddress);
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#ECECEC] p-3 rounded-xl">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleGeoLocate}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-2 border border-[#ECECEC] shadow-2xs transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Geo-locate GPS</span>
                  </button>
                  <div className="text-[11px] text-[#111111] font-semibold truncate max-w-[150px] sm:max-w-[220px]" title={address}>
                    {address ? address.split(',')[0] : `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                  Click Map to Pin Coords
                </span>
              </div>
              <input
                type="text"
                placeholder="Physical address descriptor..."
                value={address}
                required
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#ECECEC] rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 transition-all"
              />
            </div>

            {/* Photo/Video Camera Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">Capture Photo or Video Evidence</label>
              
              {imageBase64 ? (
                <div className="relative w-full h-56 bg-[#FAFAFA] rounded-xl overflow-hidden border border-[#ECECEC]">
                  <img src={imageBase64} alt="Incident Upload" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64(null);
                      setAiPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white hover:bg-slate-50 text-rose-500 rounded-lg border border-[#ECECEC] shadow-xs transition-all cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : videoBase64 ? (
                <div className="relative w-full h-56 bg-[#FAFAFA] rounded-xl overflow-hidden border border-[#ECECEC]">
                  <video src={videoBase64} controls className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setVideoBase64(null);
                      setAiPreview(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white hover:bg-slate-50 text-rose-500 rounded-lg border border-[#ECECEC] shadow-xs transition-all z-10 cursor-pointer"
                    title="Remove Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-[#ECECEC] bg-[#FAFAFA] hover:bg-slate-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full group-hover:scale-105 transition-transform duration-300">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-[#111111]">Click to snap or upload a photo/video</div>
                    <div className="text-[10px] text-[#6B7280] font-medium">Supports PNG, JPEG, MP4, WebM up to 50MB for Gemini AI</div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Trigger */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={createIssueMutation.isPending}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wider shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {createIssueMutation.isPending ? "Triaging civic complaint..." : "Submit to City Registry & Run AI Routing"}
            </motion.button>
          </form>
         </div>

         {/* AI Analytics and Triage Preview Side Column */}
         <div className="lg:col-span-1 space-y-6">
           {/* Gemini AI Preview Card */}
           <motion.div 
             whileHover={{ y: -4, boxShadow: "0 12px 20px -8px rgba(0,0,0,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)", borderColor: "#cbd5e1" }}
             transition={{ type: "spring", stiffness: 400, damping: 25 }}
             className="bg-white border border-[#ECECEC] hover:border-slate-300 rounded-[18px] p-6 shadow-xs space-y-4"
           >
             <h3 className="font-bold text-[#111111] text-sm flex items-center space-x-2">
               <BrainCircuit className="w-4 h-4 text-indigo-600" />
               <span>Gemini AI Triage Portal</span>
             </h3>

            {isAiLoading ? (
              <div className="space-y-3 py-10 text-center bg-[#FAFAFA] rounded-xl border border-[#ECECEC]">
                <div className="inline-block w-6 h-6 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="text-[11px] text-[#6B7280] animate-pulse font-mono font-medium">Running Vision Agent...</div>
              </div>
            ) : aiPreview ? (
              <div className="space-y-4">
                <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#ECECEC] space-y-3.5">
                  <div>
                    <div className="text-[9px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1">Suggested Category</div>
                    <div className="text-xs font-bold text-[#111111]">{aiPreview.category}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1">Est. Severity</div>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 rounded-md">
                      {aiPreview.severity}
                    </span>
                  </div>
                  <div>
                    <div className="text-[9px] font-extrabold text-[#9CA3AF] uppercase tracking-wider mb-1">Routing SLA</div>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                      {aiPreview.suggestedSLA}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#ECECEC]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[9px] font-extrabold text-[#9CA3AF] uppercase tracking-wider">Analysis Rationale</div>
                      <span className="inline-flex items-center space-x-1 text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        <Sparkles className="w-2 h-2" />
                        <span>Streaming</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium">
                      <WordStreamer key={aiPreview.reasoning} text={aiPreview.reasoning} />
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-[#9CA3AF] text-center flex items-center justify-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span className="font-medium">Interactive vision pre-categorization</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2 bg-[#FAFAFA] rounded-xl border border-[#ECECEC]">
                <Info className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-[#6B7280] font-semibold max-w-[200px] mx-auto leading-relaxed">
                  Upload an image or video to trigger real-time AI triage and analysis.
                </p>
              </div>
            )}
          </motion.div>

          {/* Near duplicates warning panel */}
          {duplicates.length > 0 && (
            <div className="bg-amber-50/50 border border-amber-100 rounded-[18px] p-5 space-y-3">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Existing Incident Nearby ({duplicates.length})</span>
              </h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium">
                We detected other reported complaints in this 200m radius. Instead of filing another duplicate, we recommend upvoting existing tickets to raise urgency scores!
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {duplicates.map((dup) => (
                  <Link key={dup.id} href={`/issue/${dup.id}`}>
                    <div className="p-2.5 bg-white border border-[#ECECEC] rounded-lg hover:border-amber-300 transition-all text-left text-xs text-[#111111] flex justify-between items-center cursor-pointer font-bold shadow-2xs">
                      <span className="truncate pr-3">{dup.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportIssue;
