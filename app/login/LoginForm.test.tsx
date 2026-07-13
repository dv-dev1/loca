import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signInWithPassword } }),
  supabaseConfigured: true,
}));

import { LoginForm } from "./LoginForm";

beforeEach(() => {
  push.mockReset();
  signInWithPassword.mockReset();
});

describe("LoginForm", () => {
  it("autentica e redireciona para /painel com credenciais válidas", async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), "admin@teste.com");
    await user.type(screen.getByLabelText(/senha/i), "Admin@Teste123");
    await user.click(screen.getByRole("button", { name: /entrar no painel/i }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "admin@teste.com",
        password: "Admin@Teste123",
      });
      expect(push).toHaveBeenCalledWith("/painel");
    });
  });

  it("mostra erro e não redireciona com credenciais inválidas", async () => {
    signInWithPassword.mockResolvedValue({ error: { message: "Invalid login credentials" } });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), "admin@teste.com");
    await user.type(screen.getByLabelText(/senha/i), "senha-errada");
    await user.click(screen.getByRole("button", { name: /entrar no painel/i }));

    expect(await screen.findByText(/e-mail ou senha inválidos/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("em modo demo, entra direto no painel sem chamar o Supabase", async () => {
    vi.resetModules();
    vi.doMock("next/navigation", () => ({ useRouter: () => ({ push }) }));
    vi.doMock("@/lib/supabase/client", () => ({
      createClient: () => ({ auth: { signInWithPassword } }),
      supabaseConfigured: false,
    }));

    const { LoginForm: LoginFormDemo } = await import("./LoginForm");
    const user = userEvent.setup();
    render(<LoginFormDemo />);

    await user.click(screen.getByRole("button", { name: /entrar no painel/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/painel");
    });
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});
