
export const CESIUM_ACCOUNTS = {
  accountA: {
    label: "Cesium Account A",
    token: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN_A ?? "",
  },

  accountB: {
    label: "Cesium Account B",
    token: process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN_B ?? "",
  },
} as const;

export type CesiumAccount = keyof typeof CESIUM_ACCOUNTS;

export function getCesiumToken(
  account: CesiumAccount = "accountA"
): string {
  const token = CESIUM_ACCOUNTS[account].token;

  if (!token) {
    throw new Error(
      `Cesium token untuk ${account} belum dikonfigurasi`
    );
  }

  return token;
}
