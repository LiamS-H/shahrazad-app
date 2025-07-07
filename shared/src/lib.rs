pub mod export;
pub mod types;
pub mod proto {
    pub mod action {
        include!(concat!(env!("OUT_DIR"), "/action.rs"));
    }
    pub mod card {
        include!(concat!(env!("OUT_DIR"), "/card.rs"));
    }
    pub mod message {
        include!(concat!(env!("OUT_DIR"), "/message.rs"));
    }
    pub mod game {
        include!(concat!(env!("OUT_DIR"), "/game.rs"));
    }
    pub mod playmat {
        include!(concat!(env!("OUT_DIR"), "/playmat.rs"));
    }
    pub mod ws {
        include!(concat!(env!("OUT_DIR"), "/ws.rs"));
    }
    pub mod zone {
        include!(concat!(env!("OUT_DIR"), "/zone.rs"));
    }
}

#[cfg(test)]
mod tests;
