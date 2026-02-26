/**
 * 日本ビザ申請サポートアプリケーションの型定義
 * Spec-Driven Development: 型がアプリケーションの仕様を定義する
 */

/** 在留資格の種類 */
export type VisaCategory =
  | "work" // 就労ビザ（技術・人文知識・国際業務等）
  | "spouse_of_japanese" // 日本人の配偶者等
  | "spouse_of_permanent" // 永住者の配偶者等
  | "long_term_resident" // 定住者
  | "highly_skilled" // 高度専門職
  | "dependent"; // 家族滞在

/** 高度専門職のポイント区分 */
export type HighlySkilledPointLevel = "70_points" | "80_points";

/** 申請者の職業種別 */
export type OccupationType =
  | "employee" // 会社員
  | "self_employed" // 自営業
  | "business_owner" // 経営者
  | "other"; // その他

/** 書類のカテゴリ */
export type DocumentCategory =
  | "basic" // 基本書類
  | "tax" // 納税関連
  | "pension_insurance" // 年金・保険
  | "employment" // 職業証明
  | "identity" // 身分関係
  | "guarantor" // 身元保証人
  | "asset" // 資産証明
  | "other"; // その他

/** 個別の必要書類 */
export interface RequiredDocument {
  id: string;
  name: string;
  nameEn: string;
  category: DocumentCategory;
  description: string;
  required: boolean;
  /** この書類が必要になる条件 */
  applicableWhen?: DocumentCondition;
  /** 取得先の案内 */
  obtainFrom?: string;
  /** 注意事項 */
  notes?: string[];
  /** 必要な期間（年数） */
  yearsRequired?: number;
  /** 根拠となる情報源URL */
  sourceUrl?: string;
  /** 情報源の名称 */
  sourceName?: string;
}

/** 書類が必要になる条件 */
export interface DocumentCondition {
  visaCategories?: VisaCategory[];
  occupationTypes?: OccupationType[];
  highlySkilledPointLevel?: HighlySkilledPointLevel;
}

/** 申請者のプロフィール */
export interface ApplicantProfile {
  currentVisaCategory: VisaCategory;
  occupationType: OccupationType;
  yearsInJapan: number;
  yearsOnWorkVisa: number;
  annualIncomeHistory: number[]; // 過去5年分の年収（万円）
  hasSpouseInJapan: boolean;
  numberOfDependents: number;
  highlySkilledPoints?: number;
  /** 過去5年の交通違反回数 */
  trafficViolations: number;
  /** 過去10年の最長連続出国日数 */
  maxConsecutiveDaysAbroad: number;
  /** 直近1年の出国日数合計 */
  totalDaysAbroadLastYear: number;
  /** 現在の在留期間（年） */
  currentVisaPeriod: number;
  /** 犯罪歴の有無 */
  hasCriminalRecord: boolean;
}

/** 適格性チェック結果 */
export interface EligibilityCheckResult {
  eligible: boolean;
  checks: EligibilityCheck[];
  overallScore: number; // 0-100
}

/** 個別の適格性チェック項目 */
export interface EligibilityCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  message: string;
  /** 根拠となる情報源URL */
  sourceUrl?: string;
  /** 情報源の名称 */
  sourceName?: string;
}

/** 書類チェックリスト項目 */
export interface ChecklistItem {
  document: RequiredDocument;
  status: "not_started" | "preparing" | "obtained" | "not_applicable";
  notes?: string;
}

/** 書類レビュー結果 */
export interface DocumentReviewResult {
  documentName: string;
  issues: DocumentIssue[];
  suggestions: string[];
  overallStatus: "good" | "needs_revision" | "major_issues";
}

/** 書類の問題点 */
export interface DocumentIssue {
  severity: "error" | "warning" | "suggestion";
  field?: string;
  message: string;
  howToFix: string;
}

/** アプリケーションの状態 */
export interface ApplicationState {
  profile: ApplicantProfile | null;
  eligibility: EligibilityCheckResult | null;
  checklist: ChecklistItem[];
  currentStep: ApplicationStep;
}

/** アプリケーションのステップ */
export type ApplicationStep =
  | "profile_input" // プロフィール入力
  | "eligibility_check" // 適格性チェック
  | "document_checklist" // 書類チェックリスト
  | "document_review" // 書類添削
  | "summary"; // まとめ
