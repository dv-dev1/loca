import { openaiConfigured } from "@/lib/ia/config";
import { NovoContratoForm } from "./NovoContratoForm";

export default function NovoContratoPage() {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <div className="border-b border-ink/80 pb-5">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">§ Cadastro</p>
        <h1 className="mt-1 font-display text-[clamp(1.8rem,3.5vw,2.4rem)] font-extrabold tracking-[-0.02em]">
          Novo contrato de locação
        </h1>
      </div>

      <NovoContratoForm openaiConfigured={openaiConfigured} />
    </div>
  );
}
