use chrono::{Datelike, Local};

/// Replaces template variable placeholders with their current values.
///
/// This function processes a template string and substitutes template variables
/// with their corresponding values based on the current date and time. The function
/// uses the system's local timezone for all date calculations.
///
/// # Supported Variables
///
/// * `{{date}}` - Current date in YYYY-MM-DD format (e.g., "2025-11-25")
/// * `{{week}}` - Current ISO week number as a string (e.g., "47")
///
/// # Arguments
///
/// * `template` - A string slice containing the template with variable placeholders
///
/// # Returns
///
/// A new `String` with all recognized template variables replaced by their current values.
/// Unrecognized placeholders are left unchanged in the output.
///
/// # Examples
///
/// ```
/// use mdgraph2_lib::helpers::replace_variables;
///
/// let template = "Date: {{date}}, Week: {{week}}";
/// let result = replace_variables(template);
/// // result: "Date: 2025-11-25, Week: 47" (values depend on current date)
/// ```
///
/// # Variable Details
///
/// ## Date Format
/// The `{{date}}` variable uses the format `%Y-%m-%d` which produces dates like:
/// - 2025-01-15
/// - 2025-11-25
///
/// ## Week Number
/// The `{{week}}` variable uses ISO 8601 week numbering, where:
/// - Week 1 is the first week with a Thursday in the new year
/// - Week numbers range from 1 to 52 or 53
/// - The week number is returned as a plain number string without leading zeros
pub fn replace_variables(template: &str) -> String {
    let now = Local::now();

    let date_str = now.format("%Y-%m-%d").to_string();
    let week_num = now.iso_week().week().to_string();

    template
        .replace("{{date}}", &date_str)
        .replace("{{week}}", &week_num)
}
