import type { EligibilityCheckResult } from "@/types/visa";

interface EligibilityResultProps {
  result: EligibilityCheckResult;
}

export function EligibilityResult({ result }: EligibilityResultProps) {
  return (
    <div className="space-y-4">
      {/* 総合判定 */}
      <div
        className={`p-4 rounded-lg border-2 ${
          result.eligible
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {result.eligible
              ? "申請可能です"
              : "現在、要件を満たしていません"}
          </h3>
          <div className="text-2xl font-bold">
            {result.overallScore}
            <span className="text-sm font-normal text-gray-500">/100</span>
          </div>
        </div>
        <p className="text-sm mt-1 text-gray-600">
          {result.eligible
            ? "基本的な要件を満たしています。必要書類を準備して申請に進みましょう。"
            : "以下の項目を確認し、要件を満たしてから申請してください。"}
        </p>
      </div>

      {/* 個別チェック結果 */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700">チェック項目</h4>
        {result.checks.map((check) => (
          <div
            key={check.id}
            className={`p-3 rounded-md border ${
              check.passed
                ? "bg-green-50 border-green-200"
                : check.severity === "critical"
                  ? "bg-red-50 border-red-200"
                  : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {check.passed ? "✓" : check.severity === "critical" ? "✗" : "△"}
              </span>
              <span className="font-medium text-sm">{check.name}</span>
            </div>
            <p className="text-sm text-gray-600 ml-7">{check.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
