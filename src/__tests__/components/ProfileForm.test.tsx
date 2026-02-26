import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileForm } from "@/components/ProfileForm";
import type { ApplicantProfile } from "@/types/visa";

describe("ProfileForm - プロフィール入力フォーム", () => {
  const mockOnSubmit = vi.fn();

  it("フォームが正しくレンダリングされる", () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/現在のビザ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/職業/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/在留年数/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /チェック/i })).toBeInTheDocument();
  });

  it("ビザカテゴリの選択肢が表示される", () => {
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    const visaSelect = screen.getByLabelText(/現在のビザ/i);
    expect(visaSelect).toBeInTheDocument();
  });

  it("フォーム送信時にonSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    render(<ProfileForm onSubmit={mockOnSubmit} />);

    // フォームの入力
    await user.selectOptions(screen.getByLabelText(/現在のビザ/i), "work");
    await user.selectOptions(screen.getByLabelText(/職業/i), "employee");
    await user.clear(screen.getByLabelText(/在留年数/i));
    await user.type(screen.getByLabelText(/在留年数/i), "12");
    await user.clear(screen.getByLabelText(/就労年数/i));
    await user.type(screen.getByLabelText(/就労年数/i), "7");

    // 送信
    const buttons = screen.getAllByRole("button", { name: /チェック/i });
    await user.click(buttons[0]);
    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
