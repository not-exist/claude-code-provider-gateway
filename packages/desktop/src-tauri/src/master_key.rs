// Master key lives in the OS keychain. The daemon never touches the keychain
// itself — it just consumes the key as a hex-encoded env var when we spawn it.

use anyhow::{Context, Result};
use keyring::Entry;
use rand::RngCore;

const KEYCHAIN_SERVICE: &str = "claude-code-provider-gateway";
const KEYCHAIN_USER: &str = "master-key";
const KEY_BYTES: usize = 32;

pub fn get_or_create_hex() -> Result<String> {
    let entry =
        Entry::new(KEYCHAIN_SERVICE, KEYCHAIN_USER).context("failed to open keychain entry")?;

    match entry.get_password() {
        Ok(hex) if is_valid_key_hex(&hex) => Ok(hex),
        Ok(_) => {
            // Corrupt entry — regenerate.
            let fresh = generate_hex();
            entry.set_password(&fresh).context("failed to write key")?;
            Ok(fresh)
        }
        Err(keyring::Error::NoEntry) => {
            let fresh = generate_hex();
            entry.set_password(&fresh).context("failed to write key")?;
            Ok(fresh)
        }
        Err(err) => Err(err).context("keychain read failed"),
    }
}

fn generate_hex() -> String {
    let mut buf = [0u8; KEY_BYTES];
    rand::thread_rng().fill_bytes(&mut buf);
    hex::encode(buf)
}

fn is_valid_key_hex(value: &str) -> bool {
    value.len() == KEY_BYTES * 2 && value.as_bytes().iter().all(u8::is_ascii_hexdigit)
}

#[cfg(test)]
mod tests {
    use super::is_valid_key_hex;

    #[test]
    fn accepts_exact_hex_key_material() {
        assert!(is_valid_key_hex(
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        ));
    }

    #[test]
    fn rejects_wrong_length_or_non_hex_key_material() {
        assert!(!is_valid_key_hex("abc"));
        assert!(!is_valid_key_hex(
            "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"
        ));
    }
}
