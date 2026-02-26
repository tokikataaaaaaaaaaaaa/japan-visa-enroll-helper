"use client";

import type { ChecklistItem } from "@/types/visa";

interface DocumentChecklistProps {
  items: ChecklistItem[];
  onStatusChange: (
    documentId: string,
    newStatus: ChecklistItem["status"]
  ) => void;
}

const STATUS_LABELS: Record<ChecklistItem["status"], string> = {
  not_started: "未着手",
  preparing: "準備中",
  obtained: "取得済み",
  not_applicable: "該当なし",
};

const STATUS_CYCLE: ChecklistItem["status"][] = [
  "not_started",
  "preparing",
  "obtained",
];

export function DocumentChecklist({
  items,
  onStatusChange,
}: DocumentChecklistProps) {
  const obtained = items.filter((i) => i.status === "obtained").length;
  const total = items.length;

  const handleCycleStatus = (item: ChecklistItem) => {
    const currentIndex = STATUS_CYCLE.indexOf(item.status);
    const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
    onStatusChange(item.document.id, STATUS_CYCLE[nextIndex]);
  };

  // カテゴリでグループ化
  const categoryLabels: Record<string, string> = {
    basic: "基本書類",
    tax: "納税関連",
    pension_insurance: "年金・保険",
    employment: "職業証明",
    identity: "身分関係",
    guarantor: "身元保証人",
    asset: "資産証明",
    other: "その他",
  };

  const grouped = items.reduce(
    (acc, item) => {
      const cat = item.document.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>
  );

  return (
    <div className="space-y-4">
      {/* 進捗サマリー */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">書類準備の進捗</span>
          <span className="text-lg font-bold">
            {obtained} / {total}
          </span>
        </div>
        <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${total > 0 ? (obtained / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* カテゴリ別リスト */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <h4 className="font-medium text-sm text-gray-500 mb-2">
            {categoryLabels[category] || category}
          </h4>
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <div
                key={item.document.id}
                className={`p-3 rounded-md border flex items-start justify-between gap-3 ${
                  item.status === "obtained"
                    ? "bg-green-50 border-green-200"
                    : item.status === "preparing"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.document.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.document.description}
                  </p>
                  {item.document.yearsRequired && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      {item.document.yearsRequired}年分必要
                    </p>
                  )}
                  {item.document.obtainFrom && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      取得先: {item.document.obtainFrom}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleCycleStatus(item)}
                  aria-label={`ステータス変更: ${item.document.name}`}
                  className={`shrink-0 text-xs px-2 py-1 rounded-full border font-medium ${
                    item.status === "obtained"
                      ? "bg-green-100 text-green-700 border-green-300"
                      : item.status === "preparing"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                >
                  {STATUS_LABELS[item.status]}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 情報源 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-2">
          書類リストの情報源
        </h4>
        <ul className="space-y-1 text-xs text-gray-600">
          <li>
            <a
              href="https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              出入国在留管理庁 - 永住許可申請（必要書類一覧）
            </a>
          </li>
          <li>
            <a
              href="https://www.moj.go.jp/isa/applications/procedures/16-4.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              出入国在留管理庁 - 永住許可申請の手続
            </a>
          </li>
          <li>
            <a
              href="https://www.moj.go.jp/isa/publications/materials/nyukan_nyukan50.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              出入国在留管理庁 - 永住許可に関するガイドライン
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
