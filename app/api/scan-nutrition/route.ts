import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

// Reads a photo of a nutrition label (and optionally the product itself)
// and returns the values the "new ingredient" form needs.

export const maxDuration = 60;

const mediaTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const RequestSchema = z.object({
  images: z
    .array(
      z.object({
        media_type: z.enum(mediaTypes),
        data: z.string().min(1),
      })
    )
    .min(1)
    .max(2),
});

const ScanResultSchema = z.object({
  found_nutrition: z
    .boolean()
    .describe("False if no calorie or protein values could be read from the photos."),
  name: z.string().describe("Short product name, e.g. 'Greek yogurt' or 'Chicken breast'. Empty if unknown."),
  type: z
    .enum(["protein", "produce", "dairy", "store_bought"])
    .describe("protein = meat, fish, eggs, tofu; produce = fruit, vegetables; dairy = milk products; store_bought = everything else."),
  unit: z
    .enum(["g", "pcs"])
    .describe("'g' for food measured by weight or volume (values per 100 g / 100 ml). 'pcs' only for things counted by piece, like eggs or protein bars."),
  calories: z.number().describe("kcal per 100 g (unit 'g') or per piece (unit 'pcs'). 0 if unknown."),
  protein: z.number().describe("Protein in grams per 100 g (unit 'g') or per piece (unit 'pcs'). 0 if unknown."),
  package_amount: z
    .number()
    .describe("Package size in grams (unit 'g') or number of pieces (unit 'pcs'). 0 if not visible."),
  package_price: z.number().describe("Price in euros if a price tag is visible, otherwise 0."),
  note: z
    .string()
    .describe("One short sentence for the user if something was unclear or guessed, otherwise empty."),
});

const typeToEmoji = {
  protein: "🍗",
  produce: "🥬",
  dairy: "🥛",
  store_bought: "🛒",
} as const;

const SYSTEM_PROMPT = `You read food packaging photos for a meal-planning app and fill in an ingredient form.

The first photo shows the nutrition facts (a table, or just text that lists the nutrition values). A second photo, if present, shows the product itself; use it for the name, type and package size.

Rules:
- Labels may be in any language (often Slovenian, German or English). Energy may be listed in kJ and kcal; always return kcal.
- Prefer the "per 100 g" or "per 100 ml" column. Only use per-piece values when the food is naturally counted in pieces (eggs, bars, rolls) and set unit to "pcs"; then convert to one piece if the label gives per-serving values for a different amount.
- If only per-serving values are given and the serving size in grams is shown, convert to per 100 g.
- Return numbers only as they appear or as converted, rounded to one decimal place. Never invent values you cannot see; use 0 and mention it in the note.
- Write the product name in the language of the label, short and without the brand unless the brand is the product.`;

export async function POST(request: Request) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return Response.json({ error: "Please log in first." }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

  if (userError || !userData.user) {
    return Response.json({ error: "Please log in first." }, { status: 401 });
  }

  const body = RequestSchema.safeParse(await request.json().catch(() => null));

  if (!body.success) {
    return Response.json({ error: "Add a photo of the nutrition label." }, { status: 400 });
  }

  const [labelImage, productImage] = body.data.images;

  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    { type: "text", text: "Photo 1 – nutrition facts:" },
    { type: "image", source: { type: "base64", ...labelImage } },
  ];

  if (productImage) {
    content.push(
      { type: "text", text: "Photo 2 – the product:" },
      { type: "image", source: { type: "base64", ...productImage } }
    );
  }

  content.push({ type: "text", text: "Fill in the ingredient form from these photos." });

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[scan-nutrition] ANTHROPIC_API_KEY is not set");
    return Response.json({ error: "The AI scanner is not set up yet." }, { status: 503 });
  }

  const anthropic = new Anthropic();

  try {
    const response = await anthropic.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium",
        format: betaZodOutputFormat(ScanResultSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return Response.json(
        { error: "Could not read the photos. Try a sharper, closer photo of the label." },
        { status: 422 }
      );
    }

    const result = response.parsed_output;

    return Response.json({
      ...result,
      emoji: typeToEmoji[result.type],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[scan-nutrition] ANTHROPIC_API_KEY is missing or invalid");
      return Response.json({ error: "The AI scanner is not set up yet." }, { status: 503 });
    }

    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Too many scans right now. Try again in a minute." }, { status: 429 });
    }

    if (error instanceof Anthropic.APIError) {
      console.error(`[scan-nutrition] API error ${error.status}:`, error.message);
      return Response.json({ error: "The AI scanner had a problem. Please try again." }, { status: 502 });
    }

    throw error;
  }
}
