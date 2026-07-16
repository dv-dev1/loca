// Isolamento entre imobiliárias (multi-tenant).
//
// convidarLocador usa o admin client, que ignora RLS de propósito (é o único que
// consegue criar usuário no auth). Isso significa que a checagem de dono precisa
// ser feita à mão aqui — RLS não protege este caminho.
//
// O mock abaixo simula o banco: guarda contratos de duas imobiliárias e aplica
// os filtros .eq()/.in() de verdade. Assim o teste verifica o resultado (quem
// ficou vinculado a quê), não a forma como a query foi escrita.

import { beforeEach, describe, expect, it, vi } from "vitest";

const getProfile = vi.fn();
const createUser = vi.fn();
const listUsers = vi.fn();
const updateUserById = vi.fn();

type ContratoFake = { ref: string; org_id: string; locador_user_id: string | null };
type PerfilFake = { id: string; papel: string; nome: string | null; org_id: string | null };

let contratos: ContratoFake[] = [];
let perfis: PerfilFake[] = [];

/** Mock de query encadeada do Supabase sobre o array `contratos`. */
function tabelaContratos() {
  return {
    update: (patch: Partial<ContratoFake>) => {
      const filtros: { coluna: keyof ContratoFake; valor: unknown }[] = [];
      let refsAlvo: string[] = [];

      const executar = () => {
        const atingidos = contratos.filter(
          (c) =>
            filtros.every((f) => c[f.coluna] === f.valor) &&
            (refsAlvo.length === 0 || refsAlvo.includes(c.ref)),
        );
        for (const c of atingidos) Object.assign(c, patch);
        return { data: atingidos.map((c) => ({ ref: c.ref })), error: null };
      };

      const chain = {
        eq: (coluna: keyof ContratoFake, valor: unknown) => {
          filtros.push({ coluna, valor });
          return chain;
        },
        in: (_coluna: string, valores: string[]) => {
          refsAlvo = valores;
          return chain;
        },
        select: () => Promise.resolve(executar()),
        then: (resolve: (r: unknown) => unknown) => Promise.resolve(executar()).then(resolve),
      };
      return chain;
    },
    select: () => ({
      eq: (coluna: keyof ContratoFake, valor: unknown) => ({
        maybeSingle: () =>
          Promise.resolve({ data: contratos.find((c) => c[coluna] === valor) ?? null, error: null }),
      }),
    }),
  };
}

function tabelaProfiles() {
  return {
    upsert: (linha: PerfilFake) => {
      const i = perfis.findIndex((p) => p.id === linha.id);
      if (i >= 0) perfis[i] = { ...perfis[i], ...linha };
      else perfis.push(linha);
      return Promise.resolve({ error: null });
    },
    select: () => ({
      eq: (coluna: keyof PerfilFake, valor: unknown) => ({
        maybeSingle: () =>
          Promise.resolve({ data: perfis.find((p) => p[coluna] === valor) ?? null, error: null }),
      }),
    }),
  };
}

vi.mock("@/lib/supabase/profile", () => ({ getProfile }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { createUser, listUsers, updateUserById } },
    from: (tabela: string) => {
      if (tabela === "contratos") return tabelaContratos();
      if (tabela === "profiles") return tabelaProfiles();
      throw new Error(`Tabela inesperada no mock: ${tabela}`);
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  getProfile.mockReset();
  createUser.mockReset();
  listUsers.mockReset();
  updateUserById.mockReset();

  // Duas imobiliárias, um contrato cada.
  contratos = [
    { ref: "LOC-0001", org_id: "org-projecta", locador_user_id: null },
    { ref: "LOC-9999", org_id: "org-jampa", locador_user_id: null },
  ];
  perfis = [];

  createUser.mockResolvedValue({ data: { user: { id: "user-locador" } }, error: null });

  // Admin da Projecta.
  getProfile.mockResolvedValue({
    id: "admin-projecta",
    papel: "admin",
    nome: "Projecta",
    orgId: "org-projecta",
  });
});

function formData(refs: string[], email = "locador@projecta.com") {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("nome", "Locador Teste");
  for (const ref of refs) fd.append("refs", ref);
  return fd;
}

const ESTADO_INICIAL = { ok: false, message: "" };

describe("convidarLocador — isolamento entre imobiliárias", () => {
  it("não vincula locador a contrato de outra imobiliária", async () => {
    const { convidarLocador } = await import("./actions");

    // LOC-9999 é da Jampa — o admin da Projecta não pode alcançá-lo.
    await convidarLocador(ESTADO_INICIAL, formData(["LOC-0001", "LOC-9999"]));

    const jampa = contratos.find((c) => c.ref === "LOC-9999");
    expect(jampa?.locador_user_id).toBeNull();

    // O contrato da própria org é vinculado normalmente.
    const projecta = contratos.find((c) => c.ref === "LOC-0001");
    expect(projecta?.locador_user_id).toBe("user-locador");
  });

  it("recusa o convite quando nenhum dos contratos é da org do admin", async () => {
    const { convidarLocador } = await import("./actions");

    const state = await convidarLocador(ESTADO_INICIAL, formData(["LOC-9999"]));

    expect(state.ok).toBe(false);
    expect(contratos.find((c) => c.ref === "LOC-9999")?.locador_user_id).toBeNull();
  });

  it("não redefine a senha de um locador que já existe em outra imobiliária", async () => {
    // E-mail já cadastrado, vinculado à Jampa.
    createUser.mockResolvedValue({ data: { user: null }, error: { message: "already exists" } });
    listUsers.mockResolvedValue({
      data: { users: [{ id: "user-da-jampa", email: "locador@jampa.com" }] },
    });
    perfis.push({ id: "user-da-jampa", papel: "locador", nome: "Locador Jampa", org_id: "org-jampa" });

    const { convidarLocador } = await import("./actions");

    const state = await convidarLocador(
      ESTADO_INICIAL,
      formData(["LOC-0001"], "locador@jampa.com"),
    );

    expect(state.ok).toBe(false);
    // O sequestro de conta acontece aqui: sem a checagem de org, o admin da
    // Projecta redefiniria a senha de um usuário da Jampa.
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("recusa admin sem imobiliária vinculada", async () => {
    getProfile.mockResolvedValue({
      id: "admin-orfao",
      papel: "admin",
      nome: "Órfão",
      orgId: null,
    });

    const { convidarLocador } = await import("./actions");

    const state = await convidarLocador(ESTADO_INICIAL, formData(["LOC-0001"]));

    expect(state.ok).toBe(false);
    expect(createUser).not.toHaveBeenCalled();
  });
});
