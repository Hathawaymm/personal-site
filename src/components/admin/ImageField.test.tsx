import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ImageField from "./ImageField";

describe("ImageField", () => {
  it("uploads a dropped image and can reset to the default", async () => {
    const onChange = vi.fn();
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ url: "/uploads/career/drop.webp" }),
    })));
    const field = (value: string) => (
      <ImageField
        label="个人照片"
        hint="首页"
        value={value}
        fallback="/images/zoe/seaside.webp"
        testId="career-image-portrait"
        onChange={onChange}
      />
    );
    const view = render(field(""));
    expect(screen.getByRole("button", { name: "恢复默认" })).toBeDisabled();
    const file = new File([new Uint8Array([137, 80, 78, 71])], "portrait.png", { type: "image/png" });
    fireEvent.drop(screen.getByTestId("career-image-portrait-drop"), { dataTransfer: { files: [file] } });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("/uploads/career/drop.webp"));
    view.rerender(field("/uploads/career/drop.webp"));
    fireEvent.click(screen.getByRole("button", { name: "恢复默认" }));
    expect(onChange).toHaveBeenCalledWith("");
    vi.unstubAllGlobals();
  });
});