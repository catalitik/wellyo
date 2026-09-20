"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Apple, ArrowLeft, ChevronRight, CirclePlus, Info, Leaf, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const meals = [
  { title: "Desayuno", type: "breakfast", hint: "Empieza el día con energía" },
  { title: "Comida", type: "lunch", hint: "Construye un plato equilibrado" },
  { title: "Cena", type: "dinner", hint: "Ligera, rica y reparadora" },
  { title: "Snacks", type: "snack", hint: "Pequeños momentos entre horas" },
];

export default function NutritionPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [grams, setGrams] = useState("100");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const today = new Date().toISOString().slice(0, 10);
  async function loadItems() {
    try { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data } = await supabase.from("meals").select("meal_type, meal_items(id, food_name, grams, kcal, protein, carbs, fat)").eq("user_id", user.id).eq("meal_date", today); setItems((data ?? []).flatMap((meal: any) => (meal.meal_items ?? []).map((item: any) => ({ ...item, meal_type: meal.meal_type })))); } finally { setLoadingItems(false); }
  }
  useEffect(() => { loadItems(); }, []);
  async function searchFoods() {
    if (query.trim().length < 2) return;
    setSearching(true);
    try { const response = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`); const data = await response.json(); setResults(data.foods ?? []); } finally { setSearching(false); }
  }
  async function addFood(mealType: string) {
    if (!selected || Number(grams) <= 0) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Necesitas iniciar sesión.");
      const { data: food, error: foodError } = await supabase.from("foods").insert({ owner_user_id: user.id, name: selected.name, source: selected.source, source_id: selected.sourceId, kcal_per_100g: selected.kcalPer100g, protein_per_100g: selected.proteinPer100g, carbs_per_100g: selected.carbsPer100g, fat_per_100g: selected.fatPer100g, fiber_per_100g: selected.fiberPer100g }).select("id").single();
      if (foodError) throw foodError;
      const { data: meal, error: mealError } = await supabase.from("meals").upsert({ user_id: user.id, meal_date: today, meal_type: mealType }, { onConflict: "user_id,meal_date,meal_type" }).select("id").single();
      if (mealError) throw mealError;
      const factor = Number(grams) / 100;
      const { error: itemError } = await supabase.from("meal_items").insert({ meal_id: meal.id, food_id: food.id, food_name: selected.name, quantity: Number(grams), unit: "g", grams: Number(grams), kcal: selected.kcalPer100g == null ? null : selected.kcalPer100g * factor, protein: selected.proteinPer100g == null ? null : selected.proteinPer100g * factor, carbs: selected.carbsPer100g == null ? null : selected.carbsPer100g * factor, fat: selected.fatPer100g == null ? null : selected.fatPer100g * factor, fiber: selected.fiberPer100g == null ? null : selected.fiberPer100g * factor });
      if (itemError) throw itemError;
      setSaved((items) => [...items, `${mealType}:${selected.name}`]); setSelected(null); await loadItems();
    } finally { setSaving(false); }
  }
  return (
    <main className="min-h-screen bg-[#F8F7F3] px-5 py-6 text-[#25342D] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-[#267C60]">
          <ArrowLeft size={17} /> Volver al inicio
        </Link>
        <div className="mb-8 flex items-start justify-between gap-4">
          <div><p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#267C60]"><Apple size={17} /> Nutrición</p><h1 className="text-3xl font-black sm:text-4xl">Come para sentirte bien</h1><p className="mt-2 max-w-xl text-[#5B6B63]">Registra tus comidas y descubre patrones que te ayuden a alcanzar tus objetivos.</p></div>
          <div className="hidden rounded-2xl bg-[#DFF3E8] p-4 text-[#267C60] sm:block"><Leaf size={28} /></div>
        </div>
        <div className="mb-8 flex gap-3 rounded-2xl border border-[#C8E7D8] bg-[#DFF3E8] p-4 text-sm text-[#315E4C]"><Info size={19} className="mt-0.5 shrink-0" /><p>Tu catálogo de alimentos se conectará a fuentes externas. Hasta entonces, los alimentos incompletos no se usarán para calcular calorías automáticamente.</p></div>
        <section className="grid gap-4 sm:grid-cols-2">
          {meals.map((meal) => <article key={meal.type} className="rounded-3xl border border-[#E6E3DD] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-lg font-extrabold">{meal.title}</h2><p className="mt-1 text-sm text-[#718078]">{meal.hint}</p></div><span className="rounded-full bg-[#F0ECEA] px-3 py-1 text-xs font-bold text-[#718078]">{saved.filter((item) => item.startsWith(`${meal.type}:`)).length} alimentos</span></div><div className="mt-5 flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchFoods()} placeholder="Buscar alimento" className="min-w-0 flex-1 rounded-2xl border border-[#D9E8DF] bg-[#F8F7F3] px-3 py-3 text-sm outline-none focus:border-[#267C60]"/><button onClick={searchFoods} disabled={searching} className="rounded-2xl bg-[#267C60] px-4 text-white disabled:opacity-60"><Search size={18} /></button></div>{results.length > 0 && <div className="mt-3 space-y-2">{results.slice(0, 3).map((food) => <button key={food.sourceId ?? food.name} onClick={() => setSelected(food)} className="flex w-full items-center justify-between rounded-xl bg-[#F3FBF6] px-3 py-2 text-left text-sm"><span className="font-bold">{food.name}<small className="ml-2 font-normal text-[#718078]">{food.brand ?? "Open Food Facts"}</small></span><span className="text-xs text-[#267C60]">{food.kcalPer100g ? `${Math.round(food.kcalPer100g)} kcal` : "Sin kcal"}</span></button>)}</div>}{selected && <div className="mt-3 rounded-xl border border-[#C8E7D8] bg-[#F3FBF6] p-3"><p className="text-sm font-bold">{selected.name}</p><div className="mt-2 flex gap-2"><input value={grams} onChange={(event) => setGrams(event.target.value)} type="number" min="1" className="w-24 rounded-lg border border-[#D9E8DF] px-2 py-2 text-sm"/><span className="py-2 text-sm text-[#718078]">gramos</span><button onClick={() => addFood(meal.type)} disabled={saving} className="ml-auto rounded-lg bg-[#267C60] px-3 py-2 text-xs font-bold text-white">{saving ? "Guardando…" : "Añadir"}</button></div></div>}<p className="mt-3 text-center text-xs text-[#718078]">Datos de Open Food Facts</p></article>)}
        </section>
        <section className="mt-8 rounded-3xl bg-[#25342D] p-6 text-white"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-[#B8E4CE]">Resumen de hoy</p><h2 className="mt-1 text-2xl font-black">{loadingItems ? "Cargando…" : items.length ? `${Math.round(items.reduce((sum, item) => sum + (item.kcal ?? 0), 0))} kcal` : "Aún no hay registros"}</h2></div><Apple className="text-[#B8E4CE]" size={30} /></div><div className="mt-4 grid grid-cols-3 gap-2 text-sm text-[#D8E4DF]"><span>Proteínas <b className="block text-white">{Math.round(items.reduce((sum, item) => sum + (item.protein ?? 0), 0))} g</b></span><span>Carbohidratos <b className="block text-white">{Math.round(items.reduce((sum, item) => sum + (item.carbs ?? 0), 0))} g</b></span><span>Grasas <b className="block text-white">{Math.round(items.reduce((sum, item) => sum + (item.fat ?? 0), 0))} g</b></span></div><p className="mt-3 max-w-lg text-sm text-[#D8E4DF]">{items.length ? `${items.length} alimentos registrados hoy.` : "Añade tu primera comida para ver el resumen de energía y macronutrientes."}</p></section>
      </div>
    </main>
  );
}
