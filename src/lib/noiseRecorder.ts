export type NoiseRecording = {
  id: string;
  waveform: number[];
  durationSec: number;
  peakLevel: number;
  avgLevel: number;
  recordedAt: number;
  routeName?: string;
  progress?: number;
  simulated?: boolean;
  blob?: Blob;
  url?: string;
};

export type NoiseRecorderContext = {
  routeName?: string;
  progress?: number;
};

const BAR_COUNT = 28;

function rmsLevel(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>): number {
  analyser.getByteTimeDomainData(buffer);
  let sum = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    const v = (buffer[i] - 128) / 128;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / buffer.length);
  return Math.min(100, Math.round(rms * 280));
}

function barsFromAnalyser(analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>): number[] {
  analyser.getByteTimeDomainData(buffer);
  const step = Math.max(1, Math.floor(buffer.length / BAR_COUNT));
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const start = i * step;
    let sum = 0;
    for (let j = 0; j < step; j += 1) {
      const v = (buffer[start + j] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / step);
    return Math.min(1, Math.max(0.1, rms * 2.8));
  });
}

function simulatedBars(t: number, level: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const wave =
      Math.sin(t * 5 + i * 0.45) * 0.22 +
      Math.sin(t * 2.1 + i * 0.18) * 0.14 +
      Math.random() * 0.18;
    const h = 0.12 + (level / 100) * 0.55 + wave;
    return Math.min(1, Math.max(0.1, h));
  });
}

function summarizeWaveform(history: number[][]): number[] {
  if (history.length === 0) return Array.from({ length: BAR_COUNT }, () => 0.2);
  const count = history[0].length;
  const peak = new Array<number>(count).fill(0);
  for (const frame of history) {
    for (let i = 0; i < count; i += 1) {
      peak[i] = Math.max(peak[i], frame[i]);
    }
  }
  return peak;
}

export class NoiseRecorderSession {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private buffer: Uint8Array<ArrayBuffer> | null = null;
  private rafId: number | null = null;
  private startedAt = 0;
  private peak = 0;
  private sum = 0;
  private samples = 0;
  private waveformHistory: number[][] = [];
  private context: NoiseRecorderContext = {};
  private mode: "real" | "simulated" = "real";
  private mimeType = "audio/webm";
  private onLevel: ((level: number) => void) | null = null;
  private onWaveform: ((bars: number[]) => void) | null = null;
  private onDone: ((recording: NoiseRecording) => void) | null = null;

  async start(
    context: NoiseRecorderContext,
    onLevel: (level: number) => void,
    onWaveform: (bars: number[]) => void,
    onDone: (recording: NoiseRecording) => void
  ): Promise<boolean> {
    this.context = context;
    this.onLevel = onLevel;
    this.onWaveform = onWaveform;
    this.onDone = onDone;
    this.peak = 0;
    this.sum = 0;
    this.samples = 0;
    this.chunks = [];
    this.waveformHistory = [];
    this.startedAt = performance.now();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mode = "real";
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);
      this.buffer = new Uint8Array(this.analyser.fftSize);

      this.mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      this.recorder = new MediaRecorder(this.stream, { mimeType: this.mimeType });
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      this.recorder.onstop = () => this.finish();
      this.recorder.start(200);
    } catch {
      this.mode = "simulated";
    }

    this.tick();
    return this.mode === "real";
  }

  stop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.mode === "real" && this.recorder?.state === "recording") {
      this.recorder.stop();
    } else if (this.mode === "simulated") {
      this.finish();
    } else {
      this.cleanup();
    }
  }

  private tick = (): void => {
    let level = 0;
    let bars: number[] = [];

    if (this.mode === "real" && this.analyser && this.buffer) {
      level = rmsLevel(this.analyser, this.buffer);
      bars = barsFromAnalyser(this.analyser, this.buffer);
    } else {
      const t = (performance.now() - this.startedAt) / 1000;
      level = Math.min(
        100,
        Math.round(32 + Math.sin(t * 2.8) * 14 + Math.sin(t * 7.3) * 8 + Math.random() * 22)
      );
      bars = simulatedBars(t, level);
    }

    this.onLevel?.(level);
    this.onWaveform?.(bars);
    this.peak = Math.max(this.peak, level);
    this.sum += level;
    this.samples += 1;
    this.waveformHistory.push(bars);
    if (this.waveformHistory.length > 90) this.waveformHistory.shift();

    this.rafId = requestAnimationFrame(this.tick);
  };

  private finish(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const durationSec = Math.max(0.1, (performance.now() - this.startedAt) / 1000);
    const avgLevel = this.samples > 0 ? Math.round(this.sum / this.samples) : 0;
    const waveform = summarizeWaveform(this.waveformHistory);

    const recording: NoiseRecording = {
      id: `${Date.now()}`,
      waveform,
      durationSec,
      peakLevel: this.peak,
      avgLevel,
      recordedAt: Date.now(),
      routeName: this.context.routeName,
      progress: this.context.progress,
      simulated: this.mode === "simulated",
    };

    if (this.mode === "real" && this.chunks.length > 0) {
      const blob = new Blob(this.chunks, { type: this.mimeType });
      recording.blob = blob;
      recording.url = URL.createObjectURL(blob);
    }

    this.onDone?.(recording);
    this.cleanup();
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    if (this.audioContext) this.audioContext.close();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.recorder = null;
    this.buffer = null;
    this.rafId = null;
  }
}
