"use client";

import { useMemo, useState } from "react";

type DiningHall =
  | "John Jay"
  | "JJ's Place"
  | "Hewitt"
  | "Chef Mike's"
  | "Ferris"
  | "Grace Dodge"
  | "Diana's";

type CrowdLevel = "Chill" | "Typical" | "Packed";

type MealEntry = {
  id: number;
  hall: DiningHall;
  name: string;
  description: string;
  rating: number;
  crowd: CrowdLevel;
  imageUrl: string | null;
  createdAt: string;
};

const halls: DiningHall[] = [
  "John Jay",
  "JJ's Place",
  "Hewitt",
  "Chef Mike's",
  "Ferris",
  "Grace Dodge",
  "Diana's",
];

const crowdLevels: CrowdLevel[] = ["Chill", "Typical", "Packed"];

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [hall, setHall] = useState<DiningHall>("John Jay");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(4);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>("Typical");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [hallFilter, setHallFilter] = useState<DiningHall | "All">("All");
  const [sortKey, setSortKey] = useState<"newest" | "rating">("newest");

  const themeBackground = darkMode
    ? "bg-slate-950"
    : "bg-slate-50";

  const themeForeground = darkMode
    ? "text-slate-100"
    : "text-slate-900";

  const themeSurface = darkMode
    ? "bg-slate-900/70"
    : "bg-white";

  const themeSurfaceMuted = darkMode
    ? "bg-slate-900/60"
    : "bg-slate-100";

  const themeBorderSubtle = darkMode
    ? "border-slate-700/70"
    : "border-slate-200";

  const cycleCrowdLevel = () => {
    const index = crowdLevels.indexOf(crowdLevel);
    const next = crowdLevels[(index + 1) % crowdLevels.length];
    setCrowdLevel(next);
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRating(4);
    setHall("John Jay");
    setCrowdLevel("Typical");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddMeal = () => {
    if (!name.trim()) {
      return;
    }
    const createdAt = new Date().toISOString();
    const imageUrl = imagePreview || null;
    const entry: MealEntry = {
      id: Date.now(),
      hall,
      name: name.trim(),
      description: description.trim(),
      rating,
       crowd: crowdLevel,
      imageUrl,
      createdAt,
    };
    setMeals((prev) => [entry, ...prev]);
    resetForm();
  };

  const filteredAndSortedMeals = useMemo(() => {
    let data = [...meals];
    if (hallFilter !== "All") {
      data = data.filter((m) => m.hall === hallFilter);
    }
    if (sortKey === "rating") {
      data.sort((a, b) => b.rating - a.rating || (a.createdAt < b.createdAt ? 1 : -1));
    } else {
      data.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return data;
  }, [meals, hallFilter, sortKey]);

  return (
    <main
      className={`${themeBackground} ${themeForeground} min-h-screen transition-colors duration-300`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pt-12">
        <header className="flex flex-col items-center gap-4 text-center sm:gap-5">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              RoareeReview
            </h1>
            <p className="text-sm font-medium tracking-wide text-sky-200 sm:text-base">
              LionDine connectivity &amp; more coming soon!
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-sky-400/40 bg-slate-900/40 px-3 py-1.5 shadow-sm shadow-sky-900/40 backdrop-blur">
            <span
              className={`text-xs font-medium uppercase tracking-[0.2em] ${
                darkMode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              Mode
            </span>
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`relative flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                !darkMode
                  ? "bg-sky-100 text-slate-900"
                  : "text-slate-300 hover:text-sky-100"
              }`}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`relative flex h-8 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                darkMode
                  ? "bg-sky-400/90 text-slate-950"
                  : "text-slate-300 hover:text-sky-100"
              }`}
            >
              Night
            </button>
          </div>
        </header>

        <section
          className={`grid gap-6 rounded-3xl border ${themeBorderSubtle} ${themeSurface} p-4 shadow-sm shadow-slate-900/40 sm:gap-8 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] lg:p-8`}
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-2">
              <h2
                className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                  darkMode ? "text-slate-200" : "text-slate-800"
                }`}
              >
                New meal log
              </h2>
              <span className="rounded-full bg-slate-900/60 px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-sky-200">
                Columbia dining
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={`flex flex-col gap-1.5 text-xs font-medium ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Dining hall
                  <div className={`flex items-center gap-2 rounded-2xl border ${themeBorderSubtle} ${themeSurfaceMuted} px-3 py-2.5`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                    <select
                      value={hall}
                      onChange={(e) => setHall(e.target.value as DiningHall)}
                      className={`w-full bg-transparent text-sm outline-none ${
                        darkMode ? "text-slate-50" : "text-slate-900"
                      }`}
                    >
                      {halls.map((h) => (
                        <option
                          key={h}
                          value={h}
                          className="bg-slate-900 text-slate-100"
                        >
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <label
                  className={`flex flex-col gap-1.5 text-xs font-medium ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Meal title
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Meal name"
                    className={`rounded-2xl border ${themeBorderSubtle} ${themeSurfaceMuted} px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none ring-0 focus:border-sky-400 focus:outline-none ${
                      darkMode ? "text-slate-50" : "text-slate-900"
                    }`}
                  />
                </label>
              </div>

              <label
                className={`flex flex-col gap-1.5 text-xs font-medium ${
                  darkMode ? "text-slate-200" : "text-slate-800"
                }`}
              >
                Snapshot
                <div
                  className={`grid gap-3 rounded-2xl border ${themeBorderSubtle} ${themeSurfaceMuted} p-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]`}
                >
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-sky-500/60 bg-slate-900/40 px-3 py-6 text-center transition hover:border-sky-400 hover:bg-slate-900/70">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-sky-200">
                      Upload photo
                    </span>
                    <span className="max-w-[14rem] text-[0.7rem] text-slate-400">
                      JPG or PNG, up to 4 MB.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e.target.files ? e.target.files[0] : null)
                      }
                    />
                  </label>
                  <div className="flex items-center justify-center">
                    {imagePreview ? (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/80">
                        <img
                          src={imagePreview}
                          alt={name || "Meal preview"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-[0.75rem] text-slate-500">
                        Photo preview
                      </div>
                    )}
                  </div>
                </div>
              </label>

              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)]">
                <label
                  className={`flex flex-col gap-1.5 text-xs font-medium ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Notes
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Quick thoughts on the meal."
                    className={`resize-none rounded-2xl border ${themeBorderSubtle} ${themeSurfaceMuted} px-3 py-2.5 text-sm placeholder:text-slate-500 outline-none focus:border-sky-400 ${
                      darkMode ? "text-slate-50" : "text-slate-900"
                    }`}
                  />
                </label>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                      Rating
                    </span>
                    <span className="text-[0.7rem] text-slate-500">
                      {rating} / 5
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      const active = rating >= value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-base transition ${
                            active
                              ? "border-sky-400 bg-sky-400/10 text-sky-300"
                              : "border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-500"
                          }`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={cycleCrowdLevel}
                    className="mt-3 inline-flex items-center justify-between rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-200 hover:border-sky-400 hover:text-sky-200"
                  >
                    <span>Crowd</span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[0.68rem] normal-case tracking-normal text-sky-200">
                      {crowdLevel}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleAddMeal}
                  disabled={!name.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-900/50 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                >
                  Save meal log
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-medium text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
                >
                  Clear fields
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-800/70 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 lg:pl-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2
                  className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                    darkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Your dining log
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <select
                  value={hallFilter}
                  onChange={(e) =>
                    setHallFilter(e.target.value as DiningHall | "All")
                  }
                  className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-slate-200 outline-none"
                >
                  <option
                    value="All"
                    className="bg-slate-900 text-slate-100"
                  >
                    All halls
                  </option>
                  {halls.map((h) => (
                    <option
                      key={h}
                      value={h}
                      className="bg-slate-900 text-slate-100"
                    >
                      {h}
                    </option>
                  ))}
                </select>
                <select
                  value={sortKey}
                  onChange={(e) =>
                    setSortKey(e.target.value as "newest" | "rating")
                  }
                  className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-slate-200 outline-none"
                >
                  <option
                    value="newest"
                    className="bg-slate-900 text-slate-100"
                  >
                    Newest first
                  </option>
                  <option
                    value="rating"
                    className="bg-slate-900 text-slate-100"
                  >
                    Highest rated
                  </option>
                </select>
              </div>
            </div>

            {filteredAndSortedMeals.length === 0 ? (
              <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-200">
                  No meals yet. Log your first RoareeReview.
                </p>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                  {filteredAndSortedMeals.map((meal) => (
                    <article
                      key={meal.id}
                      className="group grid gap-3 rounded-xl border border-slate-800/70 bg-slate-900/70 p-3 transition hover:border-sky-500/70 hover:bg-slate-900 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] sm:gap-4"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-slate-50">
                              {meal.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-[0.7rem] uppercase tracking-[0.2em] text-slate-400">
                              <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-sky-200">
                                {meal.hall}
                              </span>
                              <span className="h-0.5 w-6 rounded-full bg-slate-700" />
                              <span>
                                {new Date(meal.createdAt).toLocaleString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            <div className="flex gap-0.5 text-sm">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <span
                                  key={index}
                                  className={`${
                                    meal.rating >= index + 1
                                      ? "text-sky-300"
                                      : "text-slate-600"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {meal.description && (
                          <p className="text-xs leading-relaxed text-slate-300">
                            {meal.description}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.7rem] text-slate-400">
                          <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2 py-0.5">
                            Crowd: {meal.crowd}
                          </span>
                        </div>
                      </div>
                      {meal.imageUrl ? (
                        <div className="relative overflow-hidden rounded-lg border border-slate-800/70 bg-slate-950/60">
                          <img
                            src={meal.imageUrl}
                            alt={meal.name}
                            className="h-32 w-full object-cover sm:h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-950/40 text-[0.7rem] text-slate-500">
                          No photo for this meal
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-4 border-t border-slate-800/80 pt-4 text-center text-[0.7rem] text-slate-500">
          <p>RoareeReview is your personal log for Columbia dining hall meals.</p>
        </footer>
      </div>
    </main>
  );
}
