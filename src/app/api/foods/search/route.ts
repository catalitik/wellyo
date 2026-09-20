import { NextResponse } from "next/server";

const OFF_SEARCH = "https://world.openfoodfacts.org/cgi/search.pl";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  if (!query || query.length < 2) return NextResponse.json({ foods: [] });

  const url = new URL(OFF_SEARCH);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "12");
  url.searchParams.set("fields", "code,product_name,brands,nutriments,image_front_small_url");

  try {
    const response = await fetch(url, { headers: { "User-Agent": "Wellyo/1.0 (nutrition app)" }, next: { revalidate: 3600 } });
    if (!response.ok) return NextResponse.json({ foods: [], error: "food_source_unavailable" }, { status: 502 });
    const data = await response.json();
    const foods = (data.products ?? []).filter((food: any) => food.product_name).map((food: any) => ({
      source: "open_food_facts",
      sourceId: food.code ?? null,
      name: food.product_name,
      brand: food.brands ?? null,
      image: food.image_front_small_url ?? null,
      kcalPer100g: food.nutriments?.["energy-kcal_100g"] ?? null,
      proteinPer100g: food.nutriments?.proteins_100g ?? null,
      carbsPer100g: food.nutriments?.carbohydrates_100g ?? null,
      fatPer100g: food.nutriments?.fat_100g ?? null,
      fiberPer100g: food.nutriments?.fiber_100g ?? null,
    }));
    return NextResponse.json({ foods });
  } catch {
    return NextResponse.json({ foods: [], error: "food_source_unavailable" }, { status: 502 });
  }
}
