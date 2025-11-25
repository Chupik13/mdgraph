use std::fs;
use std::path::Path;

use crate::helpers;

/// Loads template content from a file.
///
/// Reads the entire contents of a template file into a string. The template
/// file is expected to contain valid UTF-8 text, potentially with template
/// variable placeholders like `{{date}}` or `{{week}}`.
///
/// # Arguments
///
/// * `template_path` - File system path to the template file
///
/// # Returns
///
/// * `Ok(String)` - The complete template content as a string
/// * `Err(String)` - Error message if the file cannot be read
///
/// # Errors
///
/// Returns an error if:
/// - The template file does not exist at the specified path
/// - The application lacks permission to read the file
/// - The file contains invalid UTF-8 content
/// - Any I/O error occurs during file reading
///
/// # Examples
///
/// ```no_run
/// use mdgraph2_lib::templates::load_template;
///
/// let content = load_template("/path/to/template.md")?;
/// assert!(content.contains("{{date}}"));
/// ```
pub fn load_template(template_path: &str) -> Result<String, String> {
    fs::read_to_string(template_path).map_err(|e| {
        format!(
            "Failed to load template from '{}': {}",
            template_path, e
        )
    })
}

/// Creates a file from a template with variable substitution.
///
/// This function performs a complete template processing workflow:
/// 1. Loads the template content from the specified file
/// 2. Replaces all template variables (e.g., `{{date}}`, `{{week}}`) with current values
/// 3. Ensures the parent directory exists, creating it if necessary
/// 4. Writes the processed content to a new file at the output path
///
/// The function will not overwrite existing files and will return an error if the
/// output file already exists. Parent directories are created automatically using
/// `fs::create_dir_all`, which recursively creates all missing directories in the path.
///
/// # Arguments
///
/// * `template_path` - File system path to the template file to process
/// * `output_path` - File system path where the new file should be created
///
/// # Returns
///
/// * `Ok(())` - File was successfully created with processed template content
/// * `Err(String)` - Descriptive error message explaining what went wrong
///
/// # Errors
///
/// Returns an error if:
/// - The output file already exists (will not overwrite)
/// - The template file cannot be loaded (see `load_template` errors)
/// - Parent directories cannot be created (permission denied, disk full, etc.)
/// - The output file cannot be written (permission denied, disk full, etc.)
///
/// # Logging
///
/// This function produces detailed logging output to stdout for debugging:
/// - Template and output paths
/// - Template loading progress and file size
/// - Variable replacement progress
/// - Directory creation status
/// - File write operation status
/// - Any errors encountered
///
/// All log messages are prefixed with `[Template]` for easy filtering.
///
/// # Template Variables
///
/// See `helpers::replace_variables` for supported template variables and their formats.
///
/// # Examples
///
/// ```no_run
/// use mdgraph2_lib::templates::create_from_template;
///
/// // Template file contains: "# Note\n\nCreated: {{date}}\n"
/// create_from_template(
///     "/templates/note.md",
///     "/notes/my-note.md"
/// )?;
/// // Creates /notes/my-note.md with current date substituted
/// ```
///
/// # File System Behavior
///
/// - **Parent Directories**: Automatically created if they don't exist
/// - **Existing Files**: Not overwritten; returns error instead
/// - **Permissions**: Requires read access to template, write access to output directory
/// - **Atomicity**: File write is not atomic; partial files may exist on error
pub fn create_from_template(template_path: &str, output_path: &str) -> Result<(), String> {
    println!("[Template] Starting create_from_template");
    println!("[Template] Template path: {}", template_path);
    println!("[Template] Output path: {}", output_path);

    if Path::new(output_path).exists() {
        return Err(format!("File '{}' already exists", output_path));
    }

    println!("[Template] Loading template");
    let template_content = load_template(template_path)?;
    println!("[Template] Template loaded, length: {} bytes", template_content.len());

    println!("[Template] Replacing variables");
    let processed_content = helpers::replace_variables(&template_content);
    println!("[Template] Variables replaced, content length: {}", processed_content.len());

    if let Some(parent) = Path::new(output_path).parent() {
        println!("[Template] Ensuring parent directory exists: {:?}", parent);
        fs::create_dir_all(parent).map_err(|e| {
            format!("Failed to create directory '{}': {}", parent.display(), e)
        })?;
        println!("[Template] Parent directory ready");
    }

    println!("[Template] Writing file: {}", output_path);

    if let Err(e) = fs::write(output_path, &processed_content) {
        let error_msg = format!("Failed to create file '{}': {}", output_path, e);
        println!("[Template] ERROR: {}", error_msg);
        return Err(error_msg);
    }

    println!("[Template] File written successfully");
    Ok(())
}
