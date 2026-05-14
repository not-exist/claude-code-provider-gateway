pub const EXTERNAL_DAEMON_ENV: &str = "CC_GATEWAY_EXTERNAL_DAEMON";
pub const SECRET_KEY_ENV: &str = "CC_GATEWAY_SECRET_KEY";

pub fn uses_external_daemon() -> bool {
    std::env::var(EXTERNAL_DAEMON_ENV).is_ok_and(|value| value == "1")
}
