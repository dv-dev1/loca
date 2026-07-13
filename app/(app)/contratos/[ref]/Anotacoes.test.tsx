import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const adicionarAnotacao = vi.fn();

vi.mock("./actions", () => ({ adicionarAnotacao }));

const { Anotacoes } = await import("./Anotacoes");

beforeEach(() => {
  adicionarAnotacao.mockReset();
});

describe("Anotacoes", () => {
  it("mostra mensagem quando não há observações", () => {
    render(<Anotacoes contratoRef="LOC-0001" anotacoesIniciais={[]} />);
    expect(screen.getByText(/nenhuma observação registrada/i)).toBeInTheDocument();
  });

  it("lista as observações existentes com data/hora", () => {
    render(
      <Anotacoes
        contratoRef="LOC-0001"
        anotacoesIniciais={[{ id: "1", texto: "Locatário pediu 2ª via do boleto", criadoEm: "10/07/2026 09:00" }]}
      />,
    );

    expect(screen.getByText("Locatário pediu 2ª via do boleto")).toBeInTheDocument();
    expect(screen.getByText("10/07/2026 09:00")).toBeInTheDocument();
  });

  it("adiciona uma observação nova no topo da lista ao salvar", async () => {
    adicionarAnotacao.mockResolvedValue({
      ok: true,
      anotacao: { id: "2", texto: "Chave extra entregue", criadoEm: "13/07/2026 14:30" },
    });
    const user = userEvent.setup();
    render(<Anotacoes contratoRef="LOC-0001" anotacoesIniciais={[]} />);

    await user.type(screen.getByLabelText(/nova observação/i), "Chave extra entregue");
    await user.click(screen.getByRole("button", { name: /adicionar observação/i }));

    await waitFor(() => {
      expect(adicionarAnotacao).toHaveBeenCalledWith("LOC-0001", "Chave extra entregue");
      expect(screen.getByText("Chave extra entregue")).toBeInTheDocument();
      expect(screen.getByText("13/07/2026 14:30")).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/nova observação/i)).toHaveValue("");
  });

  it("mostra erro e mantém o texto quando a action falha", async () => {
    adicionarAnotacao.mockResolvedValue({ ok: false, message: "Apenas administradores podem adicionar anotações." });
    const user = userEvent.setup();
    render(<Anotacoes contratoRef="LOC-0001" anotacoesIniciais={[]} />);

    await user.type(screen.getByLabelText(/nova observação/i), "Teste");
    await user.click(screen.getByRole("button", { name: /adicionar observação/i }));

    expect(await screen.findByText(/apenas administradores podem adicionar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nova observação/i)).toHaveValue("Teste");
  });

  it("desabilita o botão de adicionar quando o texto está vazio", () => {
    render(<Anotacoes contratoRef="LOC-0001" anotacoesIniciais={[]} />);
    expect(screen.getByRole("button", { name: /adicionar observação/i })).toBeDisabled();
  });
});
