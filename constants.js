import * as networksStructs from "./networks";
export const PUBKEYS = {
  bitcoin: "cc840797a89d0b0d00844e7ae6211ebb94d0778a8c56fbc5d90235b5fc8cd5ea",
  tape: "e3b785d99ebec9a56a7f533b1640e9002807263fa5a3a00729e048a693bcd6ee",
  testnet: "2bef319c1557f7af39e5175c22de1707dba4cee0b310234b7a4c613d550265ac",
};
export const GAP_LIMIT = 5;
export const NETWORKS = {
  bitcoin: networksStructs.bitcoin,
  tape: networksStructs.regtest,
  testnet: networksStructs.testnet,
};
const PURPOSE = 1073;
export const SIGNING_MESSAGE = "Satoshi Nakamoto";
export const VAULT_PATH = `m/${PURPOSE}'/<network>'/0'/<index>`;

