import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import leoProfanity from "leo-profanity";

// Add extra words leo-profanity might miss
leoProfanity.add(["kys", "kill yourself", "self-harm"]);

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

    // Rate limited — fail open, leo-profanity is still running
    if (res.status === 429) {
      console.log("OpenAI rate limited, failing open");
      return true;
    }

    const data = await res.json();

    if (data.error) {
      console.log("OpenAI error, failing closed:", data.error.message);
      return false;
    }
    return data.results?.[0]?.flagged === false;
  } catch (e) {
    console.log("OpenAI moderation exception, failing closed:", e);
    return false;
  }
}

async function moderateWithGPT(text: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 10,
        messages: [
          {
            role: "system",
            content: `You are a content moderator for "Small Joys" — a warm, anonymous gratitude wall where people share small things they're grateful for. 
Reject content that is:
- Political statements, protests, or opinions about governments, wars, or conflicts
- Targeted hate or hostility toward any country, religion, ethnicity, or group
- Divisive, inflammatory, or designed to provoke
- Unrelated to personal gratitude or small joys

Reply with only "PASS" or "FAIL". Nothing else.`
          },
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (res.status === 429) {
      console.log("GPT rate limited, failing open");
      return true;
    }

    const data = await res.json();
    if (data.error) {
      console.log("GPT error, failing open:", data.error.message);
      return true;
    }

    const verdict = data.choices?.[0]?.message?.content?.trim();
    console.log("GPT verdict:", verdict);
    return verdict === "PASS";
  } catch (e) {
    console.log("GPT moderation exception, failing open:", e);
    return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const body = await req.json();
    const { text, country, country_code } = body;

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Leo profanity filter
    if (leoProfanity.check(text)) {
      return NextResponse.json({ error: "flagged" }, { status: 400 });
    }

    // OpenAI moderation (fail-closed)
    const passed = await moderateWithOpenAI(text);
    if (!passed) {
      return NextResponse.json({ error: "flagged" }, { status: 400 });
    }

    // GPT vibe check
    const gptPassed = await moderateWithGPT(text);
    if (!gptPassed) {
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

    // Insert with approved: false
    const { error: insertError } = await supabase.from("notes").insert({
      text: text.trim(),
      country: country || null,
      country_code: country_code || null,
      flag: null,
      ip_address: ip,
      photo_url: null,
      approved: true, // ← change this
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}