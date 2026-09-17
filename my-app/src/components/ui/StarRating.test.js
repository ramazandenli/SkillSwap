import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StarRating from "./StarRating.js";

describe("StarRating", () => {
  test("salt okunur halde tiklanabilir dugme uretmez", () => {
    render(<StarRating value={4} />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByLabelText("5 uzerinden 4 puan")).toBeInTheDocument();
  });

  test("secilebilir halde tiklanan yildizin degerini bildirir", async () => {
    const handleChange = jest.fn();
    render(<StarRating value={0} onChange={handleChange} />);

    await userEvent.click(screen.getByLabelText("3 yildiz"));

    expect(handleChange).toHaveBeenCalledWith(3);
  });
});
