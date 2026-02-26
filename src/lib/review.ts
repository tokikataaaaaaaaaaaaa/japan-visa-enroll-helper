import type {
  ApplicantProfile,
  DocumentIssue,
  DocumentReviewResult,
} from "@/types/visa";

/** 申請書フォームデータ */
export interface ApplicationFormData {
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  currentVisa: string;
  visaPeriod: string;
  purpose: string;
}

/** 必須フィールドの定義 */
const REQUIRED_FIELDS: {
  key: keyof ApplicationFormData;
  label: string;
}[] = [
  { key: "fullName", label: "氏名" },
  { key: "nationality", label: "国籍" },
  { key: "dateOfBirth", label: "生年月日" },
  { key: "address", label: "住所" },
  { key: "currentVisa", label: "在留資格" },
  { key: "purpose", label: "申請目的" },
];

/** 日本の電話番号パターン */
const JAPAN_PHONE_PATTERN = /^0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{3,4}$/;

/**
 * 申請書フォームをレビューする
 */
export function reviewApplicationForm(
  formData: ApplicationFormData
): DocumentReviewResult {
  const issues: DocumentIssue[] = [];
  const suggestions: string[] = [];

  // 必須フィールドのチェック
  for (const field of REQUIRED_FIELDS) {
    if (!formData[field.key] || formData[field.key].trim() === "") {
      issues.push({
        severity: "error",
        field: field.key,
        message: `${field.label}が入力されていません`,
        howToFix: `${field.label}を正確に入力してください`,
      });
    }
  }

  // 電話番号の形式チェック
  if (formData.phone && !JAPAN_PHONE_PATTERN.test(formData.phone)) {
    issues.push({
      severity: "warning",
      field: "phone",
      message: "電話番号の形式が正しくない可能性があります",
      howToFix:
        "日本の電話番号形式（例: 090-1234-5678）で入力してください",
    });
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  let overallStatus: DocumentReviewResult["overallStatus"];
  if (errorCount > 0) {
    overallStatus = "major_issues";
  } else if (issues.length > 0) {
    overallStatus = "needs_revision";
  } else {
    overallStatus = "good";
  }

  return {
    documentName: "永住許可申請書",
    issues,
    suggestions,
    overallStatus,
  };
}

/**
 * 理由書をレビューする
 */
export function reviewReasonStatement(
  statement: string,
  profile: ApplicantProfile
): DocumentReviewResult {
  const issues: DocumentIssue[] = [];
  const suggestions: string[] = [];

  // 空チェック
  if (!statement || statement.trim() === "") {
    issues.push({
      severity: "error",
      field: "statement",
      message: "理由書が入力されていません",
      howToFix: "永住を希望する理由を記述してください",
    });
    return {
      documentName: "理由書",
      issues,
      suggestions,
      overallStatus: "major_issues",
    };
  }

  const trimmed = statement.trim();

  // 長さチェック
  if (trimmed.length < 100) {
    issues.push({
      severity: "warning",
      field: "statement",
      message: "理由書の長さが不十分です。より具体的な内容を記載してください。",
      howToFix:
        "来日の経緯、日本での生活状況、今後の計画などを詳しく記述し、少なくとも200文字以上にしてください",
    });
  }

  // 来日時期・在留年数への言及チェック
  const mentionsArrival =
    /来日|渡日|入国|年前|年間.*日本|日本.*年/.test(trimmed);
  if (!mentionsArrival) {
    suggestions.push(
      "来日時期や在留年数について具体的に記載することをお勧めします（例：「2014年に来日し、12年間日本で生活しております」）"
    );
  }

  // 職業への言及チェック
  const mentionsWork =
    /勤務|就労|仕事|会社|職|エンジニア|営業|経営/.test(trimmed);
  if (!mentionsWork) {
    suggestions.push(
      "現在の職業や勤務先について記載することをお勧めします"
    );
  }

  // 納税への言及チェック
  const mentionsTax = /税|納付|年金|保険/.test(trimmed);
  if (!mentionsTax) {
    suggestions.push(
      "税金や年金の納付状況について言及することをお勧めします"
    );
  }

  // 日本での生活基盤への言及チェック
  const mentionsLife =
    /家族|配偶者|妻|夫|子供|地域|コミュニティ|生活基盤/.test(trimmed);
  if (!mentionsLife) {
    suggestions.push(
      "家族構成や日本での生活基盤について記載することをお勧めします"
    );
  }

  // 将来の計画への言及チェック
  const mentionsFuture = /今後|将来|長期|貢献|予定|計画/.test(trimmed);
  if (!mentionsFuture) {
    suggestions.push(
      "今後の日本での生活予定や社会への貢献について記載することをお勧めします"
    );
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let overallStatus: DocumentReviewResult["overallStatus"];
  if (errorCount > 0) {
    overallStatus = "major_issues";
  } else if (warningCount > 0 || suggestions.length > 3) {
    overallStatus = "needs_revision";
  } else {
    overallStatus = "good";
  }

  return {
    documentName: "理由書",
    issues,
    suggestions,
    overallStatus,
  };
}
