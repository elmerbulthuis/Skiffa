use wasm_bindgen::prelude::*;

#[wasm_bindgen(js_name = "banner")]
pub fn banner(prefix: &str, version: &str) -> String {
  [
    format!("{} @generated by", prefix),
    prefix.to_owned(),
    format!(r"{}  ____  _  ___ _____ _____     ", prefix),
    format!(r"{} / ___|| |/ (_)  ___|  ___|_ _ ", prefix),
    format!(r"{} \___ \| ' /| | |_  | |_ / _` |", prefix),
    format!(r"{}  ___) | . \| |  _| |  _| (_| |", prefix),
    format!(r"{} |____/|_|\_\_|_|   |_|  \__,_|", prefix),
    format!(r"{} {:12} -- www.Skiffa.org", prefix, version),
  ]
  .join("\n")
}
