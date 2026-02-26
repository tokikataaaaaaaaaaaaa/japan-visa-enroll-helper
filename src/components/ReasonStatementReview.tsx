"use client";

import { useState } from "react";
import { reviewReasonStatement } from "@/lib/review";
import type { ApplicantProfile, DocumentReviewResult } from "@/types/visa";

interface ReasonStatementReviewProps {
  profile: ApplicantProfile;
}

export function ReasonStatementReview({ profile }: ReasonStatementReviewProps) {
  const [statement, setStatement] = useState("");
  const [result, setResult] = useState<DocumentReviewResult | null>(null);

  const handleReview = () => {
    const reviewResult = reviewReasonStatement(statement, profile);
    setResult(reviewResult);
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="reasonStatement" className="block text-sm font-medium mb-1">
          理由書の内容
        </label>
        <textarea
          id="reasonStatement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={10}
          placeholder="永住を希望する理由を記入してください。来日の経緯、現在の生活状況、今後の計画などを含めてください。"
          className="w-full border rounded-md px-3 py-2 text-sm resize-y"
        />
        <p className="text-xs text-gray-500 mt-1">
          {statement.length}文字（200文字以上を推奨）
        </p>
      </div>

      <button
        type="button"
        onClick={handleReview}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors"
      >
        理由書を添削する
      </button>

      {result && (
        <div className="space-y-3">
          {/* ステータス表示 */}
          <div
            className={`p-3 rounded-lg border-2 ${
              result.overallStatus === "good"
                ? "bg-green-50 border-green-300"
                : result.overallStatus === "needs_revision"
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-red-50 border-red-300"
            }`}
          >
            <p className="font-medium">
              {result.overallStatus === "good"
                ? "良い内容です"
                : result.overallStatus === "needs_revision"
                  ? "改善の余地があります"
                  : "大幅な修正が必要です"}
            </p>
          </div>

          {/* 問題点 */}
          {result.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">問題点</h4>
              <ul className="space-y-1">
                {result.issues.map((issue, i) => (
                  <li
                    key={i}
                    className={`text-sm p-2 rounded ${
                      issue.severity === "error"
                        ? "bg-red-50 text-red-800"
                        : "bg-yellow-50 text-yellow-800"
                    }`}
                  >
                    <span className="font-medium">{issue.message}</span>
                    <br />
                    <span className="text-xs">{issue.howToFix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 改善提案 */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">改善提案</h4>
              <ul className="space-y-1">
                {result.suggestions.map((suggestion, i) => (
                  <li
                    key={i}
                    className="text-sm p-2 bg-blue-50 text-blue-800 rounded"
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
