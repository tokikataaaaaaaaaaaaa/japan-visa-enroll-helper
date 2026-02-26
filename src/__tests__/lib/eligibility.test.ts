import { describe, it, expect } from "vitest";
import { checkEligibility } from "@/lib/eligibility";
import type { ApplicantProfile } from "@/types/visa";

/** 基本的な適格プロフィール（就労ビザ） */
const validWorkVisaProfile: ApplicantProfile = {
  currentVisaCategory: "work",
  occupationType: "employee",
  yearsInJapan: 12,
  yearsOnWorkVisa: 7,
  annualIncomeHistory: [400, 420, 450, 480, 500], // 5年分（万円）
  hasSpouseInJapan: true,
  numberOfDependents: 1,
  trafficViolations: 0,
  maxConsecutiveDaysAbroad: 30,
  totalDaysAbroadLastYear: 60,
  currentVisaPeriod: 5,
  hasCriminalRecord: false,
};

describe("checkEligibility - 永住許可申請の適格性チェック", () => {
  describe("素行要件", () => {
    it("犯罪歴がない場合、素行チェックを通過する", () => {
      const result = checkEligibility(validWorkVisaProfile);
      const conductCheck = result.checks.find(
        (c) => c.id === "criminal_record"
      );
      expect(conductCheck?.passed).toBe(true);
    });

    it("犯罪歴がある場合、素行チェックに失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        hasCriminalRecord: true,
      };
      const result = checkEligibility(profile);
      const conductCheck = result.checks.find(
        (c) => c.id === "criminal_record"
      );
      expect(conductCheck?.passed).toBe(false);
      expect(conductCheck?.severity).toBe("critical");
    });

    it("交通違反が5回以上の場合、警告を出す", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        trafficViolations: 6,
      };
      const result = checkEligibility(profile);
      const violationCheck = result.checks.find(
        (c) => c.id === "traffic_violations"
      );
      expect(violationCheck?.passed).toBe(false);
      expect(violationCheck?.severity).toBe("warning");
    });

    it("交通違反が4回以下の場合、チェックを通過する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        trafficViolations: 4,
      };
      const result = checkEligibility(profile);
      const violationCheck = result.checks.find(
        (c) => c.id === "traffic_violations"
      );
      expect(violationCheck?.passed).toBe(true);
    });
  });

  describe("独立生計要件", () => {
    it("年収300万円以上が5年続いている場合、通過する", () => {
      const result = checkEligibility(validWorkVisaProfile);
      const incomeCheck = result.checks.find((c) => c.id === "annual_income");
      expect(incomeCheck?.passed).toBe(true);
    });

    it("年収300万円未満の年がある場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        annualIncomeHistory: [250, 300, 350, 400, 450],
      };
      const result = checkEligibility(profile);
      const incomeCheck = result.checks.find((c) => c.id === "annual_income");
      expect(incomeCheck?.passed).toBe(false);
      expect(incomeCheck?.severity).toBe("critical");
    });
  });

  describe("国益要件 - 居住要件", () => {
    it("就労ビザで10年以上在留＋5年以上就労の場合、通過する", () => {
      const result = checkEligibility(validWorkVisaProfile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(true);
    });

    it("就労ビザで在留10年未満の場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        yearsInJapan: 8,
      };
      const result = checkEligibility(profile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(false);
    });

    it("就労期間5年未満の場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        yearsOnWorkVisa: 3,
      };
      const result = checkEligibility(profile);
      const workYearsCheck = result.checks.find(
        (c) => c.id === "years_on_work_visa"
      );
      expect(workYearsCheck?.passed).toBe(false);
    });

    it("高度専門職80点以上は1年以上在留で通過する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        currentVisaCategory: "highly_skilled",
        highlySkilledPoints: 85,
        yearsInJapan: 2,
        yearsOnWorkVisa: 2,
      };
      const result = checkEligibility(profile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(true);
    });

    it("高度専門職70点以上は3年以上在留で通過する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        currentVisaCategory: "highly_skilled",
        highlySkilledPoints: 75,
        yearsInJapan: 4,
        yearsOnWorkVisa: 4,
      };
      const result = checkEligibility(profile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(true);
    });

    it("高度専門職70点以上でも3年未満は失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        currentVisaCategory: "highly_skilled",
        highlySkilledPoints: 75,
        yearsInJapan: 2,
        yearsOnWorkVisa: 2,
      };
      const result = checkEligibility(profile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(false);
    });

    it("日本人配偶者は居住要件が緩和される（3年以上在留＋1年以上居住）", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        currentVisaCategory: "spouse_of_japanese",
        yearsInJapan: 3,
        yearsOnWorkVisa: 0,
      };
      const result = checkEligibility(profile);
      const residenceCheck = result.checks.find(
        (c) => c.id === "years_in_japan"
      );
      expect(residenceCheck?.passed).toBe(true);
    });
  });

  describe("国益要件 - 出国日数", () => {
    it("連続出国90日未満の場合、通過する", () => {
      const result = checkEligibility(validWorkVisaProfile);
      const abroadCheck = result.checks.find(
        (c) => c.id === "consecutive_days_abroad"
      );
      expect(abroadCheck?.passed).toBe(true);
    });

    it("連続出国90日以上の場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        maxConsecutiveDaysAbroad: 100,
      };
      const result = checkEligibility(profile);
      const abroadCheck = result.checks.find(
        (c) => c.id === "consecutive_days_abroad"
      );
      expect(abroadCheck?.passed).toBe(false);
      expect(abroadCheck?.severity).toBe("critical");
    });

    it("年間出国100日以上の場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        totalDaysAbroadLastYear: 110,
      };
      const result = checkEligibility(profile);
      const yearlyAbroadCheck = result.checks.find(
        (c) => c.id === "yearly_days_abroad"
      );
      expect(yearlyAbroadCheck?.passed).toBe(false);
    });
  });

  describe("在留期間要件", () => {
    it("在留期間3年以上の場合、通過する", () => {
      const result = checkEligibility(validWorkVisaProfile);
      const periodCheck = result.checks.find(
        (c) => c.id === "visa_period"
      );
      expect(periodCheck?.passed).toBe(true);
    });

    it("在留期間3年未満の場合、失敗する", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        currentVisaPeriod: 1,
      };
      const result = checkEligibility(profile);
      const periodCheck = result.checks.find(
        (c) => c.id === "visa_period"
      );
      expect(periodCheck?.passed).toBe(false);
    });
  });

  describe("総合判定", () => {
    it("全チェック通過の場合、eligible=trueになる", () => {
      const result = checkEligibility(validWorkVisaProfile);
      expect(result.eligible).toBe(true);
    });

    it("criticalチェックが1つでも失敗すると、eligible=falseになる", () => {
      const profile: ApplicantProfile = {
        ...validWorkVisaProfile,
        hasCriminalRecord: true,
      };
      const result = checkEligibility(profile);
      expect(result.eligible).toBe(false);
    });

    it("スコアが0-100の範囲で返される", () => {
      const result = checkEligibility(validWorkVisaProfile);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });
});
