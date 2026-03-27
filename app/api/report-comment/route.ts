import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { commentId } = await req.json();
  if (!commentId) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const { data: comment } = await supabase
    .from("comments")
    .select("text, country")
    .eq("id", commentId)
    .single();

  await supabase.from("comments").update({ reported: true }).eq("id", commentId);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🚩 Comment reported\n\n"${comment?.text}"\n\n🌍 ${comment?.country || "Unknown"}\nID: ${commentId}`,
      }),
    });
  }

  return NextResponse.json({ success: true });
}