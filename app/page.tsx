"use client";

import { useState } from "react";

const SEED_NOTES = [
  {
    id: 1,
    text: "My neighbour left a container of curry outside my door without saying anything. I cried a little.",
    city: "Singapore",
    country: "Singapore",
    flag: "🇸🇬",
    time: "2 hours ago",
    color: "#FEF3C7",
    rotate: "-2deg",
    type: "text",
  },
  {
    id: 2,
    text: "The bus driver waited for me even though I was still half a block away. He didn't have to.",
    city: "Dublin",
    country: "Ireland",
    flag: "🇮🇪",
    time: "4 hours ago",
    color: "#FDE8D8",
    rotate: "1.5deg",
    type: "text",
  },
  {
    id: 3,
    text: "First proper rain after weeks of dry weather. Sat by the window with tea and did absolutely nothing for 20 minutes.",
    city: "London",
    country: "UK",
    flag: "🇬🇧",
    time: "5 hours ago",
    color: "#E8F4FD",
    rotate: "-1deg",
    type: "text",
  },
  {
    id: 4,
    text: "My 7-year-old told me I was her best friend today. Unprompted. Just like that.",
    city: "Toronto",
    country: "Canada",
    flag: "🇨🇦",
    time: "7 hours ago",
    color: "#F0FDF4",
    rotate: "2.5deg",
    type: "text",
  },
  {
    id: 5,
    text: "Found a $20 note in a jacket I haven't worn since winter. Bought myself a really good lunch.",
    city: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    time: "9 hours ago",
    color: "#FEF3C7",
    rotate: "-1.5deg",
    type: "text",
  },
  {
    id: 6,
    text: "A stranger complimented my shoes. We ended up talking for 15 minutes. Never got her name.",
    city: "New York",
    country: "USA",
    flag: "🇺🇸",
    time: "11 hours ago",
    color: "#FDE8D8",
    rotate: "1deg",
    type: "text",
  },
  {
    id: 7,
    text: "My cat sat on my lap for the entire time I was working. Didn't move once. Just purring.",
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    time: "13 hours ago",
    color: "#F5F0FF",
    rotate: "-2.5deg",
    type: "text",
  },
  {
    id: 8,
    text: "The exact song I needed came on shuffle at the exact moment I needed it. Some things can't be explained.",
    city: "São Paulo",
    country: "Brazil",
    flag: "🇧🇷",
    time: "14 hours ago",
    color: "#E8F4FD",
    rotate: "2deg",
    type: "text",
  },
  {
    id: 9,
    text: "Reconnected with a university friend after 6 years. We picked up exactly where we left off. Not a single awkward moment.",
    city: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    time: "16 hours ago",
    color: "#F0FDF4",
    rotate: "-1deg",
    type: "text",
  },
  {
    id: 10,
    text: "Woke up before my alarm, felt rested, and the sky was that specific shade of pink that only lasts two minutes.",
    city: "Kyoto",
    country: "Japan",
    flag: "🇯🇵",
    time: "18 hours ago",
    color: "#FDE8D8",
    rotate: "1.5deg",
    type: "text",
  },
  {
    id: 11,
    text: "Got a handwritten thank-you note in the post. In 2025. I've kept it on my desk.",
    city: "Amsterdam",
    country: "Netherlands",
    flag: "🇳🇱",
    time: "20 hours ago",
    color: "#FEF3C7",
    rotate: "-2deg",
    type: "text",
  },
  {
    id: 12,
    text: "Made bread for the first time. It wasn't perfect. I ate the whole loaf.",
    city: "Cape Town",
    country: "South Africa",
    flag: "🇿🇦",
    time: "22 hours ago",
    color: "#F5F0FF",
    rotate: "2deg",
    type: "text",
  },
];

function StickyNote({ note }: { note: (typeof SEED_NOTES)[0] }) {
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
        {note.city && (
          <span className="note-city">
            {note.flag} {note.country}, {note.city}
          </span>
        )}
        <span className="note-time">{note.time}</span>
      </div>
    </div>
  );
}

function PostModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState("");
  const maxChars = 220;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
        <div className="modal-char-count">
          {text.length}/{maxChars}
        </div>
        <input
          className="modal-city-input"
          placeholder="Your city (optional)"
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-post" disabled={text.trim().length === 0}>
            Post to the wall
          </button>
        </div>
        <p className="modal-disclaimer">
          No names stored. No accounts. Posts are reviewed before appearing.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const [showModal, setShowModal] = useState(false);

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
        .modal-textarea:focus {
          border-color: rgba(44,24,16,0.3);
        }
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
        <h1 className="site-title">Small Joys</h1>
        <p className="site-tagline">
          A public wall of small things people are grateful for. Anonymous. No accounts. Just moments.
        </p>
        <button className="post-btn" onClick={() => setShowModal(true)}>
          + Share a small joy
        </button>
      </header>

      <main className="wall">
        {SEED_NOTES.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </main>

      <footer>
        Small Joys · Anonymous gratitude, shared with strangers
      </footer>

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </>
  );
}
