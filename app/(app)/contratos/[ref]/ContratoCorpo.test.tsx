import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTRATOS } from "@/app/_data/contratos";

const push = vi.fn();
const apagarContrato = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("./actions", () => ({ apagarContrato }));

const { ContratoCorpo } = await import("./ContratoCorpo");

const contrato = CONTRATOS[0];

beforeEach(() => {
  push.mockReset();
  apagarContrato.mockReset();
});

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

  it("pede confirmação antes de apagar e cancela sem chamar a action", async () => {
    const user = userEvent.setup();
    render(<ContratoCorpo contrato={contrato} />);

    await user.click(screen.getByRole("button", { name: /apagar contrato/i }));
    expect(screen.getByRole("button", { name: /confirmar exclusão/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancelar$/i }));

    expect(screen.queryByRole("button", { name: /confirmar exclusão/i })).not.toBeInTheDocument();
    expect(apagarContrato).not.toHaveBeenCalled();
  });

  it("apaga o contrato e redireciona para a carteira ao confirmar", async () => {
    apagarContrato.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(<ContratoCorpo contrato={contrato} />);

    await user.click(screen.getByRole("button", { name: /apagar contrato/i }));
    await user.click(screen.getByRole("button", { name: /confirmar exclusão/i }));

    await waitFor(() => {
      expect(apagarContrato).toHaveBeenCalledWith(contrato.ref);
      expect(push).toHaveBeenCalledWith("/carteira");
    });
  });

  it("mostra mensagem de erro quando a exclusão falha", async () => {
    apagarContrato.mockResolvedValue({ ok: false, message: "Apenas administradores podem apagar contratos." });
    const user = userEvent.setup();
    render(<ContratoCorpo contrato={contrato} />);

    await user.click(screen.getByRole("button", { name: /apagar contrato/i }));
    await user.click(screen.getByRole("button", { name: /confirmar exclusão/i }));

    expect(await screen.findByText(/apenas administradores podem apagar/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
