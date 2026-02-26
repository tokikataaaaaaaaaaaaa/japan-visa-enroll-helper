import type {
  ApplicantProfile,
  EligibilityCheck,
  EligibilityCheckResult,
} from "@/types/visa";

/** 出入国在留管理庁の永住許可ガイドライン */
const GUIDELINE_URL =
  "https://www.moj.go.jp/isa/publications/materials/nyukan_nyukan50.html";
/** 永住許可申請の手続ページ */
const PROCEDURE_URL =
  "https://www.moj.go.jp/isa/applications/procedures/16-4.html";
/** 高度専門職ポイント制度 */
const HSP_URL =
  "https://www.moj.go.jp/isa/publications/materials/newimmiact_3_evaluate_index.html";

/**
 * 永住許可申請の適格性をチェックする
 */
export function checkEligibility(
  profile: ApplicantProfile
): EligibilityCheckResult {
  const checks: EligibilityCheck[] = [
    checkCriminalRecord(profile),
    checkTrafficViolations(profile),
    checkAnnualIncome(profile),
    checkYearsInJapan(profile),
    checkYearsOnWorkVisa(profile),
    checkConsecutiveDaysAbroad(profile),
    checkYearlyDaysAbroad(profile),
    checkVisaPeriod(profile),
  ];

  const criticalFailed = checks.some(
    (c) => !c.passed && c.severity === "critical"
  );
  const totalChecks = checks.length;
  const passedChecks = checks.filter((c) => c.passed).length;
  const overallScore = Math.round((passedChecks / totalChecks) * 100);

  return {
    eligible: !criticalFailed && passedChecks === totalChecks,
    checks,
    overallScore,
  };
}

function checkCriminalRecord(profile: ApplicantProfile): EligibilityCheck {
  const passed = !profile.hasCriminalRecord;
  return {
    id: "criminal_record",
    name: "犯罪歴チェック",
    description: "犯罪歴（懲役・禁固・罰金）の有無を確認します",
    passed,
    severity: "critical",
    message: passed
      ? "犯罪歴なし"
      : "犯罪歴があります。永住許可が認められない可能性が高いです。",
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（素行善良要件）",
  };
}

function checkTrafficViolations(profile: ApplicantProfile): EligibilityCheck {
  const passed = profile.trafficViolations <= 5;
  return {
    id: "traffic_violations",
    name: "交通違反チェック",
    description:
      "ガイドラインでは「素行が善良であること」が要件です。交通違反の具体的な回数基準は公式には定められていません。",
    passed,
    severity: "warning",
    message: passed
      ? `交通違反${profile.trafficViolations}回（※5回以下は実務上の目安であり、公式基準ではありません）`
      : `交通違反${profile.trafficViolations}回（多い場合、素行善良要件に影響する可能性があります。※5回以下は実務上の目安であり、公式基準ではありません）`,
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（素行善良要件）",
  };
}

function checkAnnualIncome(profile: ApplicantProfile): EligibilityCheck {
  const incomeYears = profile.annualIncomeHistory.length;
  const minIncome = incomeYears > 0 ? Math.min(...profile.annualIncomeHistory) : 0;
  const avgIncome =
    incomeYears > 0
      ? Math.round(
          profile.annualIncomeHistory.reduce((a, b) => a + b, 0) / incomeYears
        )
      : 0;

  // 公式ガイドラインには具体的な金額基準は定められていないため、
  // 合否判定は行わず参考情報として表示する
  return {
    id: "annual_income",
    name: "年収（参考情報）",
    description:
      "ガイドラインでは「独立の生計を営むに足りる資産又は技能を有すること」と規定されています。具体的な金額基準は公式には定められていません。",
    passed: true,
    severity: "info",
    message: `過去${incomeYears}年の年収: 最低${minIncome}万円 / 平均${avgIncome}万円。公式要件は「日常生活において公共の負担にならず、安定した生活が見込まれること」です（具体的な金額基準はありません）。`,
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（独立生計要件）",
  };
}

function getRequiredYearsInJapan(profile: ApplicantProfile): number {
  if (
    profile.currentVisaCategory === "spouse_of_japanese" ||
    profile.currentVisaCategory === "spouse_of_permanent"
  ) {
    return 3;
  }

  if (profile.currentVisaCategory === "highly_skilled") {
    if (profile.highlySkilledPoints && profile.highlySkilledPoints >= 80) {
      return 1;
    }
    if (profile.highlySkilledPoints && profile.highlySkilledPoints >= 70) {
      return 3;
    }
  }

  return 10;
}

