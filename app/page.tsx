
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Timeframe = "week" | "month" | "year";

type RewindStats = {
  timeframeLabel: string;
  totalCaptions: number;
  uniqueImages: number;
  uniqueProfiles: number;
  avgLaughScore: number;
  topHumorFlavors: { name: string; count: number }[];
  topCommunities: { name: string; count: number }[];
};

type TopCaption = {
  id: string;
  text: string;
  imageUrl: string | null;
  profileName: string;
  likes: number;
  votes: number;
  saves: number;
  communityName?: string | null;
  humorFlavor?: string | null;
};

type Streak = {
  id: string;
  label: string;
  description: string;
  value: string;
};

// Placeholder data – in the real app, this will be loaded from Supabase
function useMockRewindData(timeframe: Timeframe) {
  const stats: RewindStats = {
    timeframeLabel:
      timeframe === "week"
        ? "Random Week in Crackd History"
        : timeframe === "month"
        ? "Random Month in Crackd History"
        : "Random Year in Crackd History",
    totalCaptions: 4821,
    uniqueImages: 1320,
    uniqueProfiles: 946,
    avgLaughScore: 4.3,
    topHumorFlavors: [
      { name: "Chaotic Gen-Z", count: 1370 },
      { name: "Deadpan Academic", count: 902 },
      { name: "Unhinged Groupchat", count: 611 },
    ],
    topCommunities: [
      { name: "CC '28 Groupchat", count: 540 },
      { name: "SEAS Discord", count: 421 },
      { name: "Butler Nightshift", count: 288 },
    ],
  };

  const topCaptions: TopCaption[] = [
    {
      id: "1",
      text: "POV: you open Courseworks and it's just vibes and violence.",
      imageUrl: "/globe.svg",
      profileName: "moodboard@butler",
      likes: 420,
      votes: 369,
      saves: 212,
      communityName: "Butler Nightshift",
      humorFlavor: "Chaotic Gen-Z",
    },
    {
      id: "2",
      text: "This syllabus has more red flags than my dating history.",
      imageUrl: "/window.svg",
      profileName: "syllabus_slanderer",
      likes: 389,
      votes: 310,
      saves: 180,
      communityName: "CC '28 Groupchat",
      humorFlavor: "Unhinged Groupchat",
    },
    {
      id: "3",
      text: "Canvas due dates are a suggestion. Financial aid deadlines are a threat.",
      imageUrl: "/file.svg",
      profileName: "admin office enjoyer",
      likes: 361,
      votes: 298,
      saves: 166,
      communityName: "SEAS Discord",
      humorFlavor: "Deadpan Academic",
    },
  ];

  const streaks: Streak[] = [
    {
      id: "s1",
      label: "Most chaotic day",
      description: "Peak caption volume",
      value: "Jan 23 • 1,102 captions",
    },
    {
      id: "s2",
      label: "Longest laughter streak",
      description: "Consecutive days with 4.5+ laugh score",
      value: "7 days",
    },
    {
      id: "s3",
      label: "Community takeover",
      description: "Single community share dominance",
      value: "61% from CC '28 Groupchat",
    },
  ];

  return {
    stats,
    topCaptions,
    streaks,
  };
}

