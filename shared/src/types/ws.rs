use serde::{Deserialize, Serialize};
use type_reflect::*;

use std::fmt::Write;
use uuid::Uuid;

use super::{action::ShahrazadAction, game::ShahrazadGame};

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ClientAction {
    pub action: Option<ShahrazadAction>,
    pub hash: Option<String>,
}

#[derive(Reflect, Clone, Serialize, Deserialize)]
pub struct ServerUpdate {
    pub action: Option<ShahrazadAction>,
    pub game: Option<ShahrazadGame>,
    pub player_id: Uuid,
    pub hash: Option<String>,
}

fn format_hash(hash_str: &str) -> Result<String, &'static str> {
    let num = hash_str.parse::<u64>().map_err(|_| "Invalid hash number")?;
    let mut s = String::with_capacity(17);
    write!(s, "h{:016x}", num).map_err(|_| "Failed to format hash")?;
    Ok(s)
}

fn parse_hash(s: &str) -> Result<Option<String>, &'static str> {
    if s.starts_with('h') && s.len() >= 17 {
        let hash = &s[1..17];
        let num = u64::from_str_radix(hash, 16).map_err(|_| "Invalid Hash")?;
        Ok(Some(num.to_string()))
    } else {
        Ok(None)
    }
}

fn encode_section(prefix: char, content: &str) -> String {
    format!("{}{}{}", prefix, content.len(), content)
}

fn parse_section(s: &str, expected_prefix: char) -> Result<(Option<String>, &str), &'static str> {
    if !s.starts_with(expected_prefix) {
        return Ok((None, s));
    }

    let length_end = s[1..]
        .find(|c: char| !c.is_ascii_digit())
        .ok_or("No content delimiter found")?
        + 1;

    if length_end <= 1 {
        return Err("Invalid length format");
    }

    let length: usize = s[1..length_end]
        .parse()
        .map_err(|_| "Invalid length number")?;
    let content_start = length_end;
    let content_end = content_start + length;

    if s.len() < content_end {
        return Err("Content too short");
    }

    Ok((
        Some(s[content_start..content_end].to_string()),
        &s[content_end..],
    ))
}

impl CompactString for ClientAction {
    fn to_compact(&self) -> String {
        let mut result = String::new();

        if let Some(hash) = &self.hash {
            result.push_str(&format_hash(hash).unwrap_or_default());
        }

        if let Some(action) = &self.action {
            result.push_str(&encode_section('a', &action.to_compact()));
        }

        result
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        let mut remaining = s;
        let mut client_action = ClientAction {
            action: None,
            hash: None,
        };

        if remaining.starts_with('h') {
            client_action.hash = parse_hash(remaining)?;
            remaining = &remaining[17..];
        }

        if let (Some(action_str), _) = parse_section(remaining, 'a')? {
            client_action.action = Some(ShahrazadAction::from_compact(&action_str)?);
        }

        Ok(client_action)
    }
}

impl CompactString for ServerUpdate {
    fn to_compact(&self) -> String {
        let mut result = String::new();

        if let Some(hash) = &self.hash {
            result.push_str(&format_hash(hash).unwrap_or_default());
        }

        if let Some(action) = &self.action {
            result.push_str(&encode_section('a', &action.to_compact()));
        }

        if let Some(game) = &self.game {
            result.push_str(&encode_section('g', &game.to_compact()));
        }

        write!(result, "p{}", self.player_id).unwrap();

        result
    }

    fn from_compact(s: &str) -> Result<Self, &'static str> {
        let mut remaining = s;
        let mut update = ServerUpdate {
            action: None,
            game: None,
            player_id: Uuid::nil(), // will be overwritten
            hash: None,
        };

        if remaining.starts_with('h') {
            update.hash = parse_hash(remaining)?;
            remaining = &remaining[17..];
        }

        while !remaining.is_empty() {
            match remaining.chars().next() {
                Some('a') => {
                    let (action_str, rest) = parse_section(remaining, 'a')?;
                    if let Some(action_str) = action_str {
                        update.action = Some(ShahrazadAction::from_compact(&action_str)?);
                    }
                    remaining = rest;
                }
                Some('g') => {
                    let (game_str, rest) = parse_section(remaining, 'g')?;
                    if let Some(game_str) = game_str {
                        update.game = Some(ShahrazadGame::from_compact(&game_str)?);
                    }
                    remaining = rest;
                }
                Some('p') => {
                    if remaining.len() < 37 {
                        return Err("Invalid UUID length");
                    }
                    update.player_id =
                        Uuid::parse_str(&remaining[1..37]).map_err(|_| "Invalid UUID format")?;
                    break;
                }
                _ => return Err("Invalid section prefix"),
            }
        }

        if update.player_id == Uuid::nil() {
            return Err("Missing player_id");
        }

        Ok(update)
    }
}

pub trait CompactString {
    fn to_compact(&self) -> String;
    fn from_compact(s: &str) -> Result<Self, &'static str>
    where
        Self: Sized;
}
