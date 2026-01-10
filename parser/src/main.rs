use chrono;
use clap::Parser as ClapParser;
use parser::commands::parse_command::parse_command;
use parser::commands::tag_command::tag_command;

#[derive(ClapParser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    #[command(subcommand)]
    command: Commands,
}

#[derive(ClapParser, Debug)]
enum Commands {
    Parse {
        #[arg(short, long, help = "Type of the test report (e.g., junit)")]
        report_type: String,

        #[arg(short, long, help = "Input file or directory path")]
        input: String,

        #[arg(short, long, help = "Output file path")]
        output: Option<String>,

        #[arg(long, help = "Tags to add to all tests")]
        tag: Vec<String>,
    },
    Tag {
        #[arg(short, long, help = "Input file path")]
        input: String,

        #[arg(short, long, help = "Output file path")]
        output: Option<String>,

        #[arg(long, help = "Tag to add in the format 'expression:operation:tag1,tag2' where operation can be add, remove, or update")]
        tag: Vec<String>,
    },
}

fn main() {
    let args = Args::parse();

    match args.command {
        Commands::Parse {
            report_type,
            input,
            output,
            tag,
        } => parse_command(
            report_type,
            input,
            output.unwrap_or("output.json".to_string()),
            chrono::Utc::now().to_string(),
            tag,
        ),
        Commands::Tag { input, output, tag } => {
            tag_command(input, output, tag);
        }
    }
}
