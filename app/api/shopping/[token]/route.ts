import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

// Token-protected access to a household's shopping list for other apps:
//   GET  → open items as JSON, or as plain text with ?format=text (Apple Watch shortcut)
//   POST → add an item. Accepts JSON { name, quantity?, emoji? } (HabitQuest webhook)
//          or a plain-text body with just the item name (Siri shortcut).

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

function invalidToken() {
  return Response.json(
    { error: "Invalid shopping list link." },
    { status: 401, headers: corsHeaders }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  const { data, error } = await supabase.rpc("get_shopping_items_by_token", {
    p_token: token,
  });

  if (error) return invalidToken();

  const items = (data ?? []) as { id: number; name: string; quantity: string | null }[];

  if (request.nextUrl.searchParams.get("format") === "text") {
    const text = items.length
      ? items
          .map((item) => `• ${item.name}${item.quantity ? ` (${item.quantity})` : ""}`)
          .join("\n")
      : "Shopping list is empty ♡";

    return new Response(text, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return Response.json(items, {
    headers: { ...corsHeaders, "Cache-Control": "no-store" },
  });
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  const { token } = await ctx.params;

  let name = "";
  let quantity: string | null = null;

  const body = await request.text();

  try {
    const json = JSON.parse(body);
    name = typeof json.name === "string" ? json.name : "";
    quantity = typeof json.quantity === "string" ? json.quantity : null;
  } catch {
    name = body;
  }

  name = name.trim();

  if (!name) {
    return Response.json(
      { error: "Item name is missing." },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabase.rpc("add_shopping_item_by_token", {
    p_token: token,
    p_name: name,
    p_quantity: quantity,
  });

  if (error) return invalidToken();

  return Response.json(
    { added: Boolean(data), name },
    { status: data ? 201 : 200, headers: corsHeaders }
  );
}
