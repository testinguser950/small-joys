"use client";

import { useState, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { supabase } from "@/lib/supabase";

const NOTE_COLORS = ["#FEF3C7", "#FDE8D8", "#E8F4FD", "#F0FDF4", "#F5F0FF"];
const NOTE_ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-1.5deg", "1deg", "-2.5deg", "2deg"];

const COUNTRIES = [
  { name: "Afghanistan", code: "af" }, { name: "Albania", code: "al" }, { name: "Algeria", code: "dz" },
  { name: "Argentina", code: "ar" }, { name: "Australia", code: "au" }, { name: "Austria", code: "at" },
  { name: "Bangladesh", code: "bd" }, { name: "Belgium", code: "be" }, { name: "Brazil", code: "br" },
  { name: "Cambodia", code: "kh" }, { name: "Canada", code: "ca" }, { name: "Chile", code: "cl" },
  { name: "China", code: "cn" }, { name: "Colombia", code: "co" }, { name: "Croatia", code: "hr" },
  { name: "Czech Republic", code: "cz" }, { name: "Denmark", code: "dk" }, { name: "Egypt", code: "eg" },
  { name: "Ethiopia", code: "et" }, { name: "Finland", code: "fi" }, { name: "France", code: "fr" },
  { name: "Germany", code: "de" }, { name: "Ghana", code: "gh" }, { name: "Greece", code: "gr" },
  { name: "Hong Kong", code: "hk" }, { name: "Hungary", code: "hu" }, { name: "India", code: "in" },
  { name: "Indonesia", code: "id" }, { name: "Iran", code: "ir" }, { name: "Iraq", code: "iq" },
  { name: "Ireland", code: "ie" }, { name: "Israel", code: "il" }, { name: "Italy", code: "it" },
  { name: "Japan", code: "jp" }, { name: "Jordan", code: "jo" }, { name: "Kenya", code: "ke" },
  { name: "Malaysia", code: "my" }, { name: "Mexico", code: "mx" }, { name: "Morocco", code: "ma" },
  { name: "Myanmar", code: "mm" }, { name: "Nepal", code: "np" }, { name: "Netherlands", code: "nl" },
  { name: "New Zealand", code: "nz" }, { name: "Nigeria", code: "ng" }, { name: "Norway", code: "no" },
  { name: "Pakistan", code: "pk" }, { name: "Peru", code: "pe" }, { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" }, { name: "Portugal", code: "pt" }, { name: "Romania", code: "ro" },
  { name: "Russia", code: "ru" }, { name: "Saudi Arabia", code: "sa" }, { name: "Singapore", code: "sg" },
  { name: "South Africa", code: "za" }, { name: "South Korea", code: "kr" }, { name: "Spain", code: "es" },
  { name: "Sri Lanka", code: "lk" }, { name: "Sweden", code: "se" }, { name: "Switzerland", code: "ch" },
  { name: "Taiwan", code: "tw" }, { name: "Tanzania", code: "tz" }, { name: "Thailand", code: "th" },
  { name: "Turkey", code: "tr" }, { name: "Uganda", code: "ug" }, { name: "Ukraine", code: "ua" },
  { name: "United Arab Emirates", code: "ae" }, { name: "United Kingdom", code: "gb" },
  { name: "United States", code: "us" }, { name: "Vietnam", code: "vn" }, { name: "Zimbabwe", code: "zw" },
];

const SITE_URL = "https://smalljoyswall.com";

type Note = {
  id: string;
  text: string;
  city: string | null;
  country: string | null;
  country_code: string | null;
  flag: string | null;
  photo_url: string | null;
  created_at: string;
  color?: string;
  rotate?: string;
};

type Comment = {
  id: string;
  note_id: string;
  text: string;
  country: string | null;
  country_code: string | null;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function ReportButton({ noteId }: { noteId: string }) {
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  async function handleReport(e: React.MouseEvent) {
    e.stopPropagation();
    if (reported || reporting) return;
    setReporting(true);
    await fetch("/api/report-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });
    setReporting(false);
    setReported(true);
  }

  return (
    <button
      onClick={handleReport}
      title={reported ? "Reported" : "Report this note"}
      className="report-btn"
      style={{ color: reported ? "#C4763A" : undefined }}
    >
      <svg viewBox="0 0 24 24" fill={reported ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="12" height="12">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", fontWeight: 400 }}>
      {reported ? "reported" : "report"}
      </span>
    </button>
  );
}

function ReportCommentButton({ commentId }: { commentId: string }) {
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  async function handleReport(e: React.MouseEvent) {
    e.stopPropagation();
    if (reported || reporting) return;
    setReporting(true);
    await fetch("/api/report-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    setReporting(false);
    setReported(true);
  }

  return (
    <button
      onClick={handleReport}
      title={reported ? "Reported" : "Report this comment"}
      className="report-btn"
      style={{ color: reported ? "#C4763A" : undefined }}
    >
      <svg viewBox="0 0 24 24" fill={reported ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="10" height="10">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    </button>
  );
}

function CommentsSection({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);
  const maxChars = 280;

  useEffect(() => { loadComments(); }, []);

  async function loadComments() {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("note_id", noteId)
      .eq("approved", true)
      .order("created_at", { ascending: true });
    const result = data || [];
    setComments(result);
    if (result.length > 0) setOpen(true);
    setLoading(false);
  }

  async function handlePost() {
    if (!text.trim() || !countryName || posting) return;
    setPosting(true);
    const res = await fetch("/api/post-comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, text: text.trim(), country: countryName, country_code: countryCode }),
    });
    const data = await res.json();
    setPosting(false);
    if (data.error === "flagged") { alert("That one didn't make it through. Please keep it kind."); return; }
    if (!res.ok) { alert("Something went wrong. Please try again."); return; }
    setText("");
    setCountryName("");
    setCountryCode("");
    setDone(true);
    await loadComments();
    setTimeout(() => setDone(false), 2000);
  }

  return (
    <div style={{ marginTop: 10, borderTop: "1px solid rgba(0,0,0,0.07)", paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Reply icon button */}
        <button
          onClick={() => setShowForm(!showForm)}
          title="Leave a response"
          className="report-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", fontWeight: 400 }}>
            respond
          </span>
        </button>

        {/* Hide toggle — only show if comments are visible */}
        {open && comments.length > 0 && (
          <button
            onClick={() => setOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem", color: "#B8957E", padding: 0 }}
          >
            hide
          </button>
        )}
      </div>

      {/* Comments list */}
      {open && !loading && comments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {comments.map((c) => (
            <div key={c.id} style={{ background: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "8px 10px" }}>
              <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#2C1810", lineHeight: 1.5, margin: 0 }}>{c.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                {c.country_code && <img src={`https://flagcdn.com/${c.country_code.toLowerCase()}.svg`} alt={c.country || ""} style={{ width: 12, height: 9 }} />}
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.62rem", color: "#B8957E" }}>{c.country} · {timeAgo(c.created_at)}</span>
                <ReportCommentButton commentId={c.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form — toggled by respond button */}
      {showForm && (
        <div style={{ marginTop: 8 }}>
          {done ? (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#7CB87C", fontStyle: "italic" }}>🌿 Response added.</p>
          ) : (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, maxChars))}
                placeholder="Leave a response..."
                rows={2}
                style={{ width: "100%", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4, padding: "8px 10px", fontFamily: "'Caveat', cursive", fontSize: "1rem", color: "#2C1810", resize: "none", outline: "none", lineHeight: 1.5 }}
              />
              <div className="comment-country" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <div style={{ flex: 1 }}>
                  <CountryInput onSelect={(name, code) => { setCountryName(name); setCountryCode(code); }} />
                </div>
                <button
                  onClick={handlePost}
                  disabled={!text.trim() || !countryName || posting}
                  style={{ padding: "6px 14px", background: "#2C1810", border: "none", borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", fontWeight: 500, color: "#FAF6EF", cursor: "pointer", opacity: (!text.trim() || !countryName || posting) ? 0.4 : 1, whiteSpace: "nowrap" }}
                >
                  {posting ? "..." : "Post"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StickyNote({ note }: { note: Note }) {
  return (
    <div className="sticky-note" style={{ backgroundColor: note.color, transform: `rotate(${note.rotate})` }}>
      <p className="note-text">{note.text}</p>
      <div className="note-footer">
        {note.country && (
          <span className="note-city">
            {note.country_code && (
              <img src={`https://flagcdn.com/${note.country_code?.toLowerCase()}.svg`} alt={note.country} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px", marginTop: "-2px", width: "16px", height: "12px" }} />
            )}
            {note.country}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="note-time">{timeAgo(note.created_at)}</span>
          <ReportButton noteId={note.id} />
        </div>
      </div>
      <CommentsSection noteId={note.id} />
    </div>
  );
}

function CountryInput({ onSelect }: { onSelect: (name: string, code: string) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ name: string; code: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length === 0 ? [] : COUNTRIES.filter((c) =>
    c.name.toLowerCase().startsWith(query.toLowerCase())
  ).slice(0, 6);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(country: { name: string; code: string }) {
    setSelected(country);
    setQuery(country.name);
    setOpen(false);
    onSelect(country.name, country.code);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelected(null);
    setOpen(true);
    if (e.target.value === "") onSelect("", "");
  }

  return (
    <div ref={ref} className="country-input-wrap">
      <div className="country-input-inner">
        {selected && <img src={`https://flagcdn.com/${selected.code}.svg`} alt={selected.name} style={{ width: "16px", height: "12px", marginRight: "8px", flexShrink: 0 }} />}
        <input className="modal-country-input" placeholder="Your country (required)" value={query} onChange={handleChange} onFocus={() => query.length > 0 && setOpen(true)} autoComplete="off" />
      </div>
      {open && filtered.length > 0 && (
        <ul className="country-dropdown">
          {filtered.map((c) => (
            <li key={c.code} className="country-option" onMouseDown={() => handleSelect(c)}>
              <img src={`https://flagcdn.com/${c.code}.svg`} alt={c.name} style={{ width: "16px", height: "12px", flexShrink: 0 }} />
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostModal({ onClose, onPosted, prefillText }: { onClose: () => void; onPosted: () => void; prefillText?: string }) {
  const [text, setText] = useState(prefillText || "");
  const [countryName, setCountryName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);
  const hasPosted = useRef(false);
  const maxChars = 280;

  async function handlePost() {
    if (!text.trim()) return;
    if (hasPosted.current) return;
    hasPosted.current = true;
    setPosting(true);

    const res = await fetch("/api/post-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), country: countryName || null, country_code: countryCode || null, photo_url: null }),
    });

    const data = await res.json();
    setPosting(false);

    if (data.error === "rate_limited") { alert("You've already shared a joy in the last hour. Come back soon — we'll be here."); return; }
    if (data.error === "flagged") { alert("That one didn't make it through. Small Joys is a warm space — please keep it kind."); return; }
    if (!res.ok) { alert("Something went wrong. Please try again."); return; }

    setDone(true);
    setTimeout(() => { onPosted(); onClose(); }, 1500);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="modal-success">
            <p className="modal-success-icon">🌿</p>
            <p className="modal-success-text">Your joy is on the wall.</p>
          </div>
        ) : (
          <>
            <h2 className="modal-title">Share a small joy</h2>
            <p className="modal-subtitle">Anonymous. No account needed. Just something that made your day.</p>
            <textarea className="modal-textarea" placeholder="Today..." value={text} onChange={(e) => setText(e.target.value.slice(0, maxChars))} rows={4} autoFocus />
            <div className="modal-char-count">{text.length}/{maxChars}</div>
            <CountryInput onSelect={(name, code) => { setCountryName(name); setCountryCode(code); }} />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button className="btn-post" disabled={text.trim().length === 0 || !countryName || posting} onClick={handlePost}>
                {posting ? "Posting..." : "Post to the wall"}
              </button>
            </div>
            <p className="modal-disclaimer">Posts may take a few seconds to appear.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [todayNotes, setTodayNotes] = useState<Note[]>([]);
  const [olderNotes, setOlderNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [prefillText, setPrefillText] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
  const today = new Date().toISOString().split("T")[0];

  const [{ data: todayData }, { data: olderData }] = await Promise.all([
    supabase.from("notes").select("*").eq("approved", true)
      .gte("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false }).limit(50),
    supabase.from("notes").select("*").eq("approved", true)
      .lt("created_at", `${today}T00:00:00`)
      .order("created_at", { ascending: false }).limit(100),
  ]);

  const allNotes = [...(todayData || []), ...(olderData || [])];
  const withStyle = (arr: any[]) => arr.map((note, i) => ({
    ...note,
    color: NOTE_COLORS[i % NOTE_COLORS.length],
    rotate: NOTE_ROTATIONS[i % NOTE_ROTATIONS.length],
  }));

  setTodayNotes(withStyle(todayData || []));
  setOlderNotes(withStyle(olderData || []));
  setNotes(withStyle(allNotes));
  setLoading(false);
}

  useEffect(() => { loadNotes(); }, []);

  function openModal() {
    setPrefillText(undefined);
    setShowModal(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Caveat:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background-color: #FAF6EF;
          background-image: radial-gradient(circle at 20% 50%, rgba(254,243,199,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(253,232,216,0.3) 0%, transparent 40%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }
        .nav { display: flex; align-items: center; justify-content: center; padding: 20px 40px; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .nav-wordmark { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #2C1810; font-weight: 400; letter-spacing: 0.01em; }
        .nav-counter { display: flex; align-items: center; gap: 8px; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: #8B6F5E; font-weight: 400; }
        .nav-counter-dot { width: 7px; height: 7px; border-radius: 50%; background: #7CB87C; animation: pulse 2s infinite; flex-shrink: 0; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .nav-btn { background: #2C1810; color: #FAF6EF; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; padding: 10px 22px; border-radius: 100px; border: none; cursor: pointer; letter-spacing: 0.02em; transition: background 0.2s, transform 0.15s; }
        .nav-btn:hover { background: #4A2820; transform: translateY(-1px); }
        .hero { text-align: center; padding: 30px 24px 56px; border-bottom: 1px solid rgba(0,0,0,0.06); }
        .hero-title { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(2.2rem, 5vw, 3.8rem); color: #2C1810; line-height: 1.2; margin-bottom: 20px; font-weight: 400; }
        .hero-title-accent { color: #C4763A; font-style: italic; }
        .hero-sub { font-family: 'DM Sans', sans-serif; font-size: 0.95rem; color: #8B6F5E; font-weight: 300; margin-bottom: 32px; line-height: 1.6; }
        .share-wrap { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 20px; }
        .share-label { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 500; color: #B8957E; text-transform: uppercase; letter-spacing: 0.08em; }
        .masonry-grid { display: flex; gap: 20px; max-width: 1200px; margin: 0 auto; padding: 48px 24px 80px; }
        .masonry-column { display: flex; flex-direction: column; gap: 20px; }
        .wall-empty { max-width: 1200px; margin: 0 auto; padding: 80px 24px; text-align: center; font-family: 'DM Sans', sans-serif; color: #B8957E; font-weight: 300; font-size: 0.95rem; }
        .sticky-note { break-inside: avoid; display: inline-block; width: 100%; padding: 22px 20px 16px; border-radius: 2px; box-shadow: 2px 3px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; cursor: default; position: relative; }
        .sticky-note::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.04) 28px); border-radius: 2px; pointer-events: none; }
        .sticky-note:hover { transform: rotate(0deg) scale(1.02) !important; box-shadow: 4px 8px 20px rgba(0,0,0,0.12); z-index: 10; position: relative; }
        .note-text { font-family: 'Caveat', cursive; font-size: 1.2rem; line-height: 1.6; color: #2C1810; margin-bottom: 16px; position: relative; z-index: 1; }
        .note-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; position: relative; z-index: 1; }
        .note-city { font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 500; color: #8B6F5E; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65%; }
        .note-time { font-family: 'DM Sans', sans-serif; font-size: 0.68rem; color: #B8957E; font-weight: 300; white-space: nowrap; }
        .report-btn { background: none; border: none; cursor: pointer; padding: 2px; color: #C4A99A; display: flex; align-items: center; gap: 4px; transition: color 0.2s; }
        .report-btn:hover { color: #C4763A; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(44,24,16,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
        .modal { background: #FAF6EF; border-radius: 8px; padding: 36px 32px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
        .modal-success { text-align: center; padding: 20px 0; }
        .modal-success-icon { font-size: 2.5rem; margin-bottom: 12px; }
        .modal-success-text { font-family: 'Playfair Display', serif; font-size: 1.3rem; color: #2C1810; }
        .modal-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: #2C1810; margin-bottom: 8px; }
        .modal-subtitle { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: #8B6F5E; font-weight: 300; margin-bottom: 24px; line-height: 1.5; }
        .modal-textarea { width: 100%; background: #FFF8F0; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 14px 16px; font-family: 'Caveat', cursive; font-size: 1.2rem; color: #2C1810; resize: none; outline: none; line-height: 1.6; transition: border-color 0.2s; }
        .modal-textarea:focus { border-color: rgba(44,24,16,0.3); }
        .modal-textarea::placeholder { color: #C4A99A; }
        .modal-char-count { text-align: right; font-size: 0.75rem; color: #B8957E; margin-top: 6px; margin-bottom: 12px; font-family: 'DM Sans', sans-serif; }
        .country-input-wrap { position: relative; margin-bottom: 24px; }
        .country-input-inner { display: flex; align-items: center; background: #FFF8F0; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 0 16px; transition: border-color 0.2s; }
        .country-input-inner:focus-within { border-color: rgba(44,24,16,0.3); }
        .modal-country-input { width: 100%; background: transparent; border: none; padding: 10px 0; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #2C1810; outline: none; }
        .modal-country-input::placeholder { color: #C4A99A; }
        .comment-country .country-input-wrap { margin-bottom: 0; }
        .country-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #FFF8F0; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; list-style: none; z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden; }
        .country-option { display: flex; align-items: center; gap: 10px; padding: 9px 16px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #2C1810; cursor: pointer; transition: background 0.1s; }
        .country-option:hover { background: rgba(44,24,16,0.05); }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
        .btn-cancel { padding: 10px 20px; background: transparent; border: 1px solid rgba(0,0,0,0.15); border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #8B6F5E; cursor: pointer; transition: background 0.2s; }
        .btn-cancel:hover { background: rgba(0,0,0,0.04); }
        .btn-post { padding: 10px 24px; background: #2C1810; border: none; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 500; color: #FAF6EF; cursor: pointer; transition: background 0.2s, opacity 0.2s; }
        .btn-post:hover:not(:disabled) { background: #4A2820; }
        .btn-post:disabled { opacity: 0.4; cursor: not-allowed; }
        .modal-disclaimer { margin-top: 16px; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; color: #B8957E; text-align: center; font-weight: 300; }
        footer { text-align: center; padding: 32px; border-top: 1px solid rgba(0,0,0,0.06); font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: #C4A99A; font-weight: 300; }
        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav-counter { display: none; }
          .hero { padding: 48px 24px 40px; }
          .hero-title { font-size: 2rem; }
          .masonry-grid { padding: 32px 16px 60px; }
          .modal { padding: 28px 20px; }
          .report-btn { opacity: 1; }
        }
      `}</style>

      <nav className="nav">
        <span className="nav-wordmark">small joys</span>
      </nav>

      <div className="hero">
        <h1 className="hero-title">
          A wall of <span className="hero-title-accent">small things</span><br />
          people are grateful for
        </h1>
        <p className="hero-sub">
          Anonymous. No likes. No accounts.<br />
          Just small human moments, shared with the world.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <button className="nav-btn" onClick={openModal}>+ add yours</button>
          <div className="nav-counter">
            <span className="nav-counter-dot" />
            {notes.length} notes from strangers
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "#C4A99A", fontWeight: 300, marginTop: "4px" }}>
            See something unkind? Use the report flag on any note.
          </p>
        </div>
        <div className="share-wrap">
          <span className="share-label">Spread the joy</span>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { href: `https://t.me/share/url?url=${encodeURIComponent(SITE_URL)}`, bg: "#229ED9", title: "Telegram", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L8.32 14.617l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z"/></svg> },
              { href: `https://wa.me/?text=${encodeURIComponent("Check out Small Joys: " + SITE_URL)}`, bg: "#25D366", title: "WhatsApp", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.447a.75.75 0 00.917.928l5.699-1.49A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.725 9.725 0 01-4.989-1.375l-.356-.214-3.684.964.984-3.595-.233-.371A9.725 9.725 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg> },
              { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`, bg: "#0A66C2", title: "LinkedIn", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              { href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out Small Joys 🌿")}&url=${encodeURIComponent(SITE_URL)}`, bg: "#000", title: "Twitter", icon: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            ].map(({ href, bg, title, icon }) => (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer" title={title}
                style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                {icon}
              </a>
            ))}
            <CopyButton />
          </div>
        </div>
      </div>

      <main style={{ overflow: "hidden" }}>
        {loading ? (
          <div className="wall-empty">Loading the wall...</div>
        ) : notes.length === 0 ? (
          <div className="wall-empty">No notes yet. Be the first to share a small joy.</div>
        ) : (
          <>
            {/* Today section */}
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#C4763A" }}>Today</span>
              <div style={{ flex: 1, height: 1, background: "rgba(196,118,58,0.2)" }} />
            </div>

            {todayNotes.length === 0 ? (
              <div style={{ maxWidth: 1200, margin: "12px auto 0", padding: "0 24px" }}>
                <div style={{ border: "1.5px dashed rgba(196,118,58,0.35)", borderRadius: 6, padding: "12px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: "0.82rem", color: "#C4763A", fontStyle: "italic", textAlign: "center", background: "rgba(196,118,58,0.04)" }}>
                  Nothing yet today — be the first?
                </div>
              </div>
            ) : (
              <Masonry breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }} className="masonry-grid" columnClassName="masonry-column" style={{ paddingBottom: 8 }}>
                {todayNotes.map((note) => <StickyNote key={note.id} note={note} />)}
              </Masonry>
            )}

            {/* Earlier divider */}
            {olderNotes.length > 0 && (
              <>
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#B8957E" }}>Earlier</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.07)" }} />
                </div>

                <Masonry breakpointCols={{ default: 4, 1100: 3, 700: 2, 500: 1 }} className="masonry-grid" columnClassName="masonry-column">
                  {olderNotes.map((note) => <StickyNote key={note.id} note={note} />)}
                </Masonry>
              </>
            )}
          </>
        )}
      </main>

      <footer>
        <a href="mailto:contact@smalljoyswall.com" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#8B6F5E", textDecoration: "none", fontWeight: 500, border: "1px solid rgba(139,111,94,0.3)", borderRadius: "100px", padding: "8px 18px", fontSize: "0.8rem", marginBottom: "12px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
          Send feedback
        </a>
        <br />
        <span>Anonymous gratitude, shared with strangers</span>
      </footer>

      {showModal && (
        <PostModal onClose={() => { setShowModal(false); setPrefillText(undefined); }} onPosted={loadNotes} prefillText={prefillText} />
      )}
    </>
  );
}

function CopyButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(SITE_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      title={copied ? "Copied!" : "Copy link"}
      style={{ width: 32, height: 32, borderRadius: "50%", background: "#F0EBE3", color: "#8B6F5E", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      {copied
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
      }
    </button>
  );
}
