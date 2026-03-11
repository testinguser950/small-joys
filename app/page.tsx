"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NOTE_COLORS = ["#FEF3C7", "#FDE8D8", "#E8F4FD", "#F0FDF4", "#F5F0FF"];
const NOTE_ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-1.5deg", "1deg", "-2.5deg", "2deg"];

type Note = {
  id: string;
  text: string;
  city: string | null;
  country: string | null;
  flag: string | null;
  created_at: string;
  color?: string;
  rotate?: string;
};

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StickyNote({ note }: { note: Note }) {
  return (
    <div
      className="sticky-note"
      style={{
        backgroundColor: note.color,
        transform: `rotate(${note.rotate})`,
      }}
    >
      <p className="note-text">{note.text}</p>
      <div className="note-footer">
        {note.country && (
          <span className="note-city">
            {note.flag} {note.country}{note.city ? `, ${note.city}` : ""}
          </span>
        )}
        <span className="note-time">{timeAgo(note.created_at)}</span>
      </div>
    </div>
  );
}

function PostModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const [text, setText] = useState("");
  const [city, setCity] = useState("");
  const [posting, setPosting] = useState(false);
  const [done, setDone] = useState(false);
  const maxChars = 220;

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("notes").insert({
      text: text.trim(),
      city: city.trim() || null,
      country: null,
      flag: null,
    });
    setPosting(false);
    if (!error) {
      setDone(true);
      setTimeout(() => {
        onPosted();
        onClose();
      }, 1500);
    } else {
      alert("Something went wrong. Please try again.");
    }
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
            <p className="modal-subtitle">
              Anonymous. No account needed. Just something that made your day.
            </p>
            <textarea
              className="modal-textarea"
              placeholder="Today I noticed..."
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxChars))}
              rows={4}
              autoFocus
            />
            <div className="modal-char-count">{text.length}/{maxChars}</div>
            <input
              className="modal-city-input"
              placeholder="Your city (optional)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
              <button
                className="btn-post"
                disabled={text.trim().length === 0 || posting}
                onClick={handlePost}
              >
                {posting ? "Posting..." : "Post to the wall"}
              </button>
            </div>
            <p className="modal-disclaimer">
              No names stored. No accounts. Posts may take a few minutes to appear.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (data) {
      const enriched = data.map((note, i) => ({
        ...note,
        color: NOTE_COLORS[i % NOTE_COLORS.length],
        rotate: NOTE_ROTATIONS[i % NOTE_ROTATIONS.length],
      }));
      setNotes(enriched);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=Caveat:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background-color: #FAF6EF;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(254,243,199,0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(253,232,216,0.3) 0%, transparent 40%);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        header {
          text-align: center;
          padding: 52px 24px 32px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .site-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(2rem, 5vw, 3.2rem);
          color: #2C1810;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .site-tagline {
          margin-top: 10px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.95rem;
          color: #8B6F5E;
          letter-spacing: 0.02em;
        }

        .post-btn {
          margin-top: 28px;
          display: inline-block;
          background: #2C1810;
          color: #FAF6EF;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          padding: 12px 28px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: background 0.2s, transform 0.15s;
        }
        .post-btn:hover {
          background: #4A2820;
          transform: translateY(-1px);
        }

        .wall {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          columns: 4 260px;
          column-gap: 20px;
        }

        .wall-empty {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          color: #B8957E;
          font-weight: 300;
          font-size: 0.95rem;
        }

        .sticky-note {
          break-inside: avoid;
          display: inline-block;
          width: 100%;
          padding: 22px 20px 16px;
          margin-bottom: 20px;
          border-radius: 2px;
          box-shadow:
            2px 3px 8px rgba(0,0,0,0.08),
            0 1px 2px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
          position: relative;
        }

        .sticky-note::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            transparent,
            transparent 27px,
            rgba(0,0,0,0.04) 28px
          );
          border-radius: 2px;
          pointer-events: none;
        }

        .sticky-note:hover {
          transform: rotate(0deg) scale(1.02) !important;
          box-shadow: 4px 8px 20px rgba(0,0,0,0.12);
          z-index: 10;
          position: relative;
        }

        .note-text {
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
          line-height: 1.6;
          color: #2C1810;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .note-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          position: relative;
          z-index: 1;
        }

        .note-city {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          color: #8B6F5E;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 65%;
        }

        .note-time {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem;
          color: #B8957E;
          font-weight: 300;
          white-space: nowrap;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(44,24,16,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }

        .modal {
          background: #FAF6EF;
          border-radius: 8px;
          padding: 36px 32px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .modal-success {
          text-align: center;
          padding: 20px 0;
        }

        .modal-success-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .modal-success-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.3rem;
          color: #2C1810;
        }

        .modal-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1.6rem;
          color: #2C1810;
          margin-bottom: 8px;
        }

        .modal-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #8B6F5E;
          font-weight: 300;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .modal-textarea {
          width: 100%;
          background: #FFF8F0;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          padding: 14px 16px;
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
          color: #2C1810;
          resize: none;
          outline: none;
          line-height: 1.6;
          transition: border-color 0.2s;
        }
        .modal-textarea:focus { border-color: rgba(44,24,16,0.3); }
        .modal-textarea::placeholder { color: #C4A99A; }

        .modal-char-count {
          text-align: right;
          font-size: 0.75rem;
          color: #B8957E;
          margin-top: 6px;
          margin-bottom: 12px;
          font-family: 'DM Sans', sans-serif;
        }

        .modal-city-input {
          width: 100%;
          background: #FFF8F0;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 6px;
          padding: 10px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #2C1810;
          outline: none;
          margin-bottom: 24px;
          transition: border-color 0.2s;
        }
        .modal-city-input:focus { border-color: rgba(44,24,16,0.3); }
        .modal-city-input::placeholder { color: #C4A99A; }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(0,0,0,0.15);
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #8B6F5E;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cancel:hover { background: rgba(0,0,0,0.04); }

        .btn-post {
          padding: 10px 24px;
          background: #2C1810;
          border: none;
          border-radius: 100px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #FAF6EF;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }
        .btn-post:hover:not(:disabled) { background: #4A2820; }
        .btn-post:disabled { opacity: 0.4; cursor: not-allowed; }

        .modal-disclaimer {
          margin-top: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          color: #B8957E;
          text-align: center;
          font-weight: 300;
        }

        footer {
          text-align: center;
          padding: 32px;
          border-top: 1px solid rgba(0,0,0,0.06);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #C4A99A;
          font-weight: 300;
        }

        @media (max-width: 600px) {
          .wall { padding: 32px 16px 60px; }
          .modal { padding: 28px 20px; }
        }
      `}</style>

      <header>
        <h1 className="site-title">
          Small Joys<span style={{ fontStyle: 'normal', letterSpacing: '-0.02em' }}>J</span>oys
        </h1>
        <p className="site-tagline">
          A public wall of small things people are grateful for. Anonymous. No accounts. Just moments.
        </p>
        <button className="post-btn" onClick={() => setShowModal(true)}>
          + Share a small joy
        </button>
      </header>

      <main>
        {loading ? (
          <div className="wall-empty">Loading the wall...</div>
        ) : notes.length === 0 ? (
          <div className="wall-empty">No notes yet. Be the first to share a small joy.</div>
        ) : (
          <div className="wall">
            {notes.map((note) => (
              <StickyNote key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>

      <footer>Small Joys · Anonymous gratitude, shared with strangers</footer>

      {showModal && (
        <PostModal
          onClose={() => setShowModal(false)}
          onPosted={loadNotes}
        />
      )}
    </>
  );
}
