import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await req.json();
    const { text, country, country_code } = body;

    const { error } = await supabase.from("notes").insert({
      text: text.trim(),
      country: country || null,
      country_code: country_code || null,
      flag: null,
      ip_address: "test",
    });

    if (error) {
      console.log("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("Caught:", String(e));
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}