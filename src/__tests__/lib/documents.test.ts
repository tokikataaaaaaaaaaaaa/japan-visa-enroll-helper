import { describe, it, expect } from "vitest";
import {
  getRequiredDocuments,
  generateChecklist,
  ALL_DOCUMENTS,
} from "@/lib/documents";
import type { ApplicantProfile, ChecklistItem } from "@/types/visa";

const workVisaProfile: ApplicantProfile = {
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

describe("ALL_DOCUMENTS - 書類マスターデータ", () => {
  it("基本書類が含まれている", () => {
    const basicDocs = ALL_DOCUMENTS.filter((d) => d.category === "basic");
    expect(basicDocs.length).toBeGreaterThanOrEqual(4);

    const docNames = basicDocs.map((d) => d.id);
    expect(docNames).toContain("application_form");
    expect(docNames).toContain("photo");
    expect(docNames).toContain("residence_card");
    expect(docNames).toContain("passport");
  });

  it("納税関連書類が含まれている", () => {
    const taxDocs = ALL_DOCUMENTS.filter((d) => d.category === "tax");
    expect(taxDocs.length).toBeGreaterThanOrEqual(2);

    const docNames = taxDocs.map((d) => d.id);
    expect(docNames).toContain("resident_tax_certificate");
    expect(docNames).toContain("national_tax_certificate");
  });

  it("年金・保険関連書類が含まれている", () => {
    const pensionDocs = ALL_DOCUMENTS.filter(
      (d) => d.category === "pension_insurance"
    );
    expect(pensionDocs.length).toBeGreaterThanOrEqual(2);
  });

  it("身元保証人関連書類が含まれている", () => {
    const guarantorDocs = ALL_DOCUMENTS.filter(
      (d) => d.category === "guarantor"
    );
    expect(guarantorDocs.length).toBeGreaterThanOrEqual(2);
  });

  it("全書類にidとnameが設定されている", () => {
    for (const doc of ALL_DOCUMENTS) {
      expect(doc.id).toBeTruthy();
      expect(doc.name).toBeTruthy();
      expect(doc.nameEn).toBeTruthy();
    }
  });
});

describe("getRequiredDocuments - 必要書類の取得", () => {
  it("就労ビザ（会社員）の必要書類を返す", () => {
    const docs = getRequiredDocuments(workVisaProfile);
    expect(docs.length).toBeGreaterThan(0);

    const docIds = docs.map((d) => d.id);
    // 基本書類
    expect(docIds).toContain("application_form");
    expect(docIds).toContain("photo");
    expect(docIds).toContain("passport");
    expect(docIds).toContain("residence_card");
    expect(docIds).toContain("resident_certificate");
    // 納税関連（5年分）
    expect(docIds).toContain("resident_tax_certificate");
    // 就労証明
    expect(docIds).toContain("employment_certificate");
  });

  it("就労ビザの納税証明書は5年分必要", () => {
    const docs = getRequiredDocuments(workVisaProfile);
    const taxCert = docs.find((d) => d.id === "resident_tax_certificate");
    expect(taxCert?.yearsRequired).toBe(5);
  });

  it("日本人配偶者の場合、戸籍謄本が必要", () => {
    const spouseProfile: ApplicantProfile = {
      ...workVisaProfile,
      currentVisaCategory: "spouse_of_japanese",
    };
    const docs = getRequiredDocuments(spouseProfile);
    const docIds = docs.map((d) => d.id);
    expect(docIds).toContain("family_register");
  });

  it("日本人配偶者の納税証明書は3年分", () => {
    const spouseProfile: ApplicantProfile = {
      ...workVisaProfile,
      currentVisaCategory: "spouse_of_japanese",
    };
    const docs = getRequiredDocuments(spouseProfile);
    const taxCert = docs.find((d) => d.id === "resident_tax_certificate");
    expect(taxCert?.yearsRequired).toBe(3);
  });

  it("高度専門職の場合、ポイント計算表が必要", () => {
    const hsProfile: ApplicantProfile = {
      ...workVisaProfile,
      currentVisaCategory: "highly_skilled",
      highlySkilledPoints: 80,
    };
    const docs = getRequiredDocuments(hsProfile);
    const docIds = docs.map((d) => d.id);
    expect(docIds).toContain("points_calculation_sheet");
  });

  it("高度専門職80点以上の場合、納税証明は1年分", () => {
    const hsProfile: ApplicantProfile = {
      ...workVisaProfile,
      currentVisaCategory: "highly_skilled",
      highlySkilledPoints: 85,
    };
    const docs = getRequiredDocuments(hsProfile);
    const taxCert = docs.find((d) => d.id === "resident_tax_certificate");
    expect(taxCert?.yearsRequired).toBe(1);
  });

  it("高度専門職70点台の場合、納税証明は3年分", () => {
    const hsProfile: ApplicantProfile = {
      ...workVisaProfile,
      currentVisaCategory: "highly_skilled",
      highlySkilledPoints: 75,
    };
    const docs = getRequiredDocuments(hsProfile);
    const taxCert = docs.find((d) => d.id === "resident_tax_certificate");
    expect(taxCert?.yearsRequired).toBe(3);
  });

  it("経営者の場合、追加書類が必要", () => {
    const ownerProfile: ApplicantProfile = {
      ...workVisaProfile,
      occupationType: "business_owner",
    };
    const docs = getRequiredDocuments(ownerProfile);
    const docIds = docs.map((d) => d.id);
    expect(docIds).toContain("company_registration");
  });

  it("自営業の場合、確定申告書が必要", () => {
    const selfProfile: ApplicantProfile = {
      ...workVisaProfile,
      occupationType: "self_employed",
    };
    const docs = getRequiredDocuments(selfProfile);
    const docIds = docs.map((d) => d.id);
    expect(docIds).toContain("tax_return");
  });
});

describe("generateChecklist - チェックリスト生成", () => {
  it("プロフィールに基づくチェックリストを生成する", () => {
    const checklist = generateChecklist(workVisaProfile);
    expect(checklist.length).toBeGreaterThan(0);
    expect(checklist[0].status).toBe("not_started");
  });

  it("チェックリストの各項目にdocument情報が含まれる", () => {
    const checklist = generateChecklist(workVisaProfile);
    for (const item of checklist) {
      expect(item.document).toBeDefined();
      expect(item.document.id).toBeTruthy();
      expect(item.document.name).toBeTruthy();
    }
  });

  it("基本書類がチェックリストの先頭に来る", () => {
    const checklist = generateChecklist(workVisaProfile);
    const firstBasicIndex = checklist.findIndex(
      (item) => item.document.category === "basic"
    );
    const firstNonBasicIndex = checklist.findIndex(
      (item) => item.document.category !== "basic"
    );
    expect(firstBasicIndex).toBeLessThan(firstNonBasicIndex);
  });
});
