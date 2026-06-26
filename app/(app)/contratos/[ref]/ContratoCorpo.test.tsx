import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CONTRATOS } from "@/app/_data/contratos";
import { ContratoCorpo } from "./ContratoCorpo";

const contrato = CONTRATOS[0];

describe("ContratoCorpo", () => {
  function aluguelRow() {
    return screen.getByText("Aluguel").closest("div")!;
  }

  it("mostra os valores do contrato e o link de baixar PDF", () => {
    render(<ContratoCorpo contrato={contrato} />);

    expect(aluguelRow()).toHaveTextContent(contrato.aluguel);
    expect(screen.getByRole("button", { name: /editar contrato/i })).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /baixar contrato \(pdf\)/i });
    expect(link).toHaveAttribute("href", `/contratos/${contrato.ref}/pdf`);
  });

  it("permite editar e salvar um campo localmente", async () => {
    const user = userEvent.setup();
    render(<ContratoCorpo contrato={contrato} />);

    await user.click(screen.getByRole("button", { name: /editar contrato/i }));

    const aluguelInput = screen.getByLabelText(/aluguel/i);
    await user.clear(aluguelInput);
    await user.type(aluguelInput, "R$ 3.500");

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    expect(screen.getByText("R$ 3.500")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar contrato/i })).toBeInTheDocument();
  });

  it("descarta a edição ao cancelar", async () => {
    const user = userEvent.setup();
    render(<ContratoCorpo contrato={contrato} />);

    await user.click(screen.getByRole("button", { name: /editar contrato/i }));
    const aluguelInput = screen.getByLabelText(/aluguel/i);
    await user.clear(aluguelInput);
    await user.type(aluguelInput, "R$ 9.999");

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(aluguelRow()).toHaveTextContent(contrato.aluguel);
    expect(screen.queryByText("R$ 9.999")).not.toBeInTheDocument();
  });
});
