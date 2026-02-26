import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentChecklist } from "@/components/DocumentChecklist";
import type { ChecklistItem } from "@/types/visa";

describe("DocumentChecklist - 書類チェックリスト", () => {
  const mockOnStatusChange = vi.fn();

  const sampleChecklist: ChecklistItem[] = [
    {
      document: {
        id: "application_form",
        name: "永住許可申請書",
        nameEn: "Application for Permanent Residence",
        category: "basic",
        description: "出入国在留管理庁からダウンロード",
        required: true,
      },
      status: "not_started",
    },
    {
      document: {
        id: "photo",
        name: "写真（縦4cm×横3cm）",
        nameEn: "Photo (4cm x 3cm)",
        category: "basic",
        description: "6ヶ月以内に撮影",
        required: true,
      },
      status: "obtained",
    },
    {
      document: {
        id: "resident_tax_certificate",
        name: "住民税の課税証明書・納税証明書",
        nameEn: "Resident Tax Certificate",
        category: "tax",
        description: "住民税の課税額と納税状況",
        required: true,
        yearsRequired: 5,
      },
      status: "preparing",
    },
  ];

  it("チェックリストの全項目が表示される", () => {
    render(
      <DocumentChecklist
        items={sampleChecklist}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getAllByText("永住許可申請書").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("写真（縦4cm×横3cm）").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("住民税の課税証明書・納税証明書").length).toBeGreaterThanOrEqual(1);
  });

  it("進捗状況のサマリーが表示される", () => {
    render(
      <DocumentChecklist
        items={sampleChecklist}
        onStatusChange={mockOnStatusChange}
      />
    );
    // 1/3 が取得済み
    const summaries = screen.getAllByText("書類準備の進捗");
    const summary = summaries[0].closest("div")!;
    expect(summary.textContent).toContain("1");
    expect(summary.textContent).toContain("3");
  });

  it("書類の説明が表示される", () => {
    render(
      <DocumentChecklist
        items={sampleChecklist}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getAllByText(/出入国在留管理庁からダウンロード/).length).toBeGreaterThanOrEqual(1);
  });

  it("必要年数が表示される", () => {
    render(
      <DocumentChecklist
        items={sampleChecklist}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getAllByText(/5年分/).length).toBeGreaterThanOrEqual(1);
  });

  it("ステータス変更ボタンをクリックするとonStatusChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    render(
      <DocumentChecklist
        items={sampleChecklist}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusButtons = screen.getAllByRole("button", { name: /ステータス/i });
    await user.click(statusButtons[0]);
    expect(mockOnStatusChange).toHaveBeenCalled();
  });
});