export default function CrackdRewindPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>("week");
  const { stats, topCaptions, streaks } = useMockRewindData(timeframe);

  const totalEngagement = useMemo(() => {
    return topCaptions.reduce(
      (acc, c) => ({
        likes: acc.likes + c.likes,
        votes: acc.votes + c.votes,
        saves: acc.saves + c.saves,
      }),
      { likes: 0, votes: 0, saves: 0 }
    );
  }, [topCaptions]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-10 pt-10 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-sky-200">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>Crackd Rewind</span>
              </div>
              <Link
                href="/data"
                className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-sky-200"
              >
                View Data
              </Link>
            </div>
            <div className="space-y-2">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Your week in{" "}
                <span className="bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                  unhinged captions
                </span>
                .
              </h1>
              <p className="max-w-xl text-sm text-slate-300 sm:text-base">
                A visual mixtape of the captions, communities, and humor flavors
                that defined a random slice of Crackd (I stole this from Spotify Wrapped).
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/60 p-1">
              {(["week", "month", "year"] as Timeframe[]).map((option) => {
                const active = timeframe === option;
                const label =
                  option === "week"
                    ? "Random Week"
                    : option === "month"
                    ? "Random Month"
                    : "Random Year";
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTimeframe(option)}
                    className={`rounded-full px-3 py-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition ${
                      active
                        ? "bg-sky-400 text-slate-950 shadow-sm shadow-sky-500/40"
                        : "text-slate-300 hover:text-sky-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-[0.7rem] text-slate-500">
              {stats.timeframeLabel}
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-950/90 p-5 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Caption volume
                  </p>
                  <p className="mt-2 text-3xl font-semibold sm:text-4xl">
                    {stats.totalCaptions.toLocaleString()}
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      captions
                    </span>
                  </p>
                </div>
                <div className="flex gap-4 text-xs text-slate-300">
                  <div className="space-y-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-3 py-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                      Images
                    </p>
                    <p className="text-sm font-medium">
                      {stats.uniqueImages.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 rounded-2xl border border-slate-700/80 bg-slate-900/60 px-3 py-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                      People
                    </p>
                    <p className="text-sm font-medium">
                      {stats.uniqueProfiles.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                    Avg laugh score
                  </p>
                  <p className="text-2xl font-semibold text-sky-300">
                    {stats.avgLaughScore.toFixed(1)}
                  </p>
                  <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="rounded-full bg-gradient-to-r from-sky-300 via-sky-400 to-fuchsia-400"
                      style={{
                        width: `${(stats.avgLaughScore / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                    Top humor flavors
                  </p>
                  <div className="space-y-1">
                    {stats.topHumorFlavors.map((flavor, index) => (
                      <div
                        key={flavor.name}
                        className="flex items-center justify-between gap-2 text-[0.74rem]"
                      >
                        <span className="flex items-center gap-1.5 text-slate-200">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === 0
                                ? "bg-sky-400"
                                : index === 1
                                ? "bg-fuchsia-400"
                                : "bg-emerald-400"
                            }`}
                          />
                          {flavor.name}
                        </span>
                        <span className="text-slate-400">
                          {flavor.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                    Loudest communities
                  </p>
                  <div className="space-y-1">
                    {stats.topCommunities.map((community) => (
                      <div
                        key={community.name}
                        className="flex items-center justify-between gap-2 text-[0.74rem]"
                      >
                        <span className="truncate text-slate-200">
                          {community.name}
                        </span>
                        <span className="text-slate-400">
                          {community.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Top captions this{" "}
                  {timeframe === "week"
                    ? "week"
                    : timeframe === "month"
                    ? "month"
                    : "year"}
                </h2>
                <p className="text-[0.7rem] text-slate-500">
                  {totalEngagement.likes.toLocaleString()} likes •{" "}
                  {totalEngagement.votes.toLocaleString()} votes •{" "}
                  {totalEngagement.saves.toLocaleString()} saves
                </p>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {topCaptions.map((caption) => (
                  <article
                    key={caption.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                      {caption.imageUrl ? (
                        <img
                          src={caption.imageUrl}
                          alt={caption.text}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[0.7rem] text-slate-500">
                          Image from Crackd
                        </div>
                      )}
                    </div>
                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-50">
                      {caption.text}
                    </p>
                    <div className="mt-auto space-y-2 text-[0.7rem] text-slate-400">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          by{" "}
                          <span className="text-slate-200">
                            {caption.profileName}
                          </span>
                        </span>
                        {caption.communityName && (
                          <span className="truncate rounded-full bg-slate-950/80 px-2 py-0.5 text-[0.65rem] text-slate-300">
                            {caption.communityName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[0.68rem]">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-2 py-0.5">
                          <span className="text-slate-300">
                            ❤️ {caption.likes.toLocaleString()}
                          </span>
                          <span className="text-slate-400">
                            ▲ {caption.votes.toLocaleString()}
                          </span>
                          <span className="text-slate-400">
                            ⬇ {caption.saves.toLocaleString()}
                          </span>
                        </div>
                        {caption.humorFlavor && (
                          <span className="truncate text-sky-300">
                            {caption.humorFlavor}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Streaks & highlights
              </h2>
              <div className="mt-4 space-y-3">
                {streaks.map((streak) => (
                  <div
                    key={streak.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2.5"
                  >
                    <div className="space-y-1">
                      <p className="text-[0.74rem] font-medium text-slate-100">
                        {streak.label}
                      </p>
                      <p className="text-[0.7rem] text-slate-400">
                        {streak.description}
                      </p>
                    </div>
                    <span className="ml-2 max-w-[7rem] text-right text-[0.7rem] text-sky-300">
                      {streak.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-sky-950/60 via-slate-950 to-slate-950 p-4 sm:p-5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Flavor breakdown
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex h-16 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                  {stats.topHumorFlavors.map((flavor, index) => {
                    const total = stats.topHumorFlavors.reduce(
                      (sum, f) => sum + f.count,
                      0
                    );
                    const width = (flavor.count / total) * 100;
                    const color =
                      index === 0
                        ? "from-sky-400 to-sky-300"
                        : index === 1
                        ? "from-fuchsia-400 to-fuchsia-300"
                        : "from-emerald-400 to-emerald-300";
                    return (
                      <div
                        key={flavor.name}
                        className={`bg-gradient-to-r ${color}`}
                        style={{ width: `${width}%` }}
                      />
                    );
                  })}
                </div>
                <div className="space-y-1 text-[0.7rem] text-slate-300">
                  {stats.topHumorFlavors.map((flavor, index) => (
                    <div
                      key={flavor.name}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            index === 0
                              ? "bg-sky-400"
                              : index === 1
                              ? "bg-fuchsia-400"
                              : "bg-emerald-400"
                          }`}
                        />
                        <span>{flavor.name}</span>
                      </div>
                      <span className="text-slate-400">
                        {flavor.count.toLocaleString()} captions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="mt-auto rounded-3xl border border-slate-900 bg-slate-950/80 px-4 py-4 text-[0.7rem] text-slate-500">
              <p>
                Crackd Rewind is a read-only mixtape. All data comes directly
                from Crackd&apos;s logs – profiles, images, captions,
                communities, and Matrix flavors – no regeneration, just vibes.
              </p>
            </footer>
          </aside>
        </section>
      </div>
    </main>
  );
}
