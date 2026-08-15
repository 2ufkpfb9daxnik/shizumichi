"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FutureModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="future-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-lg sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="future-title" className="font-display text-xl font-semibold text-slate-900">
            街の音環境を、みんなで更新
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            aria-label="閉じる"
          >
            閉じる
          </button>
        </div>

        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
          <li>スマートフォンや街中の騒音センサから、音環境データを集めます。</li>
          <li>季節、時間帯、天候の違いを、経路の比較へ反映します。</li>
          <li>避けたい音の種類は、利用者ごとに設定できます。</li>
          <li>音声そのものは保存せず、端末上で算出した騒音レベルや分類結果だけを共有する構想です。</li>
          <li>現在の試作では、固定のサンプルデータを使用しています。</li>
        </ul>

        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-4 text-center text-sm text-slate-800">
          <p className="font-medium">スマートフォン・街中のセンサ</p>
          <p className="my-1 text-teal-800" aria-hidden>
            ↓
          </p>
          <p className="font-medium">匿名化された騒音スコア</p>
          <p className="my-1 text-teal-800" aria-hidden>
            ↓
          </p>
          <p className="font-medium">クラウド上の音環境マップ</p>
          <p className="my-1 text-teal-800" aria-hidden>
            ↓
          </p>
          <p className="font-medium">しずみちの経路比較</p>
        </div>
      </div>
    </div>
  );
}
