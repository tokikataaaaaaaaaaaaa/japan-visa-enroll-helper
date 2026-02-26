"use client";

import { useState } from "react";
import type { ApplicantProfile, VisaCategory, OccupationType } from "@/types/visa";

const VISA_OPTIONS: { value: VisaCategory; label: string }[] = [
  { value: "work", label: "就労ビザ（技術・人文知識・国際業務等）" },
  { value: "highly_skilled", label: "高度専門職" },
  { value: "spouse_of_japanese", label: "日本人の配偶者等" },
  { value: "spouse_of_permanent", label: "永住者の配偶者等" },
  { value: "long_term_resident", label: "定住者" },
  { value: "dependent", label: "家族滞在" },
];

const OCCUPATION_OPTIONS: { value: OccupationType; label: string }[] = [
  { value: "employee", label: "会社員" },
  { value: "self_employed", label: "自営業" },
  { value: "business_owner", label: "経営者" },
  { value: "other", label: "その他" },
];

interface ProfileFormProps {
  onSubmit: (profile: ApplicantProfile) => void;
}

/**
 * 数値入力用のカスタムフック
 * 文字列状態を保持し、空欄での直接入力を可能にする
 */
function useNumberInput(initial: number) {
  const [raw, setRaw] = useState(String(initial));
  const value = raw === "" ? 0 : Number(raw);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaw(e.target.value);
  };
  return { raw, value, onChange };
}

