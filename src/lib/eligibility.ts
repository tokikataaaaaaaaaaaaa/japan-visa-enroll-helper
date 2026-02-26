import type {
  ApplicantProfile,
  EligibilityCheck,
  EligibilityCheckResult,
} from "@/types/visa";

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
  };
}

function checkTrafficViolations(profile: ApplicantProfile): EligibilityCheck {
  const passed = profile.trafficViolations <= 5;
  return {
    id: "traffic_violations",
    name: "交通違反チェック",
    description: "過去5年間の交通違反回数を確認します（目安：5回以下）",
    passed,
    severity: "warning",
    message: passed
      ? `交通違反${profile.trafficViolations}回（基準内）`
      : `交通違反${profile.trafficViolations}回（多すぎます。過去5年で5回程度が目安です）`,
  };
}

function checkAnnualIncome(profile: ApplicantProfile): EligibilityCheck {
  const allAbove300 = profile.annualIncomeHistory.every(
    (income) => income >= 300
  );
  const minIncome = Math.min(...profile.annualIncomeHistory);
  return {
    id: "annual_income",
    name: "年収チェック",
    description: "過去5年間の年収が300万円以上であることを確認します",
    passed: allAbove300,
    severity: "critical",
    message: allAbove300
      ? `過去5年の最低年収: ${minIncome}万円（基準を満たしています）`
      : `年収300万円未満の年があります（最低: ${minIncome}万円）。独立生計要件を満たしていません。`,
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

  let categoryNote = "";
  if (
    profile.currentVisaCategory === "spouse_of_japanese" ||
    profile.currentVisaCategory === "spouse_of_permanent"
  ) {
    categoryNote = "（配偶者特例：3年以上）";
  } else if (profile.currentVisaCategory === "highly_skilled") {
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
  };
}

function checkYearsOnWorkVisa(profile: ApplicantProfile): EligibilityCheck {
  // 配偶者ビザや高度専門職は就労年数要件が異なる
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
  };
}

function checkConsecutiveDaysAbroad(
  profile: ApplicantProfile
): EligibilityCheck {
  const passed = profile.maxConsecutiveDaysAbroad < 90;
  return {
    id: "consecutive_days_abroad",
    name: "連続出国日数チェック",
    description: "過去10年間の最長連続出国日数を確認します（90日未満）",
    passed,
    severity: "critical",
    message: passed
      ? `最長連続出国${profile.maxConsecutiveDaysAbroad}日（基準内）`
      : `最長連続出国${profile.maxConsecutiveDaysAbroad}日（90日以上は在留の継続性が認められない可能性があります）`,
  };
}

function checkYearlyDaysAbroad(profile: ApplicantProfile): EligibilityCheck {
  const passed = profile.totalDaysAbroadLastYear < 100;
  return {
    id: "yearly_days_abroad",
    name: "年間出国日数チェック",
    description: "直近1年間の出国日数合計を確認します（100日未満）",
    passed,
    severity: "warning",
    message: passed
      ? `直近1年の出国${profile.totalDaysAbroadLastYear}日（基準内）`
      : `直近1年の出国${profile.totalDaysAbroadLastYear}日（100日以上は不利になる可能性があります）`,
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
  };
}
