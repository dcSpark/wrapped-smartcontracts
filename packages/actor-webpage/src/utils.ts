import AssetFingerprint from "@emurgo/cip14-js";
import { bech32 } from "bech32";
import Buffer from "buffer/";

export async function getFingerprintFromBlockfrost(blockfrostId: string): Promise<string> {
  return AssetFingerprint.fromParts(
    Buffer.Buffer.from(blockfrostId.substring(0, 56), "hex"),
    Buffer.Buffer.from(blockfrostId.slice(56), "hex")
  ).fingerprint()
}

export async function assetNameFromBlockfrostId(blockfrostId: string): Promise<string> {
  return Buffer.Buffer.from(blockfrostId.slice(56), "hex").toString();
}

export async function assetNameFromHex(hex: string): Promise<string> {
  return Buffer.Buffer.from(hex, "hex").toString();
}

export async function getFingerprintFromBridge(idCardano: string): Promise<string> {
  const idCardanoHashString = idCardano.substring(0, 40);
  const idCardanoHash = Buffer.Buffer.from(idCardanoHashString, "hex");
  return bech32.encode("asset", bech32.toWords(idCardanoHash));
}
 export async function adaFingerprint(): Promise<string> {
  return AssetFingerprint.fromParts(
    Buffer.Buffer.from("", "hex"),
    Buffer.Buffer.from("", "hex")
  ).fingerprint();
 }

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
