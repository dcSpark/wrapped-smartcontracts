export const hexToBytes = (hex: string) => {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
  return new Uint8Array(bytes);
};

export const bytesToHex = (bytes: []) => {
  const hex = [];
  for (let i = 0; i < bytes.length; i++) {
    const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join("");
};

export const bech32ToHexAddress = (input: string): string => {
  const encoder = new TextEncoder();
  const addressBytes = encoder.encode(input);

  const hexAddress = Array.from(addressBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return "0x" + hexAddress;
};
