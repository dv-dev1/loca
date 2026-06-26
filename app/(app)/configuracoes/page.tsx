import { revalidatePath } from "next/cache";
import { getOrgSettings } from "@/lib/supabase/org";
import { createClient } from "@/lib/supabase/server";

async function salvar(formData: FormData) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("org_settings")
    .update({
      nome: String(formData.get("nome") ?? "").trim() || "Imobiliária",
      whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  revalidatePath("/configuracoes");
  revalidatePath("/cliente");
}

function Campo({ label, name, defaultValue, hint, type = "text" }: { label: string; name: string; defaultValue?: string; hint?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="h-11 rounded-sm border border-line bg-paper px-3 text-ink outline-none transition focus:border-brand focus-visible:border-brand"
      />
      {hint && <span className="text-[0.78rem] text-ink-soft">{hint}</span>}
    </label>
  );
}

export default async function ConfiguracoesPage() {
  const org = await getOrgSettings();

  return (
    <div className="max-w-xl">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">§ Configurações</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Dados da imobiliária</h1>
      <p className="mt-2 text-ink-soft">
        Usados no portal do locador e no canal de contato. O WhatsApp aqui é o número que aparece para os clientes.
      </p>

      <form action={salvar} className="mt-8 flex flex-col gap-6">
        <Campo label="Nome" name="nome" defaultValue={org.nome} />
        <Campo
          label="WhatsApp"
          name="whatsapp"
          defaultValue={org.whatsapp ?? ""}
          hint="Com DDI e DDD. Ex.: 55 11 99999-8888"
        />
        <Campo label="E-mail" name="email" type="email" defaultValue={org.email ?? ""} />
        <button
          type="submit"
          className="inline-flex h-[3.25rem] w-fit items-center rounded-sm bg-brand px-7 font-semibold text-paper transition hover:bg-brand-2"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
