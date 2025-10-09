// utils/generateCapture.ts

// Generate a random 6-character alphanumeric captcha
export function generateCapture(prev: string = ""): {
  raw: string;       // plain code for validation
  styled: string;    // code with strikethrough for display
} {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let raw = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    raw += chars[randomIndex];
  }

  // avoid repeat of previous
  if (raw === prev) {
    return generateCapture(prev);
  }

  // add strikethrough effect
  const styled = raw
    .split("")
    // .map((c) => c + "\u0336") // Unicode combining strikethrough
    .join("");

  return { raw, styled };
}