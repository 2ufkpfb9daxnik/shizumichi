"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  NoiseRecorderSession,
  type NoiseRecording,
} from "@/lib/noiseRecorder";

type Props = {
  routeName?: string;
  progress?: number;
  compact?: boolean;
};

function formatSec(sec: number): string {
  if (sec < 60) return `${sec.toFixed(1)}秒`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}分${s}秒`;
}

export default function NoiseRecorder({ routeName, progress, compact = false }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<NoiseRecording[]>([]);
  const sessionRef = useRef<NoiseRecorderSession | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      sessionRef.current?.stop();
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const session = new NoiseRecorderSession();
    sessionRef.current = session;
    setIsRecording(true);
    setLevel(0);
    await session.start(
      { routeName, progress },
      setLevel,
      (recording) => {
        urlsRef.current.push(recording.url);
        setRecordings((prev) => [recording, ...prev].slice(0, 5));
        setIsRecording(false);
        setLevel(0);
        sessionRef.current = null;
      },
      (message) => {
        setError(message);
        setIsRecording(false);
        setLevel(0);
        sessionRef.current = null;
      }
    );
  }, [routeName, progress]);

  const stop = useCallback(() => {
    sessionRef.current?.stop();
  }, []);

  const remove = useCallback((id: string, url: string) => {
    URL.revokeObjectURL(url);
    urlsRef.current = urlsRef.current.filter((u) => u !== url);
    setRecordings((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-2.5" : "p-3"}`}
      aria-label="道路の騒音記録"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">道路の音を記録</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
            マイクで周囲の音量を測りながら短く録音します。
          </p>
        </div>
        {isRecording && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
            REC
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>音量</span>
          <span className="font-semibold text-slate-800">{level}</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-[width] duration-75 ${isRecording ? "bg-red-500" : "bg-teal-600"}`}
            style={{ width: `${level}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {!isRecording ? (
          <button
            type="button"
            onClick={() => void start()}
            className="min-h-10 flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            録音開始
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="min-h-10 flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
          >
            録音停止
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}

      {recordings.length > 0 && (
        <ul className="mt-3 space-y-2">
          {recordings.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700">
                <span>{formatSec(r.durationSec)}</span>
                <span>平均 {r.avgLevel}</span>
                <span>最大 {r.peakLevel}</span>
                {r.routeName && <span>{r.routeName}</span>}
                {r.progress != null && <span>{Math.round(r.progress * 100)}%地点</span>}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <audio controls src={r.url} className="h-8 w-full min-w-0" preload="metadata" />
                <button
                  type="button"
                  onClick={() => remove(r.id, r.url)}
                  className="shrink-0 rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-white"
                  aria-label="この録音を削除"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
