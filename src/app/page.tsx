"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/ProfileForm";
import { EligibilityResult } from "@/components/EligibilityResult";
import { DocumentChecklist } from "@/components/DocumentChecklist";
import { ReasonStatementReview } from "@/components/ReasonStatementReview";
import { checkEligibility } from "@/lib/eligibility";
import { generateChecklist } from "@/lib/documents";
import type {
  ApplicantProfile,
  ApplicationStep,
  ChecklistItem,
  EligibilityCheckResult,
} from "@/types/visa";

const STEP_LABELS: Record<ApplicationStep, string> = {
  profile_input: "プロフィール入力",
  eligibility_check: "適格性チェック",
  document_checklist: "書類チェックリスト",
  document_review: "書類添削",
  summary: "まとめ",
};

const STEPS: ApplicationStep[] = [
  "profile_input",
  "eligibility_check",
  "document_checklist",
  "document_review",
  "summary",
];

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>("profile_input");
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityCheckResult | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const handleProfileSubmit = (p: ApplicantProfile) => {
    setProfile(p);
    const result = checkEligibility(p);
    setEligibility(result);
    const list = generateChecklist(p);
    setChecklist(list);
    setCurrentStep("eligibility_check");
  };

  const handleStatusChange = (
    documentId: string,
    newStatus: ChecklistItem["status"]
  ) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.document.id === documentId
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  const goToStep = (step: ApplicationStep) => {
    if (step === "profile_input" || profile) {
      setCurrentStep(step);
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">永住許可申請サポート</h1>
        <p className="text-gray-600 mt-2">
          日本の永住権申請に必要な要件確認・書類準備・理由書添削をサポートします
        </p>
      </header>

      {/* ステップナビゲーション */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm overflow-x-auto">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-center gap-2">
              <button
                onClick={() => goToStep(step)}
                disabled={!profile && step !== "profile_input"}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                  step === currentStep
                    ? "bg-blue-600 text-white"
                    : index < currentStepIndex
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}. {STEP_LABELS[step]}
              </button>
              {index < STEPS.length - 1 && (
                <span className="text-gray-300">&rarr;</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* メインコンテンツ */}
      <main className="bg-white rounded-xl shadow-sm border p-6">
        {currentStep === "profile_input" && (
          <section>
            <h2 className="text-xl font-bold mb-4">申請者情報の入力</h2>
            <p className="text-sm text-gray-600 mb-6">
              現在のビザ状況や基本情報を入力してください。入力内容に基づいて適格性の判定と必要書類の一覧を生成します。
            </p>
            <ProfileForm onSubmit={handleProfileSubmit} />
          </section>
        )}

        {currentStep === "eligibility_check" && eligibility && (
          <section>
            <h2 className="text-xl font-bold mb-4">適格性チェック結果</h2>
            <EligibilityResult result={eligibility} />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCurrentStep("profile_input")}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                入力を修正する
              </button>
              <button
                onClick={() => setCurrentStep("document_checklist")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                必要書類を確認する
              </button>
            </div>
          </section>
        )}

        {currentStep === "document_checklist" && (
          <section>
            <h2 className="text-xl font-bold mb-4">必要書類チェックリスト</h2>
            <p className="text-sm text-gray-600 mb-4">
              書類の準備状況を管理できます。ステータスボタンをクリックして状態を更新してください。
            </p>
            <DocumentChecklist
              items={checklist}
              onStatusChange={handleStatusChange}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCurrentStep("eligibility_check")}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                適格性チェックに戻る
              </button>
              <button
                onClick={() => setCurrentStep("document_review")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                理由書の添削へ
              </button>
            </div>
          </section>
        )}

        {currentStep === "document_review" && profile && (
          <section>
            <h2 className="text-xl font-bold mb-4">理由書の添削</h2>
            <p className="text-sm text-gray-600 mb-4">
              永住を希望する理由書の内容をチェックし、改善点をアドバイスします。
            </p>
            <ReasonStatementReview profile={profile} />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCurrentStep("document_checklist")}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                書類リストに戻る
              </button>
              <button
                onClick={() => setCurrentStep("summary")}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                まとめへ
              </button>
            </div>
          </section>
        )}

        {currentStep === "summary" && profile && eligibility && (
          <section>
            <h2 className="text-xl font-bold mb-4">申請準備のまとめ</h2>

            {/* 適格性サマリー */}
            <div
              className={`p-4 rounded-lg border mb-4 ${
                eligibility.eligible
                  ? "bg-green-50 border-green-200"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <h3 className="font-medium">適格性</h3>
              <p className="text-sm mt-1">
                スコア: {eligibility.overallScore}/100 -{" "}
                {eligibility.eligible
                  ? "基本要件を満たしています"
                  : "一部要件を満たしていません"}
              </p>
            </div>

            {/* 書類準備状況 */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 mb-4">
              <h3 className="font-medium">書類準備状況</h3>
              <p className="text-sm mt-1">
                {checklist.filter((i) => i.status === "obtained").length} /{" "}
                {checklist.length} 書類が取得済み
              </p>
              {checklist.filter((i) => i.status !== "obtained").length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600">未取得の書類:</p>
                  <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                    {checklist
                      .filter((i) => i.status !== "obtained")
                      .map((item) => (
                        <li key={item.document.id}>
                          - {item.document.name}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 注意事項 */}
            <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
              <h3 className="font-medium">申請時の注意事項</h3>
              <ul className="text-sm mt-2 space-y-1 text-gray-700">
                <li>- 書類は発行日から3ヶ月以内のものを提出してください</li>
                <li>- 外国語書類には日本語訳を添付してください</li>
                <li>- 納税・年金は1日の遅れでも不許可の原因になり得ます</li>
                <li>- 審査期間は約4ヶ月です（状況により変動）</li>
                <li>- 許可時に10,000円の手数料（収入印紙）が必要です</li>
                <li>- 不許可の場合でも現在の在留資格には影響しません</li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setCurrentStep("profile_input")}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                最初からやり直す
              </button>
            </div>
          </section>
        )}
      </main>

      {/* フッター */}
      <footer className="text-center text-xs text-gray-400 mt-8 pb-4">
        <p>
          本アプリは情報提供を目的としたものであり、法的助言を構成するものではありません。
        </p>
        <p className="mt-1">
          最新の要件は出入国在留管理庁の公式サイトで確認してください。
        </p>
      </footer>
    </div>
  );
}