function checkYearsInJapan(profile: ApplicantProfile): EligibilityCheck {
  const requiredYears = getRequiredYearsInJapan(profile);
  const passed = profile.yearsInJapan >= requiredYears;
  const isHS = profile.currentVisaCategory === "highly_skilled";

  let categoryNote = "";
  if (
    profile.currentVisaCategory === "spouse_of_japanese" ||
    profile.currentVisaCategory === "spouse_of_permanent"
  ) {
    categoryNote = "（配偶者特例：3年以上）";
  } else if (isHS) {
    categoryNote = `（高度専門職特例：${requiredYears}年以上）`;
  }

  return {
    id: "years_in_japan",
    name: "在留年数チェック",
    description: `日本での継続在留年数を確認します${categoryNote}`,
    passed,
    severity: "critical",
    message: passed
      ? `在留${profile.yearsInJapan}年（必要: ${requiredYears}年以上）`
      : `在留${profile.yearsInJapan}年（必要: ${requiredYears}年以上。あと${requiredYears - profile.yearsInJapan}年必要です）`,
    sourceUrl: isHS ? HSP_URL : GUIDELINE_URL,
    sourceName: isHS
      ? "高度人材ポイント制による出入国在留管理上の優遇制度"
      : "永住許可に関するガイドライン（国益適合要件）",
  };
}

function checkYearsOnWorkVisa(profile: ApplicantProfile): EligibilityCheck {
  const isExempt =
    profile.currentVisaCategory === "spouse_of_japanese" ||
    profile.currentVisaCategory === "spouse_of_permanent" ||
    profile.currentVisaCategory === "highly_skilled";

  if (isExempt) {
    return {
      id: "years_on_work_visa",
      name: "就労年数チェック",
      description: "就労ビザでの在留年数を確認します",
      passed: true,
      severity: "critical",
      message: "現在のビザカテゴリでは就労年数要件は適用されません",
      sourceUrl: GUIDELINE_URL,
      sourceName: "永住許可に関するガイドライン（原則10年在留の特例）",
    };
  }

  const passed = profile.yearsOnWorkVisa >= 5;
  return {
    id: "years_on_work_visa",
    name: "就労年数チェック",
    description: "就労ビザでの在留年数を確認します（5年以上必要）",
    passed,
    severity: "critical",
    message: passed
      ? `就労ビザでの在留${profile.yearsOnWorkVisa}年（基準を満たしています）`
      : `就労ビザでの在留${profile.yearsOnWorkVisa}年（5年以上必要です）`,
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（国益適合要件）",
  };
}

function checkConsecutiveDaysAbroad(
  profile: ApplicantProfile
): EligibilityCheck {
  const passed = profile.maxConsecutiveDaysAbroad < 90;
  return {
    id: "consecutive_days_abroad",
    name: "連続出国日数チェック",
    description:
      "ガイドラインでは「引き続き10年以上本邦に在留していること」が要件です。具体的な出国日数の基準は公式には定められていません。",
    passed,
    severity: "warning",
    message: passed
      ? `最長連続出国${profile.maxConsecutiveDaysAbroad}日（※90日未満は実務上の目安であり、公式基準ではありません）`
      : `最長連続出国${profile.maxConsecutiveDaysAbroad}日（長期出国は「引き続き在留」の要件に影響する可能性があります。※90日は実務上の目安であり、公式基準ではありません）`,
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（国益適合要件・継続在留）",
  };
}

function checkYearlyDaysAbroad(profile: ApplicantProfile): EligibilityCheck {
  const passed = profile.totalDaysAbroadLastYear < 100;
  return {
    id: "yearly_days_abroad",
    name: "年間出国日数チェック",
    description:
      "年間の出国日数が多い場合、「引き続き在留」の要件に影響する可能性があります。具体的な日数基準は公式には定められていません。",
    passed,
    severity: "warning",
    message: passed
      ? `直近1年の出国${profile.totalDaysAbroadLastYear}日（※100日未満は実務上の目安であり、公式基準ではありません）`
      : `直近1年の出国${profile.totalDaysAbroadLastYear}日（出国日数が多い場合、不利になる可能性があります。※100日は実務上の目安であり、公式基準ではありません）`,
    sourceUrl: GUIDELINE_URL,
    sourceName: "永住許可に関するガイドライン（国益適合要件・継続在留）",
  };
}

function checkVisaPeriod(profile: ApplicantProfile): EligibilityCheck {
  const passed = profile.currentVisaPeriod >= 3;
  return {
    id: "visa_period",
    name: "在留期間チェック",
    description: "現在の在留期間が最長（3年以上）であることを確認します",
    passed,
    severity: "critical",
    message: passed
      ? `現在の在留期間: ${profile.currentVisaPeriod}年（基準を満たしています）`
      : `現在の在留期間: ${profile.currentVisaPeriod}年（3年以上の在留期間が必要です）`,
    sourceUrl: PROCEDURE_URL,
    sourceName: "永住許可申請の手続（出入国在留管理庁）",
  };
}
