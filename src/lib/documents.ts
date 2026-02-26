import type {
  ApplicantProfile,
  ChecklistItem,
  DocumentCategory,
  RequiredDocument,
  VisaCategory,
} from "@/types/visa";

/** 出入国在留管理庁：永住許可申請の必要書類一覧 */
const DOC_SOURCE_URL =
  "https://www.moj.go.jp/isa/applications/procedures/zairyu_eijyu.html";
/** 出入国在留管理庁：永住許可申請の手続 */
const PROCEDURE_SOURCE_URL =
  "https://www.moj.go.jp/isa/applications/procedures/16-4.html";
/** 高度専門職ポイント計算 */
const HSP_SOURCE_URL =
  "https://www.moj.go.jp/isa/publications/materials/newimmiact_3_evaluate_index.html";

/** 全書類マスターデータ */
export const ALL_DOCUMENTS: RequiredDocument[] = [
  // === 基本書類 ===
  {
    id: "application_form",
    name: "永住許可申請書",
    nameEn: "Application for Permanent Residence",
    category: "basic",
    description: "出入国在留管理庁ウェブサイトからダウンロード",
    required: true,
    obtainFrom: "出入国在留管理庁ウェブサイト",
    notes: ["正確に記入し、誤字脱字がないことを確認"],
    sourceUrl: PROCEDURE_SOURCE_URL,
    sourceName: "永住許可申請の手続（出入国在留管理庁）",
  },
  {
    id: "photo",
    name: "写真（縦4cm×横3cm）",
    nameEn: "Photo (4cm x 3cm)",
    category: "basic",
    description: "6ヶ月以内に撮影、16歳未満は不要",
    required: true,
    notes: [
      "無背景・無帽・正面向き",
      "6ヶ月以内に撮影されたもの",
      "16歳未満は不要",
    ],
  },
  {
    id: "passport",
    name: "パスポート",
    nameEn: "Passport",
    category: "basic",
    description: "提示のみ（6ヶ月以上の有効期限が望ましい）",
    required: true,
    notes: ["原本を提示", "有効期限に余裕があること"],
  },
  {
    id: "residence_card",
    name: "在留カード",
    nameEn: "Residence Card",
    category: "basic",
    description: "提示のみ（最新情報に更新されていること）",
    required: true,
    notes: ["住所等が最新であること"],
  },
  {
    id: "resident_certificate",
    name: "住民票（世帯全員記載）",
    nameEn: "Certificate of Residence (all household members)",
    category: "basic",
    description: "個人番号（マイナンバー）記載なし、原本1通",
    required: true,
    obtainFrom: "市区町村役場",
    notes: ["世帯全員記載のもの", "個人番号の記載がないもの"],
  },
  {
    id: "reason_statement",
    name: "理由書",
    nameEn: "Reason Statement",
    category: "basic",
    description: "永住を希望する理由を記載した書面",
    required: true,
    notes: [
      "来日時期・在留年数を記載",
      "日本での生活基盤について具体的に記載",
      "今後の日本での生活予定を記載",
    ],
  },

  // === 納税関連 ===
  {
    id: "resident_tax_certificate",
    name: "住民税の課税証明書・納税証明書",
    nameEn: "Resident Tax Certificate / Tax Payment Certificate",
    category: "tax",
    description: "住民税の課税額と納税状況を証明する書類",
    required: true,
    obtainFrom: "市区町村役場",
    yearsRequired: 5, // デフォルト、カテゴリにより変動
    notes: [
      "納期限内に納付していることが重要",
      "給与天引きでない場合は納付書の控えも準備",
    ],
  },
  {
    id: "national_tax_certificate",
    name: "国税の納税証明書（その3）",
    nameEn: "National Tax Payment Certificate (No. 3)",
    category: "tax",
    description: "所得税、消費税等の未納がないことの証明",
    required: true,
    obtainFrom: "税務署またはオンライン（e-Tax）",
    notes: ["未納税額がないことを確認してから取得"],
  },

  // === 年金・保険 ===
  {
    id: "pension_record",
    name: "年金納付記録（ねんきん定期便等）",
    nameEn: "Pension Payment Record",
    category: "pension_insurance",
    description: "直近2年分の年金納付状況を示す書類",
    required: true,
    obtainFrom: "日本年金機構（ねんきんネット）",
    yearsRequired: 2,
    notes: [
      "ねんきん定期便または「ねんきんネット」の画面印刷",
      "納期限内に納付していることが重要",
    ],
  },
  {
    id: "health_insurance_certificate",
    name: "健康保険証コピー・納付状況証明",
    nameEn: "Health Insurance Certificate / Payment Record",
    category: "pension_insurance",
    description: "直近2年分の健康保険の加入・納付状況",
    required: true,
    yearsRequired: 2,
    notes: ["国民健康保険の場合は納付証明書も必要"],
  },

  // === 職業証明 ===
  {
    id: "employment_certificate",
    name: "在職証明書",
    nameEn: "Certificate of Employment",
    category: "employment",
    description: "現在の雇用状況を証明する書類",
    required: true,
    applicableWhen: { occupationTypes: ["employee"] },
    obtainFrom: "勤務先",
    notes: ["会社名、職種、在職期間、年収が記載されたもの"],
  },
  {
    id: "tax_return",
    name: "確定申告書控え",
    nameEn: "Tax Return Copy",
    category: "employment",
    description: "自営業の所得を証明する書類",
    required: true,
    applicableWhen: { occupationTypes: ["self_employed"] },
    obtainFrom: "税務署（受領印付き）または e-Tax 受信通知",
    notes: ["過去3年分が望ましい"],
  },
  {
    id: "company_registration",
    name: "登記事項証明書（法人）",
    nameEn: "Company Registration Certificate",
    category: "employment",
    description: "経営する法人の登記情報",
    required: true,
    applicableWhen: { occupationTypes: ["business_owner"] },
    obtainFrom: "法務局",
  },

  // === 身分関係 ===
  {
    id: "family_register",
    name: "戸籍謄本（配偶者の）",
    nameEn: "Family Register (of spouse)",
    category: "identity",
    description: "日本人配偶者の戸籍謄本",
    required: true,
    applicableWhen: { visaCategories: ["spouse_of_japanese"] },
    obtainFrom: "配偶者の本籍地の市区町村役場",
  },
  {
    id: "marriage_certificate",
    name: "婚姻証明書",
    nameEn: "Marriage Certificate",
    category: "identity",
    description: "永住者配偶者の場合に必要",
    required: true,
    applicableWhen: { visaCategories: ["spouse_of_permanent"] },
    notes: ["外国語の場合は日本語訳を添付"],
  },

  // === 身元保証人関連 ===
  {
    id: "guarantor_letter",
    name: "身元保証書",
    nameEn: "Letter of Guarantee",
    category: "guarantor",
    description: "身元保証人による保証書（原本）",
    required: true,
    notes: [
      "身元保証人は日本人または永住者",
      "署名は必ず自筆",
      "身元保証は道義的責任であり法的強制力はない",
    ],
  },
  {
    id: "guarantor_id",
    name: "身元保証人の身分証明書コピー",
    nameEn: "Guarantor's ID Copy",
    category: "guarantor",
    description: "運転免許証等のコピー",
    required: true,
  },
  {
    id: "guarantor_tax_certificate",
    name: "身元保証人の納税証明書",
    nameEn: "Guarantor's Tax Certificate",
    category: "guarantor",
    description: "身元保証人の収入を証明する書類",
    required: true,
    notes: ["年収300万円以上が望ましい"],
  },

  // === 資産証明 ===
  {
    id: "bank_statement",
    name: "預貯金通帳コピー",
    nameEn: "Bank Statement Copy",
    category: "asset",
    description: "資産状況を示す書類",
    required: true,
    notes: [
      "Web通帳の画面印刷可",
      "不自然な大口入金は逆効果になる場合あり",
    ],
  },

  // === 高度専門職 ===
  {
    id: "points_calculation_sheet",
    name: "高度専門職ポイント計算表",
    nameEn: "Highly Skilled Professional Points Calculation Sheet",
    category: "other",
    description: "高度専門職のポイント計算結果を示す書類",
    required: true,
    applicableWhen: { visaCategories: ["highly_skilled"] },
    obtainFrom: "出入国在留管理庁ウェブサイト",
    notes: ["各ポイントの根拠書類も添付が必要"],
  },

  // === その他 ===
  {
    id: "self_check_sheet",
    name: "セルフチェックシート",
    nameEn: "Self Check Sheet",
    category: "other",
    description: "申請時に提出するセルフチェックシート",
    required: true,
    obtainFrom: "出入国在留管理庁ウェブサイト",
  },
  {
    id: "understanding_letter",
    name: "了解書",
    nameEn: "Letter of Understanding",
    category: "other",
    description: "申請に関する了解事項を確認する書類",
    required: true,
  },
];

