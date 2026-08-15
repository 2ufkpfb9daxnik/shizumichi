"use client";

type Props = {
  onOpenFuture: () => void;
};

export default function AppHeader({ onOpenFuture }: Props) {
  return (
    <header className="relative z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-1.5 sm:px-5 sm:py-3">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-800 sm:h-10 sm:w-10 sm:rounded-xl"
          aria-hidden
        >
          <svg className="h-4 w-4 sm:h-[26px] sm:w-[26px]" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 22c4-9 8-13 10-13s6 4 10 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="9" r="2.2" fill="currentColor" />
            <path d="M22 11c2.2 1.4 3.6 3.6 4.2 6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M24.4 8.8c3 2 5 5.2 5.6 8.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[15px] font-semibold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            しずみち
          </h1>
          <p className="hidden truncate text-sm text-slate-600 sm:block">音との距離を選べるルート案内</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenFuture}
        className="shrink-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:rounded-lg sm:px-3 sm:py-2 sm:text-sm"
        aria-haspopup="dialog"
      >
        今後の機能
      </button>
    </header>
  );
}
