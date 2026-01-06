use clap::Parser as ClapParser;
use parser::parsers::junit::JunitParser;
use parser::test::TestParser;
use std::path::Path;

#[derive(ClapParser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[arg(short, long)]
    file: String,
}

fn main() {
    let args = Args::parse();
    let file_path = args.file;

    println!("Parsing file: {}", file_path);

    let parser = JunitParser;
    let path = Path::new(&file_path);
    match parser.parse(path) {
        Ok(tests) => {
            println!("Parsed {} tests.", tests.len());
            for test in tests {
                println!("Test Suite: {}", test.name);
                for method in test.methods {
                    println!("  Method: {} - {:?}", method.name, method.status);
                }
            }
        }
        Err(e) => println!("Error parsing file: {}", e),
    }
}
