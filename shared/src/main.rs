use shared::export;

fn main() {
    let args: Vec<String> = std::env::args().collect();

    if args.len() > 1 {
        let command = &args[1];

        match command.as_str() {
            "export_all" => {
                export::export_all();
            }
            _ => {
                eprintln!("Unknown command: {}", command);
                print_usage();
            }
        }
    } else {
        println!("No command provided.");
        print_usage();
    }
}

fn print_usage() {
    println!("Usage: cargo run <command>");
    println!("Available commands:");
    println!("  export_all: Exports all data.");
}
