use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = "banner")]
pub fn banner(prefix: &str, version: &str) -> String {
  [
    format!("{} @generated by", prefix),
    prefix.to_owned(),
    format!(
      "{}   ██████╗ ██████╗ ███████╗███╗   ██╗ █████╗ ██████╗ ██╗██╗  ██╗██████╗ ",
      prefix
    ),
    format!(
      "{}  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔══██╗██║██║  ██║╚════██╗",
      prefix
    ),
    format!(
      "{}  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║███████║██████╔╝██║███████║ █████╔╝",
      prefix
    ),
    format!(
      "{}  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██╔══██║██╔═══╝ ██║╚════██║██╔═══╝ ",
      prefix
    ),
    format!(
      "{}  ╚██████╔╝██║     ███████╗██║ ╚████║██║  ██║██║     ██║     ██║███████╗",
      prefix
    ),
    format!(
      "{}   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝     ╚═╝╚══════╝",
      prefix
    ),
    format!("{}   {:47} -- www.OpenApi42.org", prefix, version),
  ]
  .join("\n")
}
