export type NoiseRecording = {
  id: string;
  blob: Blob;
  url: string;
  durationSec: number;
  peakLevel: number;
  avgLevel: number;
  recordedAt: number;
  routeName?: string;
  progress?: number;
};

export type NoiseRecorderContext = {
  routeName?: string;
  progress?: number;
};

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
  private context: NoiseRecorderContext = {};
  private onLevel: ((level: number) => void) | null = null;
  private onDone: ((recording: NoiseRecording) => void) | null = null;
  private onError: ((message: string) => void) | null = null;

  async start(
    context: NoiseRecorderContext,
    onLevel: (level: number) => void,
    onDone: (recording: NoiseRecording) => void,
    onError: (message: string) => void
  ): Promise<void> {
    this.context = context;
    this.onLevel = onLevel;
    this.onDone = onDone;
    this.onError = onError;
    this.peak = 0;
    this.sum = 0;
    this.samples = 0;
    this.chunks = [];

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onError("マイクへのアクセスが拒否されました。");
      return;
    }

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    source.connect(this.analyser);
    this.buffer = new Uint8Array(this.analyser.fftSize);

    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    this.recorder = new MediaRecorder(this.stream, { mimeType });
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.onstop = () => this.finish(mimeType);
    this.recorder.start(200);
    this.startedAt = performance.now();
    this.tick();
  }

  stop(): void {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.recorder?.state === "recording") {
      this.recorder.stop();
    } else {
      this.cleanup();
    }
  }

  private tick = (): void => {
    if (!this.analyser || !this.buffer || !this.onLevel) return;
    const level = rmsLevel(this.analyser, this.buffer);
    this.onLevel(level);
    this.peak = Math.max(this.peak, level);
    this.sum += level;
    this.samples += 1;
    this.rafId = requestAnimationFrame(this.tick);
  };

  private finish(mimeType: string): void {
    const durationSec = Math.max(0.1, (performance.now() - this.startedAt) / 1000);
    const avgLevel = this.samples > 0 ? Math.round(this.sum / this.samples) : 0;
    const blob = new Blob(this.chunks, { type: mimeType });
    const recording: NoiseRecording = {
      id: `${Date.now()}`,
      blob,
      url: URL.createObjectURL(blob),
      durationSec,
      peakLevel: this.peak,
      avgLevel,
      recordedAt: Date.now(),
      routeName: this.context.routeName,
      progress: this.context.progress,
    };
    if (this.onDone) this.onDone(recording);
    this.cleanup();
  }

  private cleanup(): void {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
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
