import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BLOCKED_WORDS = ["fuck", "shit", "nigger", "faggot", "cunt", "kill yourself", "kys"];

async function moderateWithOpenAI(text: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: text }),
    });
    const data = await res.json();
    // If API returns an error object, fail open
    if (data.error) {
      console.log("OpenAI error, failing open:", data.error.message);
      return true;
    }
    return data.results?.[0]?.flagged === false;
  } catch (e) {
    console.log("OpenAI moderation error:", e);
    return true;
  }
}

export async function POST(req: NextRequest) {
  console.log("API route hit");
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const { text, country, country_code, photo_url } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Keyword filter
    const lower = text.toLowerCase();
    const blocked = BLOCKED_WORDS.some((word) => lower.includes(word));
    if (blocked) {
      return NextResponse.json({ error: "flagged" }, { status: 400 });
    }

    // OpenAI moderation
    const passed = await moderateWithOpenAI(text);
    console.log("OpenAI passed:", passed);
    if (!passed) {
      return NextResponse.json({ error: "flagged" }, { status: 400 });
    }

    // Rate limit — skip on localhost
    const isLocalhost = req.headers.get("host")?.includes("localhost");
    if (!isLocalhost) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", oneHourAgo);

      if (count && count > 0) {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      }
    }

    // Save
    const { error: insertError } = await supabase.from("notes").insert({
        text: text.trim(),
        country: country || null,
        country_code: country_code || null,
        flag: null,
        ip_address: ip,
        photo_url: photo_url || null,
      });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

          return NextResponse.json({ success: true });
        } catch (e) {
          return NextResponse.json({ error: String(e) }, { status: 500 });
        }
      }
