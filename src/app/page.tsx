"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AppHeader from "@/components/AppHeader";
import SidePanel from "@/components/SidePanel";
import FutureModal from "@/components/FutureModal";
import type { AppPhase, LatLng, RouteId, Sensitivity, SoundType } from "@/lib/types";
import {
  HOME,
  LIBRARY,
  MAP_CENTER,
  MAP_ZOOM,
  NAV_DURATION_MS,
  RECORDING_DEMO_PATH,
  ROUTES,
  SAMPLE_NOTE,
  SEARCH_DELAY_MS,
  getRoute,
} from "@/lib/demo/data";
import { pointAlongPath, remainingMeters } from "@/lib/geo";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-600">
      地図を読み込み中…
    </div>
  ),
});

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomePage() {
  const [demo, setDemo] = useState(false);
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [sound, setSound] = useState<SoundType | null>(null);
  const [sensitivity, setSensitivity] = useState<Sensitivity | null>(null);
  const [selectedId, setSelectedId] = useState<RouteId>("quiet");
  const [futureOpen, setFutureOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [traveler, setTraveler] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState("");
  const [earDismissed, setEarDismissed] = useState(false);
  const [isNoiseRecording, setIsNoiseRecording] = useState(false);
  const searchTimer = useRef<number | null>(null);
  const navFrame = useRef<number | null>(null);
  const recordFrame = useRef<number | null>(null);
  const noiseRecordingRef = useRef(false);

  const selected = useMemo(() => getRoute(selectedId), [selectedId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDemo(params.get("demo") === "1");
  }, []);

  const stopNav = useCallback(() => {
    if (navFrame.current != null) {
      cancelAnimationFrame(navFrame.current);
      navFrame.current = null;
    }
  }, []);

  const stopRecordingAnim = useCallback(() => {
    if (recordFrame.current != null) {
      cancelAnimationFrame(recordFrame.current);
      recordFrame.current = null;
    }
  }, []);

  const resetApp = useCallback(() => {
    stopNav();
    stopRecordingAnim();
    noiseRecordingRef.current = false;
    setIsNoiseRecording(false);
    if (searchTimer.current != null) {
      window.clearTimeout(searchTimer.current);
      searchTimer.current = null;
    }
    setPhase("idle");
    setSound(null);
    setSensitivity(null);
    setSelectedId("quiet");
    setFutureOpen(false);
    setProgress(0);
    setTraveler(null);
    setEarDismissed(false);
    setDestination("");
  }, [stopNav, stopRecordingAnim]);

  const handleNoiseRecordingChange = useCallback(
    (recording: boolean) => {
      noiseRecordingRef.current = recording;
      setIsNoiseRecording(recording);

      if (!recording) {
        stopRecordingAnim();
        if (phase !== "navigate" && phase !== "arrived") {
          setTraveler(null);
        }
        return;
      }

      if (phase === "navigate") {
        stopNav();
      }

      setTraveler(pointAlongPath(RECORDING_DEMO_PATH, 0));

      const started = performance.now();
      const wanderSpeed = prefersReducedMotion() ? 0.025 : 0.018;

      const tick = (now: number) => {
        if (!noiseRecordingRef.current) return;
        const elapsed = (now - started) / 1000;
        const loop = (elapsed * wanderSpeed) % 2;
        const along = loop <= 1 ? loop : 2 - loop;
        const p = along * 0.92;
        setTraveler(pointAlongPath(RECORDING_DEMO_PATH, p));
        recordFrame.current = requestAnimationFrame(tick);
      };
      recordFrame.current = requestAnimationFrame(tick);
    },
    [phase, stopNav, stopRecordingAnim]
  );

  const pendingRoute = useRef<RouteId>("quiet");

  const startSearch = useCallback((nextId: RouteId = "quiet") => {
    pendingRoute.current = nextId;
    setPhase("searching");
    searchTimer.current = window.setTimeout(() => {
      setSelectedId(pendingRoute.current);
      setPhase("compare");
      searchTimer.current = null;
    }, SEARCH_DELAY_MS);
  }, []);

  const startNav = useCallback(
    (id: RouteId = selectedId) => {
      stopNav();
      const route = getRoute(id);
      setSelectedId(id);
      setEarDismissed(false);
      setProgress(0);
      setTraveler(route.path[0] ?? { lat: HOME.lat, lng: HOME.lng });
      setPhase("navigate");

      const reduced = prefersReducedMotion();
      const duration = reduced ? 400 : NAV_DURATION_MS;
      const started = performance.now();

      const tick = (now: number) => {
        const t = Math.min(1, (now - started) / duration);
        const eased = reduced ? t : t;
        setProgress(eased);
        setTraveler(pointAlongPath(route.path, eased));
        if (eased >= 1) {
          setPhase("arrived");
          navFrame.current = null;
          return;
        }
        navFrame.current = requestAnimationFrame(tick);
      };
      navFrame.current = requestAnimationFrame(tick);
    },
    [selectedId, stopNav]
  );

  const backToCompare = useCallback(() => {
    stopNav();
    setPhase("compare");
    setProgress(0);
    setTraveler(null);
    setEarDismissed(false);
  }, [stopNav]);

  useEffect(() => {
    return () => {
      stopNav();
      stopRecordingAnim();
      if (searchTimer.current != null) window.clearTimeout(searchTimer.current);
    };
  }, [stopNav, stopRecordingAnim]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.key === "Escape") {
        setFutureOpen(false);
        return;
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setFutureOpen(true);
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        resetApp();
        return;
      }
      if (e.key === "1" || e.key === "2" || e.key === "3") {
        const id: RouteId = e.key === "1" ? "shortest" : e.key === "2" ? "balance" : "quiet";
        if (phase === "idle" || phase === "searching") startSearch(id);
        else if (phase === "navigate") startNav(id);
        else setSelectedId(id);
        return;
      }
      if (e.key === "Enter") {
        if (phase === "idle") startSearch();
        else if (phase === "compare") startNav();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, resetApp, startNav, startSearch]);

  const cue = useMemo(() => {
    const hits = selected.cues.filter((c) => progress >= c.at);
    return hits.length > 0 ? hits[hits.length - 1].text : "案内を開始しました";
  }, [progress, selected]);

  const showEarNotice = useMemo(() => {
    if (earDismissed) return false;
    if (selectedId === "quiet") return false;
    return selected.cues.some((c) => c.notice && progress >= c.at && progress < 0.92);
  }, [earDismissed, progress, selected, selectedId]);

  const noiseNow = useMemo(() => {
    const start = 28;
    const peak = selected.noiseScore;
    const end = 22;
    if (progress < 0.25) return Math.round(start + (peak - start) * (progress / 0.25) * 0.35);
    if (progress < 0.7) {
      const u = (progress - 0.25) / 0.45;
      return Math.round(start * 0.5 + peak * (0.55 + 0.45 * u));
    }
    const u = (progress - 0.7) / 0.3;
    return Math.round(peak + (end - peak) * u);
  }, [progress, selected.noiseScore]);

  const remain = remainingMeters(selected.path, progress);
  const remainingLabel = remain >= 1000 ? `${(remain / 1000).toFixed(2)}km` : `${remain}m`;
  const etaMin = Math.max(1, Math.round(selected.durationMin * (1 - progress)));
  const etaLabel = `${etaMin}分`;

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-slate-100">
      <AppHeader onOpenFuture={() => setFutureOpen(true)} />

      <div className="app-shell min-h-0 flex-1">
        <section className="relative min-h-0 overflow-hidden bg-slate-200" aria-label="地図">
          <MapView
            routes={ROUTES}
            selectedId={selectedId}
            phase={phase}
            traveler={traveler}
            demo={demo}
            isNoiseRecording={isNoiseRecording}
          />
          <div className="pointer-events-none absolute bottom-2 left-2 z-[500] max-w-[min(94%,18rem)] rounded-md bg-white/90 px-2 py-1.5 text-[10px] leading-snug text-slate-700 shadow-sm sm:bottom-8 sm:left-3 sm:max-w-[min(92%,22rem)] sm:rounded-lg sm:px-2.5 sm:py-2 sm:text-[11px]">
            {phase !== "idle" && phase !== "searching" && (
              <>
                <p className="flex flex-wrap gap-x-2.5 gap-y-0.5 sm:gap-x-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-5 bg-[#d4524a]" />
                    最短
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-5 border-t-2 border-dashed border-[#d8891a]" />
                    バランス
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-5 border-t-2 border-dotted border-[#1f7a66]" />
                    静音
                  </span>
                </p>
                <p className="mt-0.5 font-medium">選択中：{selected.name}</p>
              </>
            )}
            <p className="mt-0.5 text-[9px] leading-tight text-slate-600 sm:hidden">提案検証用・サンプルデータ</p>
            <p className="mt-0.5 hidden text-slate-600 sm:block">{SAMPLE_NOTE}</p>
          </div>
          {demo && (
            <p className="pointer-events-none absolute bottom-3 right-3 z-[500] rounded bg-slate-900/70 px-1.5 py-0.5 text-[10px] tracking-wide text-white">
              DEMO
            </p>
          )}
        </section>

        <SidePanel
          phase={phase}
          setup={{ sound, sensitivity }}
          onSetupChange={(next) => {
            setSound(next.sound);
            setSensitivity(next.sensitivity);
          }}
          onSearch={startSearch}
          routes={ROUTES}
          selectedId={selectedId}
          onSelectRoute={setSelectedId}
          onStartNav={() => startNav()}
          onBackToCompare={backToCompare}
          onReady={() => setEarDismissed(true)}
          remainingLabel={remainingLabel}
          etaLabel={etaLabel}
          noiseNow={noiseNow}
          cue={cue}
          progress={progress}
          showEarNotice={showEarNotice}
          destination={destination}
          onDestinationChange={setDestination}
          onNoiseRecordingChange={handleNoiseRecordingChange}
        />
      </div>

      <FutureModal open={futureOpen} onClose={() => setFutureOpen(false)} />
      <span className="sr-only">
        地図中心 {MAP_CENTER.lat}, {MAP_CENTER.lng} ズーム {MAP_ZOOM}。
        {LIBRARY.name}はデモ用の目的地です。
      </span>
    </div>
  );
}
