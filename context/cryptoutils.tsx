import { pbkdf2 } from "@noble/hashes/pbkdf2";
import { sha1 } from "@noble/hashes/sha1";
import { cbc } from "@noble/ciphers/aes";
import { base64 } from "@scure/base";

// Salt = ASCII "Ivan Medvedev"
const salt = new Uint8Array([73, 118, 97, 110, 32, 77, 101, 100, 118, 101, 100, 101, 118]);

const DERIVE_PASSWORD = "KMDRE23870FDR3S";

function decodeUtf16LE(bytes: Uint8Array): string {
  let result = "";
  for (let i = 0; i < bytes.length; i += 2) {
    const code = bytes[i] | (bytes[i + 1] << 8);
    if (code === 0) break;
    result += String.fromCharCode(code);
  }
  return result;
}

export function decrypt(cipherTextBase64: string): string {
  // 1. Decode Base64 ciphertext
  const encryptedBytes = base64.decode(cipherTextBase64);

  // 2. Derive key (32 bytes) + IV (16 bytes) via PBKDF2-SHA1, 1000 iterations
  const keyMaterial = pbkdf2(sha1, DERIVE_PASSWORD, salt, { c: 1000, dkLen: 48 });
  const key = keyMaterial.slice(0, 32);
  const iv = keyMaterial.slice(32, 48);

  // 3. AES-CBC decrypt
  const aes = cbc(key, iv);
  const decryptedBytes = aes.decrypt(encryptedBytes);

  // 4. Decode from UTF-16LE
  return decodeUtf16LE(decryptedBytes);
}
