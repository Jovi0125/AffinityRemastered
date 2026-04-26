"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { X, MapPin, Calendar, Tag, Handshake, UserRound, ChevronDown, MessageCircle, Heart, Sparkles, Clock, Zap } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";
import type { SupabaseProfile } from "@/data/profiles";
import { allInterests, availabilityOptions } from "@/data/profiles";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useBlocks } from "@/hooks/useBlocks";
import { useTheme } from "@/components/providers/ThemeProvider";
import { calculateAffinityScore } from "@/hooks/useAffinityScore";
import { useConnections } from "@/hooks/useConnections";
import { useRouter } from "next/navigation";
import Link from "next/link";

// All unique countries from profiles (populated from Supabase) plus common ones
const COMMON_COUNTRIES = [
  "Australia","Brazil","Canada","China","France","Germany","India","Indonesia",
  "Italy","Japan","Malaysia","Mexico","Netherlands","New Zealand","Nigeria",
  "Philippines","Poland","Russia","Saudi Arabia","Singapore","South Africa",
  "South Korea","Spain","Sweden","Taiwan","Thailand","Turkey","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Vietnam",
];

function getProfileCategory(profile: SupabaseProfile): string {
  const i = profile.interests || [];
  if (i.some((x) => ["Hiking","Travel","Camping","Yoga","Fitness"].includes(x))) return "Lifestyle & Travel";
  if (i.some((x) => ["Film Photography","Urban Photography","Architecture","Film"].includes(x))) return "Arts & Culture";
  if (i.some((x) => ["Coffee","Cooking","Books","Literature","Tea Ceremony"].includes(x))) return "Culture & Leisure";
  if (i.some((x) => ["Typography","Graphic Design","Woodworking","Ceramics"].includes(x))) return "Creative";
  if (i.some((x) => ["Jazz","Vinyl Records","Music"].includes(x))) return "Music";
  return i[0] || "Companion";
}


// ─── Swipe Card ─────────────────────────────────────────────────────────────
interface SwipeCardProps {
  profile: SupabaseProfile & { last_seen_at?: string };
  affinityScore: number;
  onPass: () => void;
  onConnect: () => void;
  exitDir: "left" | "right" | null;
}

