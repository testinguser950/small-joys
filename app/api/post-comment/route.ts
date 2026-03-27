import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { noteId, text, country, country_code } = await req.json();

  if (!noteId || !text?.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  if (text.trim().length > 280) {
    return NextResponse.json({ error: "too_long" }, { status: 400 });
  }

  const modRes = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ input: text }),
  });

  if (modRes.ok) {
    const modData = await modRes.json();
    if (modData.results?.[0]?.flagged) {
      return NextResponse.json({ error: "flagged" }, { status: 200 });
    }
  }

  const { error } = await supabase.from("comments").insert({
    note_id: noteId,
    text: text.trim(),
    country: country || null,
    country_code: country_code || null,
  });

  if (error) return NextResponse.json({ error: "db_error" }, { status: 500 });

  return NextResponse.json({ success: true });
}