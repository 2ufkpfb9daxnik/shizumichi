"use client";

import type { AppPhase, DemoRoute, RouteId, Sensitivity, SoundType } from "@/lib/types";
import NoiseRecorder from "@/components/NoiseRecorder";
import {
  HOME,
  QUIETNESS_LABEL,
  SENSITIVITY_OPTIONS,
  SOUND_OPTIONS,
} from "@/lib/demo/data";

type Setup = {
  sound: SoundType | null;
  sensitivity: Sensitivity | null;
};

type Props = {
  phase: AppPhase;
  setup: Setup;
  onSetupChange: (next: Setup) => void;
  onSearch: () => void;
  routes: DemoRoute[];
  selectedId: RouteId;
  onSelectRoute: (id: RouteId) => void;
  onStartNav: () => void;
  onBackToCompare: () => void;
  onReady: () => void;
  remainingLabel: string;
  etaLabel: string;
  noiseNow: number;
  cue: string;
  progress: number;
  showEarNotice: boolean;
  destination: string;
  onDestinationChange: (value: string) => void;
};

function RouteCard({
  route,
  selected,
  onSelect,
}: {
  route: DemoRoute;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${route.name}を選択`}
      className={`w-full rounded-xl border-2 p-3 text-left transition ${
        selected ? "border-current bg-white shadow-sm" : "border-slate-200 bg-white"
      }`}
      style={{ color: selected ? route.color : "#334155" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-2 font-display text-sm font-semibold" style={{ color: route.color }}>
            <span
              className="inline-block h-1.5 w-6 rounded-full"
              style={{
                background: route.color,
                boxShadow: selected ? `0 0 0 3px ${route.color}22` : undefined,
              }}
              aria-hidden
            />
            {route.name}
          </p>
          <p className="mt-1 hidden text-xs text-slate-600 sm:block">{route.description}</p>
        </div>
        <div className="text-right text-slate-900">
          <p className="font-display text-2xl font-semibold leading-none">{route.durationMin}分</p>
          <p className="mt-1 text-xs text-slate-600">{route.distanceLabel}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-800">
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
          <dt className="text-slate-500">騒音スコア</dt>
          <dd className="font-semibold">{route.noiseScore}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
          <dt className="text-slate-500">静かさ</dt>
          <dd className="font-semibold">{QUIETNESS_LABEL[route.quietness]}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 px-2 py-1.5">
          <dt className="text-slate-500">{route.extraLabel}</dt>
          <dd className="font-semibold">{route.extraValue}</dd>
        </div>
      </dl>
      <p className="mt-2 text-[11px] text-slate-500">デモ用推定値</p>
      {selected && <p className="sr-only">選択中</p>}
    </button>
  );
}

export default function SidePanel({
  phase,
  setup,
  onSetupChange,
  onSearch,
  routes,
  selectedId,
  onSelectRoute,
  onStartNav,
  onBackToCompare,
  onReady,
  remainingLabel,
  etaLabel,
  noiseNow,
  cue,
  progress,
  showEarNotice,
  destination,
  onDestinationChange,
}: Props) {
  const selected = routes.find((r) => r.id === selectedId) ?? routes[2];

  return (
    <aside className="flex h-full min-h-0 flex-col gap-2 overflow-y-auto bg-slate-100 p-2.5 sm:gap-3 sm:p-4">
      {phase === "idle" && (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-3">
            <label className="block text-xs text-slate-500" htmlFor="origin-display">
              出発
            </label>
            <div
              id="origin-display"
              className="mt-1 flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800"
            >
              <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-slate-700" aria-hidden />
              {HOME.name}
            </div>
            <label className="mt-3 block text-xs text-slate-500" htmlFor="destination-input">
              目的地
            </label>
            <div className="relative mt-1">
              <input
                id="destination-input"
                type="search"
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                placeholder="行き先を入力"
                autoComplete="off"
                aria-label="目的地"
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-slate-900 outline-none ring-teal-700 placeholder:font-normal placeholder:text-slate-400 focus:border-teal-700 focus:ring-2"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
              </span>
            </div>
          </section>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-3">
            <legend className="px-1 text-sm font-semibold text-slate-900">避けたい音</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SOUND_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm sm:min-h-11 ${
                    setup.sound === opt.id
                      ? "border-teal-700 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="sound"
                    value={opt.id}
                    checked={setup.sound === opt.id}
                    onChange={() => onSetupChange({ ...setup, sound: opt.id })}
                    className="accent-teal-700"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-200 bg-white p-3">
            <legend className="px-1 text-sm font-semibold text-slate-900">音への敏感さ</legend>
            <div className="mt-2 flex flex-col gap-2">
              {SENSITIVITY_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm sm:min-h-11 ${
                    setup.sensitivity === opt.id
                      ? "border-teal-700 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="sensitivity"
                    value={opt.id}
                    checked={setup.sensitivity === opt.id}
                    onChange={() => onSetupChange({ ...setup, sensitivity: opt.id })}
                    className="accent-teal-700"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={onSearch}
            className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 text-base font-semibold text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900"
          >
            経路を検索
          </button>

          <NoiseRecorder compact />
        </>
      )}

      {phase === "searching" && (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="font-display text-lg font-semibold text-slate-900">騒音の少ない道を比較しています</p>
          <p className="mt-2 text-sm text-slate-600">サンプルデータで3つの経路を用意しています</p>
        </div>
      )}

      {(phase === "compare" || phase === "navigate" || phase === "arrived") && (
        <>
          {phase === "compare" && (
            <>
              <div>
                <h2 className="font-display text-sm font-semibold text-slate-900">経路比較</h2>
                <p className="text-xs text-slate-500">体調や予定に合わせて選べます。デモ用推定値です。</p>
              </div>
              <div className="flex flex-col gap-2">
                {routes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    selected={route.id === selectedId}
                    onSelect={() => onSelectRoute(route.id)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={onStartNav}
                className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 text-base font-semibold text-white hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900"
              >
                このルートで案内を開始
              </button>
            </>
          )}

          {phase === "navigate" && (
            <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">選択中ルート</p>
              <p className="font-display text-lg font-semibold" style={{ color: selected.color }}>
                {selected.name}
              </p>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-xs text-slate-500">到着までの目安</dt>
                  <dd className="text-lg font-semibold text-slate-900">{etaLabel}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-xs text-slate-500">残り距離</dt>
                  <dd className="text-lg font-semibold text-slate-900">{remainingLabel}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-xs text-slate-500">現在の騒音スコア</dt>
                  <dd className="text-lg font-semibold text-slate-900">{noiseNow}</dd>
                </div>
                <div className="rounded-lg bg-slate-50 p-2">
                  <dt className="text-xs text-slate-500">進行状況</dt>
                  <dd className="text-lg font-semibold text-slate-900">{Math.round(progress * 100)}%</dd>
                </div>
              </dl>
              <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-950">{cue}</p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                <div className="h-full bg-teal-700" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              {showEarNotice && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  <p>この先に騒音スコアの高い区間があります。</p>
                  <p className="mt-1">必要に応じて、対応イヤホンのノイズ低減機能をご利用ください。</p>
                  <button
                    type="button"
                    onClick={onReady}
                    className="mt-2 min-h-11 w-full rounded-lg bg-white px-3 py-2 font-medium text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50"
                  >
                    準備できました
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={onBackToCompare}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                別のルートを見る
              </button>

              <NoiseRecorder routeName={selected.name} progress={progress} />
            </section>
          )}

          {phase === "arrived" && (
            <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-display text-xl font-semibold text-slate-900">
                市立ひだまり図書館に到着しました
              </p>
              <p className="text-sm leading-relaxed text-slate-700">{selected.arrivalNote}</p>
              <button
                type="button"
                onClick={onBackToCompare}
                className="min-h-12 rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white hover:bg-teal-700"
              >
                ルート比較に戻る
              </button>
            </section>
          )}
        </>
      )}
    </aside>
  );
}
