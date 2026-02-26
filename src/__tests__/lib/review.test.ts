import { describe, it, expect } from "vitest";
import {
  reviewApplicationForm,
  reviewReasonStatement,
} from "@/lib/review";
import type { ApplicantProfile } from "@/types/visa";

const validProfile: ApplicantProfile = {
  currentVisaCategory: "work",
  occupationType: "employee",
  yearsInJapan: 12,
  yearsOnWorkVisa: 7,
  annualIncomeHistory: [400, 420, 450, 480, 500],
  hasSpouseInJapan: true,
  numberOfDependents: 1,
  trafficViolations: 0,
  maxConsecutiveDaysAbroad: 30,
  totalDaysAbroadLastYear: 60,
  currentVisaPeriod: 5,
  hasCriminalRecord: false,
};

describe("reviewApplicationForm - 申請書レビュー", () => {
  it("正常な申請書データでgoodステータスを返す", () => {
    const formData = {
      fullName: "山田 太郎",
      nationality: "アメリカ",
      dateOfBirth: "1990-05-15",
      address: "東京都新宿区西新宿1-1-1",
      phone: "090-1234-5678",
      currentVisa: "技術・人文知識・国際業務",
      visaPeriod: "5年",
      purpose: "永住許可",
    };
    const result = reviewApplicationForm(formData);
    expect(result.overallStatus).toBe("good");
    expect(result.issues.length).toBe(0);
  });

  it("氏名が空の場合、エラーを返す", () => {
    const formData = {
      fullName: "",
      nationality: "アメリカ",
      dateOfBirth: "1990-05-15",
      address: "東京都新宿区西新宿1-1-1",
      phone: "090-1234-5678",
      currentVisa: "技術・人文知識・国際業務",
      visaPeriod: "5年",
      purpose: "永住許可",
    };
    const result = reviewApplicationForm(formData);
    expect(result.overallStatus).toBe("major_issues");
    const nameIssue = result.issues.find((i) => i.field === "fullName");
    expect(nameIssue).toBeDefined();
    expect(nameIssue?.severity).toBe("error");
  });

  it("電話番号の形式が不正な場合、警告を返す", () => {
    const formData = {
      fullName: "山田 太郎",
      nationality: "アメリカ",
      dateOfBirth: "1990-05-15",
      address: "東京都新宿区西新宿1-1-1",
      phone: "12345",
      currentVisa: "技術・人文知識・国際業務",
      visaPeriod: "5年",
      purpose: "永住許可",
    };
    const result = reviewApplicationForm(formData);
    const phoneIssue = result.issues.find((i) => i.field === "phone");
    expect(phoneIssue).toBeDefined();
    expect(phoneIssue?.severity).toBe("warning");
  });

  it("住所が空の場合、エラーを返す", () => {
    const formData = {
      fullName: "山田 太郎",
      nationality: "アメリカ",
      dateOfBirth: "1990-05-15",
      address: "",
      phone: "090-1234-5678",
      currentVisa: "技術・人文知識・国際業務",
      visaPeriod: "5年",
      purpose: "永住許可",
    };
    const result = reviewApplicationForm(formData);
    const addressIssue = result.issues.find((i) => i.field === "address");
    expect(addressIssue).toBeDefined();
    expect(addressIssue?.severity).toBe("error");
  });

  it("複数のフィールドが空の場合、複数のエラーを返す", () => {
    const formData = {
      fullName: "",
      nationality: "",
      dateOfBirth: "",
      address: "",
      phone: "",
      currentVisa: "",
      visaPeriod: "",
      purpose: "",
    };
    const result = reviewApplicationForm(formData);
    expect(result.overallStatus).toBe("major_issues");
    expect(result.issues.filter((i) => i.severity === "error").length).toBeGreaterThanOrEqual(3);
  });
});

describe("reviewReasonStatement - 理由書レビュー", () => {
  it("適切な長さと内容の理由書でgoodステータスを返す", () => {
    const statement =
      "私は2014年に来日し、12年間日本で生活してまいりました。" +
      "現在は株式会社ABCにてソフトウェアエンジニアとして勤務しております。" +
      "日本での生活基盤が確立されており、今後も日本で長期的に生活し、" +
      "社会に貢献していきたいと考えております。" +
      "妻は日本人であり、子供も日本の学校に通っております。" +
      "税金や年金は全て期限内に納付しており、地域のボランティア活動にも参加しております。" +
      "以上の理由から、永住許可を申請いたします。";

    const result = reviewReasonStatement(statement, validProfile);
    expect(result.overallStatus).toBe("good");
  });

  it("文章が短すぎる場合、警告を返す", () => {
    const statement = "永住権が欲しいです。";
    const result = reviewReasonStatement(statement, validProfile);
    expect(result.overallStatus).not.toBe("good");
    const lengthIssue = result.issues.find(
      (i) => i.message.includes("短") || i.message.includes("長さ")
    );
    expect(lengthIssue).toBeDefined();
  });

  it("空の理由書の場合、エラーを返す", () => {
    const result = reviewReasonStatement("", validProfile);
    expect(result.overallStatus).toBe("major_issues");
  });

  it("改善提案が含まれる", () => {
    const statement = "日本に住んでいます。永住権が欲しいです。";
    const result = reviewReasonStatement(statement, validProfile);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("来日時期・在留年数への言及を提案する", () => {
    const statement =
      "永住権を申請します。日本が好きです。仕事もあります。税金も払っています。";
    const result = reviewReasonStatement(statement, validProfile);
    const hasSuggestion = result.suggestions.some(
      (s) => s.includes("来日") || s.includes("在留")
    );
    expect(hasSuggestion).toBe(true);
  });
});
