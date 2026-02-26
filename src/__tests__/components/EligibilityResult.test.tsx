import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EligibilityResult } from "@/components/EligibilityResult";
import type { EligibilityCheckResult } from "@/types/visa";

describe("EligibilityResult - 適格性チェック結果表示", () => {
  const eligibleResult: EligibilityCheckResult = {
    eligible: true,
    overallScore: 100,
    checks: [
      {
        id: "criminal_record",
        name: "犯罪歴チェック",
        description: "犯罪歴の確認",
        passed: true,
        severity: "critical",
        message: "犯罪歴なし",
      },
      {
        id: "annual_income",
        name: "年収（参考情報）",
        description: "年収の確認",
        passed: true,
        severity: "info",
        message: "参考情報として表示",
      },
    ],
  };

  const ineligibleResult: EligibilityCheckResult = {
    eligible: false,
    overallScore: 50,
    checks: [
      {
        id: "criminal_record",
        name: "犯罪歴チェック",
        description: "犯罪歴の確認",
        passed: true,
        severity: "critical",
        message: "犯罪歴なし",
      },
      {
        id: "years_in_japan",
        name: "在留年数チェック",
        description: "在留年数の確認",
        passed: false,
        severity: "critical",
        message: "在留8年（必要: 10年以上）",
      },
    ],
  };

  it("適格な場合、肯定的なメッセージを表示する", () => {
    render(<EligibilityResult result={eligibleResult} />);
    expect(screen.getByText(/申請可能/i)).toBeInTheDocument();
  });

  it("不適格な場合、注意メッセージを表示する", () => {
    render(<EligibilityResult result={ineligibleResult} />);
    expect(screen.getByText(/要件を満たしていません/i)).toBeInTheDocument();
  });

  it("各チェック項目の結果を表示する", () => {
    render(<EligibilityResult result={eligibleResult} />);
    expect(screen.getAllByText("犯罪歴チェック").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("年収（参考情報）").length).toBeGreaterThanOrEqual(1);
  });

  it("失敗したチェック項目に警告を表示する", () => {
    render(<EligibilityResult result={ineligibleResult} />);
    expect(screen.getAllByText(/在留8年/).length).toBeGreaterThanOrEqual(1);
  });

  it("スコアを表示する", () => {
    render(<EligibilityResult result={eligibleResult} />);
    expect(screen.getAllByText(/100/).length).toBeGreaterThanOrEqual(1);
  });
});
