"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NoiseRecorderSession, type NoiseRecording } from "@/lib/noiseRecorder";

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

function WaveformBars({
  bars,
  active,
  className = "",
}: {
  bars: number[];
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex h-12 items-end justify-between gap-px rounded-lg bg-slate-900 px-2 py-2 ${className}`}
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-full min-w-[2px] max-w-[6px] rounded-sm transition-[height] duration-75 ${
            active ? "bg-red-400" : "bg-teal-400"
          }`}
          style={{ height: `${Math.round(h * 100)}%` }}
        />
      ))}
    </div>
  );
}

export default function NoiseRecorder({ routeName, progress, compact = false }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [level, setLevel] = useState(0);
  const [liveBars, setLiveBars] = useState<number[]>(Array(28).fill(0.12));
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
    const session = new NoiseRecorderSession();
    sessionRef.current = session;
    setIsRecording(true);
    setLevel(0);
    setLiveBars(Array(28).fill(0.12));

    const usedMic = await session.start(
      { routeName, progress },
      setLevel,
      setLiveBars,
      (recording) => {
        if (recording.url) urlsRef.current.push(recording.url);
        setRecordings((prev) => [recording, ...prev].slice(0, 5));
        setIsRecording(false);
        setIsSimulated(false);
        setLevel(0);
        setLiveBars(Array(28).fill(0.12));
        sessionRef.current = null;
      }
    );
    setIsSimulated(!usedMic);
  }, [routeName, progress]);

  const stop = useCallback(() => {
    sessionRef.current?.stop();
  }, []);

  const remove = useCallback((id: string, url?: string) => {
    if (url) {
      URL.revokeObjectURL(url);
      urlsRef.current = urlsRef.current.filter((u) => u !== url);
    }
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
            録音中は波形と音量を表示します。マイクが使えない場合は表示のみのデモになります。
          </p>
        </div>
        {isRecording && (
          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
            REC
          </span>
        )}
      </div>

      <div className="mt-3">
        <WaveformBars bars={liveBars} active={isRecording} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>音量</span>
          <span className="font-semibold text-slate-800">{level}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-[width] duration-75 ${isRecording ? "bg-red-500" : "bg-teal-600"}`}
            style={{ width: `${level}%` }}
          />
        </div>
        {isRecording && isSimulated && (
          <p className="mt-1.5 text-[10px] text-slate-500">マイク未使用・波形はデモ表示です</p>
        )}
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

      {recordings.length > 0 && (
        <ul className="mt-3 space-y-2">
          {recordings.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-700">
                <span>{formatSec(r.durationSec)}</span>
                <span>平均 {r.avgLevel}</span>
                <span>最大 {r.peakLevel}</span>
                {r.simulated && <span className="text-slate-500">デモ波形</span>}
                {r.routeName && <span>{r.routeName}</span>}
                {r.progress != null && <span>{Math.round(r.progress * 100)}%地点</span>}
              </div>
              <WaveformBars bars={r.waveform} className="mt-2 h-10" />
              {r.url && (
                <div className="mt-2 flex items-center gap-2">
                  <audio controls src={r.url} className="h-8 w-full min-w-0" preload="metadata" />
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(r.id, r.url)}
                className="mt-2 rounded px-2 py-1 text-[11px] text-slate-600 hover:bg-white"
                aria-label="この記録を削除"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
