const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ"; // sem I, O
const LOWER = "abcdefghjkmnpqrstuvwxyz"; // sem i, l, o
const DIGIT = "23456789"; // sem 0, 1
const TODOS = UPPER + LOWER + DIGIT;

export function gerarSenha(comprimento = 12): string {
  // Garante ao menos um char de cada grupo
  const bytes = new Uint8Array(comprimento + 3);
  crypto.getRandomValues(bytes);

  const chars: string[] = [
    UPPER[bytes[0] % UPPER.length],
    LOWER[bytes[1] % LOWER.length],
    DIGIT[bytes[2] % DIGIT.length],
    ...Array.from(bytes.slice(3, comprimento)).map((b) => TODOS[b % TODOS.length]),
  ];

  // Fisher-Yates para não deixar os primeiros 3 fixos
  const shuffle = new Uint8Array(comprimento);
  crypto.getRandomValues(shuffle);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffle[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