function SwipeCard({ profile, affinityScore, onPass, onConnect, exitDir }: SwipeCardProps) {
  const name = profile.full_name || "Companion";
  const interests = profile.interests || [];
  const { theme } = useTheme();
  const dk = theme === "dark";
  const dragRef = useRef({ dragging: false, startX: 0, dx: 0 });
  const [drag, setDrag] = useState({ dx: 0, dragging: false });

  useEffect(() => {
    if (!exitDir) setDrag({ dx: 0, dragging: false });
  }, [exitDir]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (exitDir) return;
    dragRef.current = { dragging: true, startX: e.clientX, dx: 0 };
    setDrag({ dx: 0, dragging: true });
  }, [exitDir]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      dragRef.current.dx = dx;
      setDrag({ dx, dragging: true });
    };
    const onUp = () => {
      if (!dragRef.current.dragging) return;
      const { dx } = dragRef.current;
      dragRef.current.dragging = false;
      if (dx > 100) onConnect();
      else if (dx < -100) onPass();
      else setDrag({ dx: 0, dragging: false });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [onPass, onConnect]);

  let tx = drag.dx, rotate = drag.dx * 0.08, opacity = 1;
  let transition = drag.dragging ? "none" : "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease";
  if (exitDir === "left")  { tx = -900; rotate = -30; opacity = 0; transition = "transform 0.42s cubic-bezier(0.55,0,1,0.45), opacity 0.35s ease"; }
  if (exitDir === "right") { tx =  900; rotate =  30; opacity = 0; transition = "transform 0.42s cubic-bezier(0.55,0,1,0.45), opacity 0.35s ease"; }

  const passOpacity    = drag.dx < 0 ? Math.min(1, Math.abs(drag.dx) / 120) : 0;
  const connectOpacity = drag.dx > 0 ? Math.min(1, drag.dx / 120) : 0;

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        borderRadius: 24, overflow: "hidden", backgroundColor: dk ? "#16181c" : "#fff",
        boxShadow: drag.dragging ? (dk ? "0 28px 70px rgba(0,0,0,0.5)" : "0 28px 70px rgba(0,0,0,0.22)") : (dk ? "0 20px 60px rgba(0,0,0,0.4)" : "0 20px 60px rgba(0,0,0,0.14)"),
        width: "100%", maxWidth: 380,
        cursor: drag.dragging ? "grabbing" : "grab", userSelect: "none",
        transform: `translate(${tx}px, 0px) rotate(${rotate}deg)`,
        transition, opacity, position: "relative",
      }}
    >
      {passOpacity > 0 && (
        <div style={{ position:"absolute",inset:0,zIndex:10,borderRadius:24,pointerEvents:"none", background:`rgba(239,68,68,${passOpacity*0.35})`, display:"flex",alignItems:"center",paddingLeft:"1.5rem" }}>
          <div style={{ border:"3px solid rgba(239,68,68,0.85)",borderRadius:8,padding:"0.35rem 0.75rem",opacity:passOpacity,transform:"rotate(-15deg)" }}>
            <span style={{ fontSize:"1.25rem",fontWeight:800,color:"rgba(239,68,68,0.9)",letterSpacing:2 }}>PASS</span>
          </div>
        </div>
      )}
      {connectOpacity > 0 && (
        <div style={{ position:"absolute",inset:0,zIndex:10,borderRadius:24,pointerEvents:"none", background:`rgba(124,58,237,${connectOpacity*0.3})`, display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:"1.5rem" }}>
          <div style={{ border:"3px solid rgba(124,58,237,0.85)",borderRadius:8,padding:"0.35rem 0.75rem",opacity:connectOpacity,transform:"rotate(15deg)" }}>
            <span style={{ fontSize:"1.25rem",fontWeight:800,color:"rgba(124,58,237,0.9)",letterSpacing:2 }}>CONNECT</span>
          </div>
        </div>
      )}

      <div style={{ position:"relative", paddingBottom:"95%", backgroundColor:"#1a1a2e" }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={name} draggable={false}
            style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover" }} />
        ) : (
          <div style={{ position:"absolute",top:0,left:0,width:"100%",height:"100%",
            background:"linear-gradient(135deg,#1a1a2e 0%,#2d1b4e 50%,#3b1f6a 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"5rem",fontWeight:700,color:"rgba(124,58,237,0.35)" }}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ position:"absolute",bottom:0,left:0,right:0,
          background:"linear-gradient(to top,rgba(0,0,0,0.65) 0%,transparent 100%)",
          padding:"2rem 1.25rem 1rem" }}>
          <span style={{ fontSize:"0.75rem",fontWeight:600,color:"rgba(255,255,255,0.9)",letterSpacing:"0.04em" }}>
            {getProfileCategory(profile)}
          </span>
        </div>
      </div>

      <div style={{ padding:"1.375rem 1.5rem 1.5rem" }}>
        <h2 className="font-display" style={{ fontSize:"1.5rem",fontWeight:700,color: dk ? "#e7e9ea" : "#1a1a2e",marginBottom:"0.5rem",letterSpacing:"-0.02em" }}>
          {name}
        </h2>
        {profile.bio && (
          <p style={{ fontSize:"0.875rem",color:"#7c3aed",fontStyle:"italic",lineHeight:1.55,marginBottom:"1rem",
            overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const }}>
            &ldquo;{profile.bio}&rdquo;
          </p>
        )}
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {interests.slice(0,3).map((interest) => (
            <span key={interest} style={{ fontSize:"0.75rem",fontWeight:500,color: dk ? "#a855f7" : "#555",
              padding:"0.3rem 0.75rem",borderRadius:20,backgroundColor: dk ? "rgba(168,85,247,0.12)" : "#f5f3ff",border: dk ? "1px solid rgba(168,85,247,0.2)" : "1px solid #ede9fe" }}>
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible filter section ──────────────────────────────────────────────
function FilterSection({ icon, label, active, children }: {
  icon: React.ReactNode; label: string; active: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const dk = theme === "dark";
  return (
    <div style={{ marginBottom: 4 }}>
      <button onClick={() => setOpen(v => !v)} style={{
        display:"flex",alignItems:"center",gap:10,width:"100%",
        background: active ? (dk ? "rgba(168,85,247,0.12)" : "#f5f3ff") : "none", border:"none", cursor:"pointer",
        padding:"0.625rem 0.75rem", borderRadius:10, transition:"background 0.15s ease",
        justifyContent:"space-between",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {icon}
          <span style={{ fontSize:"0.8125rem",fontWeight: active ? 600 : 400, color: active ? "#7c3aed" : (dk ? "#e7e9ea" : "#555") }}>{label}</span>
          {active && <span style={{ width:6,height:6,borderRadius:"50%",backgroundColor:"#7c3aed",flexShrink:0 }} />}
        </div>
        <ChevronDown size={13} color="#a1a1aa" style={{ transform: open ? "rotate(180deg)" : "none", transition:"transform 0.2s" }} />
      </button>
      {open && (
        <div style={{ padding:"0.5rem 0.75rem 0.75rem", borderRadius:10, backgroundColor: dk ? "#1d1f23" : "#fafafa", marginTop:2 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [filterAvailability, setFilterAvailability] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [profiles, setProfiles] = useState<(SupabaseProfile & { last_seen_at?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDir, setExitDir] = useState<"left"|"right"|null>(null);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [pendingFilters, setPendingFilters] = useState({ interests: [] as string[], availability: "", location: "" });
  const [appliedFilters, setAppliedFilters] = useState({ interests: [] as string[], availability: "", location: "" });
  const [toast, setToast] = useState<{ name: string; type: "sent"|"already_sent" } | null>(null);
  const [matchPopup, setMatchPopup] = useState<{ name: string; avatar: string | null; shared: string[] } | null>(null);

  const { user, profile: myProfile } = useAuth();
  const { blockedIds } = useBlocks();
  const { sendConnect } = useConnections();
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  const d = theme === "dark";

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,avatar_url,cover_url,location,bio,interests,availability,last_seen_at")
        .order("created_at", { ascending: false });
      if (data) {
        setProfiles((user ? data.filter((p: SupabaseProfile) => p.id !== user.id) : data) as (SupabaseProfile & { last_seen_at?: string })[]);
      }
      setLoading(false);
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    let result = profiles
      .filter(p => !blockedIds.includes(p.id))
      .filter(p => !passedIds.includes(p.id))
      .filter(p => !appliedFilters.availability || p.availability === appliedFilters.availability)
      .filter(p => !appliedFilters.location || p.location === appliedFilters.location)
      .filter(p => appliedFilters.interests.length === 0 ||
        appliedFilters.interests.some(i => (p.interests || []).includes(i)));

    const mi = myProfile?.interests || [];
    if (mi.length > 0) {
      result = [...result].sort((a, b) =>
        calculateAffinityScore(mi, b.interests || []) - calculateAffinityScore(mi, a.interests || [])
      );
    }
    return result;
  }, [profiles, blockedIds, passedIds, appliedFilters, myProfile?.interests]);

  const currentProfile = filtered[currentIndex] ?? null;
  const nextProfile = filtered[currentIndex + 1] ?? null;
  const affinityScore = currentProfile && user
    ? calculateAffinityScore(myProfile?.interests || [], currentProfile.interests || [])
    : 0;

  const sharedInterests = useMemo(() => {
    if (!currentProfile || !myProfile?.interests) return [];
    const mySet = new Set(myProfile.interests);
    return (currentProfile.interests || []).filter(i => mySet.has(i));
  }, [currentProfile, myProfile?.interests]);

  const onlineStatus = useMemo(() => {
    if (!currentProfile?.last_seen_at) return "offline";
    const diff = Date.now() - new Date(currentProfile.last_seen_at).getTime();
    if (diff < 5 * 60 * 1000) return "online";
    if (diff < 30 * 60 * 1000) return "recently";
    return "offline";
  }, [currentProfile]);

  const advance = useCallback((dir: "left"|"right") => {
    setExitDir(dir);
    setTimeout(() => {
      if (currentProfile) setPassedIds(prev => [...prev, currentProfile.id]);
      setCurrentIndex(i => i + 1);
      setExitDir(null);
    }, 420);
  }, [currentProfile]);

  const handleConnect = useCallback(async () => {
    if (!user || !currentProfile) { advance("right"); return; }
    const name = currentProfile.full_name?.split(" ")[0] || "them";
    const avatar = currentProfile.avatar_url;
    const mySet = new Set(myProfile?.interests || []);
    const shared = (currentProfile.interests || []).filter(i => mySet.has(i));
    advance("right");
    const result = await sendConnect(user.id, currentProfile.id);
    if (result === "sent" && shared.length > 0) {
      setMatchPopup({ name, avatar, shared });
    } else {
      setToast({ name, type: result });
      setTimeout(() => setToast(null), 2800);
    }
  }, [user, currentProfile, myProfile?.interests, advance, sendConnect]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (matchPopup) { if (e.key === "Escape" || e.key === "Enter") setMatchPopup(null); return; }
      if (!currentProfile || exitDir) return;
      if (e.key === "ArrowLeft") advance("left");
      if (e.key === "ArrowRight") handleConnect();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentProfile, exitDir, matchPopup, advance, handleConnect]);

  const handleApply = () => {
    setAppliedFilters(pendingFilters);
    setPassedIds([]);
    setCurrentIndex(0);
  };

  const hasFilters = appliedFilters.interests.length > 0 || !!appliedFilters.availability || !!appliedFilters.location;

  const togglePendingInterest = (tag: string) =>
    setPendingFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter(t => t !== tag)
        : [...prev.interests, tag],
    }));

  return (
    <>  
    <PageTransition>
      <div style={{ backgroundColor: d ? "#000" : "#f4f3fa", minHeight:"100vh", paddingTop:"3.5rem" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5">
          <div style={{ display:"flex", gap:24, alignItems:"flex-start" }}>

            {/* ─── Sidebar ─── */}
            <aside className="hidden lg:flex" style={{
              width:230, flexShrink:0, flexDirection:"column",
              backgroundColor: d ? "#16181c" : "#fff", borderRadius:20, padding:"1.5rem 1.25rem",
              boxShadow: d ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)", position:"sticky", top:"5rem",
            }}>
              <h2 style={{ fontSize:"1rem",fontWeight:700,color: d ? "#e7e9ea" : "#1a1a2e",marginBottom:"0.25rem" }}>
                Discovery Filters
              </h2>
              <p style={{ fontSize:"0.6875rem",color:"#a1a1aa",marginBottom:"1.25rem" }}>
                Refine your search
              </p>

              {/* Availability */}
              <FilterSection
                icon={<Calendar size={14} color="#7c3aed" />}
                label="Availability"
                active={!!pendingFilters.availability}
              >
                {availabilityOptions.map(opt => (
                  <label key={opt} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,cursor:"pointer" }}>
                    <input type="radio" name="avail" value={opt}
                      checked={pendingFilters.availability === opt}
                      onChange={() => setPendingFilters(p => ({ ...p, availability: p.availability === opt ? "" : opt }))}
                      style={{ accentColor:"#7c3aed" }}
                    />
                    <span style={{ fontSize:"0.75rem",color:"#555" }}>{opt}</span>
                  </label>
                ))}
              </FilterSection>

              {/* Location */}
              <FilterSection
                icon={<MapPin size={14} color="#7c3aed" />}
                label="Location"
                active={!!pendingFilters.location}
              >
                <div style={{ position:"relative" }}>
                  <select
                    value={pendingFilters.location}
                    onChange={e => setPendingFilters(p => ({ ...p, location: e.target.value }))}
                    style={{
                      width:"100%", fontSize:"0.75rem", color: pendingFilters.location ? "#1a1a2e" : "#a1a1aa",
                      border:"1px solid #ede9fe", borderRadius:8, padding:"0.4rem 1.5rem 0.4rem 0.5rem",
                      backgroundColor:"#fff", cursor:"pointer", outline:"none",
                      appearance:"none", WebkitAppearance:"none",
                    }}
                  >
                    <option value="">Any country</option>
                    {COMMON_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} color="#a1a1aa" style={{ position:"absolute",right:6,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} />
                </div>
              </FilterSection>

              {/* Interests */}
              <FilterSection
                icon={<Tag size={14} color="#7c3aed" />}
                label="Interests"
                active={pendingFilters.interests.length > 0}
              >
                <div style={{ display:"flex",flexWrap:"wrap",gap:5,maxHeight:160,overflowY:"auto" }}>
                  {allInterests.map(tag => {
                    const active = pendingFilters.interests.includes(tag);
                    return (
                      <button key={tag} onClick={() => togglePendingInterest(tag)} style={{
                        fontSize:"0.6875rem",fontWeight:500,
                        padding:"0.2rem 0.55rem", borderRadius:20,
                        border:"1px solid", borderColor: active ? "#7c3aed" : "#e5e5f7",
                        backgroundColor: active ? "#7c3aed" : "#f5f3ff",
                        color: active ? "#fff" : "#7c3aed",
                        cursor:"pointer", transition:"all 0.15s ease",
                      }}>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Apply */}
              <button
                onClick={handleApply}
                style={{
                  marginTop:"1.25rem", width:"100%", padding:"0.7rem", borderRadius:24,
                  background:"linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
                  color:"#fff", fontSize:"0.8125rem", fontWeight:600,
                  border:"none", cursor:"pointer",
                  transition:"opacity 0.15s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                Apply Filters
              </button>

              {hasFilters && (
                <button
                  onClick={() => { setAppliedFilters({ interests:[], availability:"", location:"" }); setPendingFilters({ interests:[], availability:"", location:"" }); setPassedIds([]); setCurrentIndex(0); }}
                  style={{ marginTop:8,width:"100%",padding:"0.4rem",fontSize:"0.75rem",color:"#a1a1aa",background:"none",border:"none",cursor:"pointer" }}
                >
                  Clear all filters
                </button>
              )}
            </aside>

            {/* ─── Center ─── */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:28, minWidth:0 }}>
              {!loading && currentProfile && (
                <div style={{ display:"flex",alignItems:"center",gap:12,justifyContent:"center" }}>
                  <p style={{ fontSize:"0.75rem",color:"#b0aac8",letterSpacing:"0.04em" }}>
                    ← drag to pass &nbsp;·&nbsp; drag to connect →
                  </p>
                  <span style={{ fontSize:"0.6875rem",color:"#a1a1aa",backgroundColor: d ? "rgba(168,85,247,0.12)" : "#ede9fe",padding:"0.15rem 0.5rem",borderRadius:12,fontWeight:500 }}>
                    {currentIndex + 1} / {filtered.length}
                  </span>
                </div>
              )}
              {hasFilters && (
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center" }}>
                  {appliedFilters.availability && (
                    <span style={{ fontSize:"0.6875rem",padding:"0.2rem 0.6rem",borderRadius:20,backgroundColor:"#ede9fe",color:"#7c3aed",fontWeight:500 }}>
                      {appliedFilters.availability}
                    </span>
                  )}
                  {appliedFilters.location && (
                    <span style={{ fontSize:"0.6875rem",padding:"0.2rem 0.6rem",borderRadius:20,backgroundColor:"#ede9fe",color:"#7c3aed",fontWeight:500 }}>
                      {appliedFilters.location}
                    </span>
                  )}
                  {appliedFilters.interests.map(i => (
                    <span key={i} style={{ fontSize:"0.6875rem",padding:"0.2rem 0.6rem",borderRadius:20,backgroundColor:"#ede9fe",color:"#7c3aed",fontWeight:500 }}>
                      {i}
                    </span>
                  ))}
                </div>
              )}

              {loading ? (
                <div style={{ width:"100%",maxWidth:380,borderRadius:24,height:520,
                  background:"linear-gradient(135deg,#ede9fe,#c4b5fd,#ede9fe)",
                  backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite linear" }} />
              ) : currentProfile === null ? (
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"5rem 2rem",textAlign:"center",gap:16 }}>
                  <div style={{ width:48,height:48,borderRadius:"50%",background:"linear-gradient(135deg,#ede9fe,#c4b5fd)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <UserRound size={22} color="#7c3aed" />
                  </div>
                  <p className="font-display" style={{ fontSize:"1.5rem",fontWeight:700,color:"#1a1a2e" }}>
                    You&apos;ve seen everyone!
                  </p>
                  <p style={{ fontSize:"0.875rem",color:"#a1a1aa" }}>Check back soon for new companions.</p>
                  <button onClick={() => { setPassedIds([]); setCurrentIndex(0); }}
                    style={{ marginTop:8,padding:"0.625rem 1.5rem",borderRadius:24,fontSize:"0.875rem",fontWeight:600,
                      background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"#fff",border:"none",cursor:"pointer" }}>
                    Start Over
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ position:"relative",width:"100%",maxWidth:380 }}>
                    {nextProfile && (
                      <div style={{ position:"absolute",top:12,left:"50%",
                        transform:"translateX(-50%) scale(0.94)",
                        width:"100%",maxWidth:380,height:80,
                        borderRadius:24,backgroundColor:"rgba(124,58,237,0.07)",zIndex:0 }} />
                    )}
                    <div style={{ position:"relative",zIndex:1 }}>
                      <SwipeCard
                        key={currentProfile.id}
                        profile={currentProfile}
                        affinityScore={affinityScore}
                        onPass={() => advance("left")}
                        onConnect={handleConnect}
                        exitDir={exitDir}
                      />
                    </div>
                  </div>

                  <div style={{ display:"flex",alignItems:"center",gap:20 }}>
                    <ActionBtn onClick={() => advance("left")} title="Pass"
                      hoverBg="#fff0f0" hoverBorder="#fca5a5" hoverColor="#ef4444" size={52}>
                      <X size={20} />
                    </ActionBtn>
                    <button onClick={handleConnect} title="Connect"
                      style={{ width:66,height:66,borderRadius:"50%",
                        background:"linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
                        border:"none",display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:"pointer",
                        transition:"all 0.2s ease",color:"#fff" }}
                      onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; }}>
                      <Handshake size={26} />
                    </button>
                    <Link href={`/profile/${currentProfile.id}`} style={{ textDecoration:"none" }}>
                      <ActionBtn title="View Profile"
                        hoverBg="#f5f3ff" hoverBorder="#a78bfa" hoverColor="#7c3aed" size={52}>
                        <UserRound size={20} />
                      </ActionBtn>
                    </Link>
                  </div>
                </>
              )}
              </div>

              <div className="hidden xl:flex" style={{
                width:240, flexShrink:0, flexDirection:"column", gap:16,
                position:"sticky", top:"5rem",
              }}>
                {currentProfile && (
                  <>
                    {/* Affinity Score Card */}
                    <div style={{
                      backgroundColor: d ? "#16181c" : "#fff", borderRadius:20, padding:"1.5rem",
                      boxShadow: d ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:14,
                    }}>
                      <div style={{ position:"relative", width:80, height:80 }}>
                        <svg viewBox="0 0 36 36" style={{ width:80, height:80, transform:"rotate(-90deg)" }}>
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ede9fe" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#scoreGrad)" strokeWidth="2.5"
                            strokeLinecap="round" strokeDasharray={`${affinityScore * 0.974} 100`}
                            style={{ transition:"stroke-dasharray 0.6s ease" }} />
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#7c3aed" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{
                          position:"absolute", inset:0, display:"flex", flexDirection:"column",
                          alignItems:"center", justifyContent:"center",
                        }}>
                          <span style={{ fontSize:"1.25rem", fontWeight:700, color: d ? "#e7e9ea" : "#1a1a2e", lineHeight:1 }}>{affinityScore}</span>
                          <span style={{ fontSize:"0.5rem", color:"#a1a1aa", fontWeight:500, letterSpacing:"0.05em", textTransform:"uppercase" }}>affinity</span>
                        </div>
                      </div>
                      <p style={{ fontSize:"0.6875rem", color:"#a1a1aa", textAlign:"center", lineHeight:1.4 }}>
                        {affinityScore >= 50 ? "Strong match potential!" : affinityScore > 0 ? "Some shared vibes" : "Different worlds — explore!"}
                      </p>
                    </div>

                    {/* Info Card */}
                    <div style={{
                      backgroundColor: d ? "#16181c" : "#fff", borderRadius:20, padding:"1.25rem",
                      boxShadow: d ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
                    }}>
                      {/* Online status */}
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                        <div style={{
                          width:8, height:8, borderRadius:"50%",
                          backgroundColor: onlineStatus === "online" ? "#22c55e" : onlineStatus === "recently" ? "#f59e0b" : "#d1d5db",
                          boxShadow: onlineStatus === "online" ? "0 0 6px rgba(34,197,94,0.5)" : "none",
                        }} />
                        <span style={{ fontSize:"0.75rem", color:"#888", fontWeight:500 }}>
                          {onlineStatus === "online" ? "Online now" : onlineStatus === "recently" ? "Recently active" : "Offline"}
                        </span>
                      </div>

                      {/* Location */}
                      {currentProfile.location && (
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                          <MapPin size={13} color="#7c3aed" />
                          <span style={{ fontSize:"0.75rem", color:"#555" }}>{currentProfile.location}</span>
                        </div>
                      )}

                      {/* Availability */}
                      {currentProfile.availability && (
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                          <Clock size={13} color="#7c3aed" />
                          <span style={{ fontSize:"0.75rem", color:"#555" }}>{currentProfile.availability}</span>
                        </div>
                      )}

                      {/* Category */}
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <Zap size={13} color="#7c3aed" />
                        <span style={{ fontSize:"0.75rem", color:"#555" }}>{getProfileCategory(currentProfile)}</span>
                      </div>
                    </div>

                    {/* Shared Interests */}
                    {sharedInterests.length > 0 && (
                      <div style={{
                        backgroundColor: d ? "#16181c" : "#fff", borderRadius:20, padding:"1.25rem",
                        boxShadow: d ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)",
                      }}>
                        <p style={{ fontSize:"0.625rem", fontWeight:700, letterSpacing:"0.1em", color:"#7c3aed", textTransform:"uppercase", marginBottom:10 }}>
                          Shared Interests
                        </p>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {sharedInterests.map(interest => (
                            <span key={interest} style={{
                              fontSize:"0.6875rem", fontWeight:500, color:"#7c3aed",
                              padding:"0.25rem 0.625rem", borderRadius:20,
                              backgroundColor:"#f5f3ff", border:"1px solid #ede9fe",
                            }}>
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keyboard hints */}
                    <div style={{ display:"flex", justifyContent:"center", gap:12, paddingTop:4 }}>
                      <span style={{ fontSize:"0.625rem", color: d ? "#71767b" : "#ccc", display:"flex", alignItems:"center", gap:4 }}>
                        <kbd style={{ padding:"1px 5px", borderRadius:4, border: d ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e5e5", backgroundColor: d ? "#16181c" : "#fafafa", fontSize:"0.625rem", fontFamily:"inherit" }}>←</kbd> Pass
                      </span>
                      <span style={{ fontSize:"0.625rem", color: d ? "#71767b" : "#ccc", display:"flex", alignItems:"center", gap:4 }}>
                        <kbd style={{ padding:"1px 5px", borderRadius:4, border: d ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e5e5", backgroundColor: d ? "#16181c" : "#fafafa", fontSize:"0.625rem", fontFamily:"inherit" }}>→</kbd> Connect
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      {/* ─── Toast ─── */}
      {toast && (
        <div style={{
          position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
          zIndex:1000, display:"flex", alignItems:"center", gap:10,
          backgroundColor: toast.type === "sent" ? "#1a1a2e" : "#555",
          color:"#fff", padding:"0.75rem 1.25rem", borderRadius:20,
          boxShadow:"0 8px 32px rgba(0,0,0,0.22)",
          fontSize:"0.875rem", fontWeight:500,
          animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          whiteSpace:"nowrap",
        }}>
          <span style={{ fontSize:"1rem" }}>{toast.type === "sent" ? <Handshake size={16}/> : <span style={{opacity:0.6}}>·</span>}</span>
          {toast.type === "sent"
            ? `Connection request sent to ${toast.name}!`
            : `You already sent a request to ${toast.name}`}
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(12px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
@keyframes matchFadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes matchScaleIn { from { opacity:0; transform:translate(-50%,-50%) scale(0.7) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
@keyframes matchPulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.12) } }
@keyframes matchFloat { 0% { transform:translateY(0) } 50% { transform:translateY(-6px) } 100% { transform:translateY(0) } }
@keyframes matchShine { from { left:-100% } to { left:200% } }`}</style>

      {/* ─── Match Popup ─── */}
      {matchPopup && (
        <div onClick={() => setMatchPopup(null)} style={{
          position:"fixed", inset:0, zIndex:2000,
          backgroundColor:"rgba(26,26,46,0.75)", backdropFilter:"blur(8px)",
          animation:"matchFadeIn 0.3s ease",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:"90%", maxWidth:380,
            backgroundColor:"#fff", borderRadius:28,
            padding:"2.5rem 2rem 2rem",
            boxShadow:"0 32px 80px rgba(124,58,237,0.25), 0 0 0 1px rgba(124,58,237,0.08)",
            textAlign:"center",
            animation:"matchScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            overflow:"hidden",
          }}>
            {/* Shine sweep */}
            <div style={{ position:"absolute", top:0, left:"-100%", width:"50%", height:"100%",
              background:"linear-gradient(90deg, transparent, rgba(124,58,237,0.06), transparent)",
              animation:"matchShine 1.5s ease 0.4s", pointerEvents:"none" }} />

            {/* Sparkle icon */}
            <div style={{ marginBottom:16, animation:"matchPulse 1.5s ease infinite" }}>
              <div style={{
                width:64, height:64, borderRadius:"50%", margin:"0 auto",
                background:"linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#c084fc 100%)",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 8px 24px rgba(124,58,237,0.3)",
              }}>
                <Sparkles size={28} color="#fff" />
              </div>
            </div>

            <h2 className="font-display" style={{ fontSize:"1.75rem", fontWeight:800, color:"#1a1a2e", marginBottom:4, letterSpacing:"-0.02em" }}>
              It&apos;s a Match!
            </h2>
            <p style={{ fontSize:"0.875rem", color:"#888", marginBottom:20 }}>
              You and <span style={{ color:"#7c3aed", fontWeight:600 }}>{matchPopup.name}</span> share curated interests
            </p>

            {/* Shared interests */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", marginBottom:24 }}>
              {matchPopup.shared.map((interest, idx) => (
                <span key={interest} style={{
                  fontSize:"0.75rem", fontWeight:600, color:"#7c3aed",
                  padding:"0.3rem 0.75rem", borderRadius:20,
                  background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",
                  border:"1px solid #ddd6fe",
                  animation:`matchFloat 2s ease ${idx * 0.15}s infinite`,
                }}>
                  {interest}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setMatchPopup(null)} style={{
                padding:"0.7rem 1.5rem", borderRadius:24,
                background:"linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
                color:"#fff", fontSize:"0.8125rem", fontWeight:600,
                border:"none", cursor:"pointer", transition:"opacity 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, title, hoverBg, hoverBorder, hoverColor, size, children }: {
  onClick?: () => void; title: string;
  hoverBg: string; hoverBorder: string; hoverColor: string; size: number;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const dk = theme === "dark";
  const baseBg = dk ? "#16181c" : "#fff";
  const baseBorder = dk ? "rgba(255,255,255,0.1)" : "#e5e5f0";
  const baseColor = dk ? "#71767b" : "#888";
  return (
    <button onClick={onClick} title={title} style={{
      width:size,height:size,borderRadius:"50%",backgroundColor:baseBg,
      border:`1.5px solid ${baseBorder}`,display:"flex",alignItems:"center",
      justifyContent:"center",cursor:"pointer",
      boxShadow: dk ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",transition:"all 0.2s ease",color:baseColor,
    }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor=hoverBg; e.currentTarget.style.borderColor=hoverBorder; e.currentTarget.style.color=hoverColor; e.currentTarget.style.transform="scale(1.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor=baseBg; e.currentTarget.style.borderColor=baseBorder; e.currentTarget.style.color=baseColor; e.currentTarget.style.transform="scale(1)"; }}>
      {children}
    </button>
  );
}

