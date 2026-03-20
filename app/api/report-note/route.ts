import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function sendTelegramNotification(noteText: string, noteId: string) {
  const message = `🚩 *New report on Small Joys*\n\n"${noteText}"\n\nNote ID: ${noteId}`;
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown",
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: "No note ID" }, { status: 400 });
    }

    // Get the note text for the notification
    const { data: note } = await supabase
      .from("notes")
      .select("text")
      .eq("id", noteId)
      .single();

    // Mark as reported in Supabase
    await supabase
      .from("notes")
      .update({ reported: true })
      .eq("id", noteId);

    // Send Telegram notification
    if (note) {
      await sendTelegramNotification(note.text, noteId);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}