export function ProfileForm({ onSubmit }: ProfileFormProps) {
  const [visaCategory, setVisaCategory] = useState<VisaCategory>("work");
  const [occupationType, setOccupationType] = useState<OccupationType>("employee");
  const yearsInJapan = useNumberInput(10);
  const yearsOnWorkVisa = useNumberInput(5);
  const income1 = useNumberInput(400);
  const income2 = useNumberInput(400);
  const income3 = useNumberInput(400);
  const income4 = useNumberInput(400);
  const income5 = useNumberInput(400);
  const [hasSpouse, setHasSpouse] = useState(false);
  const dependents = useNumberInput(0);
  const hsPoints = useNumberInput(0);
  const violations = useNumberInput(0);
  const maxDaysAbroad = useNumberInput(0);
  const yearlyDaysAbroad = useNumberInput(0);
  const visaPeriod = useNumberInput(3);
  const [hasCriminal, setHasCriminal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: ApplicantProfile = {
      currentVisaCategory: visaCategory,
      occupationType,
      yearsInJapan: yearsInJapan.value,
      yearsOnWorkVisa: yearsOnWorkVisa.value,
      annualIncomeHistory: [
        income1.value,
        income2.value,
        income3.value,
        income4.value,
        income5.value,
      ],
      hasSpouseInJapan: hasSpouse,
      numberOfDependents: dependents.value,
      highlySkilledPoints: hsPoints.value || undefined,
      trafficViolations: violations.value,
      maxConsecutiveDaysAbroad: maxDaysAbroad.value,
      totalDaysAbroadLastYear: yearlyDaysAbroad.value,
      currentVisaPeriod: visaPeriod.value,
      hasCriminalRecord: hasCriminal,
    };
    onSubmit(profile);
  };

  const inputClass =
    "w-full border rounded-md px-3 py-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ビザカテゴリ */}
        <div>
          <label htmlFor="visaCategory" className="block text-sm font-medium mb-1">
            現在のビザカテゴリ
          </label>
          <select
            id="visaCategory"
            value={visaCategory}
            onChange={(e) => setVisaCategory(e.target.value as VisaCategory)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          >
            {VISA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 職業 */}
        <div>
          <label htmlFor="occupationType" className="block text-sm font-medium mb-1">
            職業
          </label>
          <select
            id="occupationType"
            value={occupationType}
            onChange={(e) => setOccupationType(e.target.value as OccupationType)}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          >
            {OCCUPATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 在留年数 */}
        <div>
          <label htmlFor="yearsInJapan" className="block text-sm font-medium mb-1">
            在留年数
          </label>
          <input
            id="yearsInJapan"
            type="number"
            inputMode="numeric"
            min={0}
            value={yearsInJapan.raw}
            onChange={yearsInJapan.onChange}
            placeholder="例: 10"
            className={inputClass}
          />
        </div>

        {/* 就労年数 */}
        <div>
          <label htmlFor="yearsOnWorkVisa" className="block text-sm font-medium mb-1">
            就労年数
          </label>
          <input
            id="yearsOnWorkVisa"
            type="number"
            inputMode="numeric"
            min={0}
            value={yearsOnWorkVisa.raw}
            onChange={yearsOnWorkVisa.onChange}
            placeholder="例: 5"
            className={inputClass}
          />
        </div>

        {/* 在留期間 */}
        <div>
          <label htmlFor="visaPeriod" className="block text-sm font-medium mb-1">
            現在の在留期間（年）
          </label>
          <input
            id="visaPeriod"
            type="number"
            inputMode="numeric"
            min={1}
            max={5}
            value={visaPeriod.raw}
            onChange={visaPeriod.onChange}
            placeholder="例: 3"
            className={inputClass}
          />
        </div>

        {/* 交通違反回数 */}
        <div>
          <label htmlFor="violations" className="block text-sm font-medium mb-1">
            過去5年の交通違反回数
          </label>
          <input
            id="violations"
            type="number"
            inputMode="numeric"
            min={0}
            value={violations.raw}
            onChange={violations.onChange}
            placeholder="例: 0"
            className={inputClass}
          />
        </div>

        {/* 連続出国日数 */}
        <div>
          <label htmlFor="maxDaysAbroad" className="block text-sm font-medium mb-1">
            最長連続出国日数
          </label>
          <input
            id="maxDaysAbroad"
            type="number"
            inputMode="numeric"
            min={0}
            value={maxDaysAbroad.raw}
            onChange={maxDaysAbroad.onChange}
            placeholder="例: 30"
            className={inputClass}
          />
        </div>

        {/* 年間出国日数 */}
        <div>
          <label htmlFor="yearlyDaysAbroad" className="block text-sm font-medium mb-1">
            直近1年の出国日数合計
          </label>
          <input
            id="yearlyDaysAbroad"
            type="number"
            inputMode="numeric"
            min={0}
            value={yearlyDaysAbroad.raw}
            onChange={yearlyDaysAbroad.onChange}
            placeholder="例: 60"
            className={inputClass}
          />
        </div>

        {/* 扶養人数 */}
        <div>
          <label htmlFor="dependents" className="block text-sm font-medium mb-1">
            扶養家族の人数
          </label>
          <input
            id="dependents"
            type="number"
            inputMode="numeric"
            min={0}
            value={dependents.raw}
            onChange={dependents.onChange}
            placeholder="例: 0"
            className={inputClass}
          />
        </div>

        {/* 高度専門職ポイント */}
        {visaCategory === "highly_skilled" && (
          <div>
            <label htmlFor="hsPoints" className="block text-sm font-medium mb-1">
              高度専門職ポイント
            </label>
            <input
              id="hsPoints"
              type="number"
              inputMode="numeric"
              min={0}
              value={hsPoints.raw}
              onChange={hsPoints.onChange}
              placeholder="例: 80"
              className={inputClass}
            />
          </div>
        )}
      </div>

      {/* 年収入力 */}
      <div>
        <p className="text-sm font-medium mb-2">過去5年間の年収（万円）</p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "5年前", field: income1 },
            { label: "4年前", field: income2 },
            { label: "3年前", field: income3 },
            { label: "2年前", field: income4 },
            { label: "1年前", field: income5 },
          ].map(({ label, field }) => (
            <div key={label}>
              <label className="block text-xs text-gray-500 mb-1">{label}</label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={field.raw}
                onChange={field.onChange}
                placeholder="万円"
                className="w-full border rounded-md px-2 py-1 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* チェックボックス */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasSpouse}
            onChange={(e) => setHasSpouse(e.target.checked)}
          />
          日本に配偶者がいる
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hasCriminal}
            onChange={(e) => setHasCriminal(e.target.checked)}
          />
          犯罪歴がある
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        適格性をチェックする
      </button>
    </form>
  );
}
