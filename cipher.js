/**
 * Project: Rewind Bitcoin
 * Website: https://rewindbitcoin.com
 *
 * Author: Jose-Luis Landabaso
 * Email: landabaso@gmail.com
 *
 * Contact Email: hello@rewindbitcoin.com
 *
 * License: MIT License
 *
 * Copyright (c) 2025 Jose-Luis Landabaso, Rewind Bitcoin
 */

const CIPHER_ADDITIONAL_DATA = "Rewind Bitcoin";
import sodium from "sodium-universal";
import b4a from "b4a";

export function decrypt(encryptedMessageWithNonce, cipherKey) {
  const nonceSize = sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES;
  // Assume the first bytes are the nonce
  const nonce = encryptedMessageWithNonce.slice(0, nonceSize);
  const encryptedMessage = encryptedMessageWithNonce.slice(nonceSize);

  const decrypted = sodium.sodium_malloc(
    encryptedMessage.length - sodium.crypto_aead_xchacha20poly1305_ietf_ABYTES,
  );

  // Decrypt the data
  if (
    sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      decrypted,
      null,
      encryptedMessage,
      b4a.from(CIPHER_ADDITIONAL_DATA),
      nonce,
      cipherKey,
    )
  )
    return decrypted;
}