/**
 * 書類カテゴリの表示順序
 */
const CATEGORY_ORDER: DocumentCategory[] = [
  "basic",
  "tax",
  "pension_insurance",
  "employment",
  "identity",
  "guarantor",
  "asset",
  "other",
];

/**
 * 申請者のプロフィールに基づいて必要書類を取得する
 */
export function getRequiredDocuments(
  profile: ApplicantProfile
): RequiredDocument[] {
  const taxYears = getTaxYearsRequired(profile);

  return ALL_DOCUMENTS.filter((doc) => isDocumentApplicable(doc, profile)).map(
    (doc) => {
      // 納税証明書の年数をプロフィールに応じて調整
      if (doc.id === "resident_tax_certificate") {
        return { ...doc, yearsRequired: taxYears };
      }
      return doc;
    }
  );
}

/**
 * 書類が申請者に適用されるか判定する
 */
function isDocumentApplicable(
  doc: RequiredDocument,
  profile: ApplicantProfile
): boolean {
  if (!doc.applicableWhen) {
    return true;
  }

  const { visaCategories, occupationTypes } = doc.applicableWhen;

  if (visaCategories && !visaCategories.includes(profile.currentVisaCategory)) {
    return false;
  }

  if (occupationTypes && !occupationTypes.includes(profile.occupationType)) {
    return false;
  }

  return true;
}

/**
 * ビザカテゴリと高度専門職ポイントに応じた納税証明書の必要年数を返す
 */
function getTaxYearsRequired(profile: ApplicantProfile): number {
  if (profile.currentVisaCategory === "highly_skilled") {
    if (profile.highlySkilledPoints && profile.highlySkilledPoints >= 80) {
      return 1;
    }
    return 3;
  }

  if (
    profile.currentVisaCategory === "spouse_of_japanese" ||
    profile.currentVisaCategory === "spouse_of_permanent"
  ) {
    return 3;
  }

  // 就労ビザ、定住者、家族滞在など
  return 5;
}

/**
 * プロフィールに基づくチェックリストを生成する
 */
export function generateChecklist(
  profile: ApplicantProfile
): ChecklistItem[] {
  const documents = getRequiredDocuments(profile);

  // カテゴリ順にソート
  const sorted = [...documents].sort((a, b) => {
    return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  });

  return sorted.map((doc) => ({
    document: doc,
    status: "not_started",
  }));
}
