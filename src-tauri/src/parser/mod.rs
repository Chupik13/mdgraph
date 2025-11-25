//! Markdown content parsing module.
//!
//! This module provides regex-based parsing functionality to extract wiki-links
//! and hashtags from markdown file content. It uses simple regex patterns rather
//! than a full markdown parser for performance and simplicity.
//!
//! # Supported Patterns
//!
//! - Wiki-links: `[[title]]` - Double square brackets for internal links
//! - Hashtags: `#tag` - Hash symbol followed by word characters
//!
//! # Performance
//!
//! The regex patterns are compiled once per function call and cached internally
//! by the regex crate. For bulk parsing of many files, consider caching the
//! compiled regex patterns at a higher level if profiling reveals regex compilation
//! as a bottleneck.

use regex::Regex;

/// Result of parsing a markdown file.
///
/// Contains vectors of extracted wiki-links and hashtags found in the content.
/// All matches are returned as strings with the surrounding syntax removed
/// (e.g., "title" instead of "[[title]]").
///
/// # Fields
///
/// * `wiki_links` - List of wiki-link targets without brackets (e.g., ["note1", "note2"])
/// * `hashtags` - List of hashtag names without the hash symbol (e.g., ["tag1", "tag2"])
#[derive(Debug, Clone)]
pub struct ParsedContent {
    pub wiki_links: Vec<String>,
    pub hashtags: Vec<String>,
}

/// Parses markdown content and extracts all wiki-links and hashtags.
///
/// This is the main entry point for markdown parsing. It delegates to specialized
/// extraction functions for each pattern type and combines the results.
///
/// # Arguments
///
/// * `content` - Complete markdown file content as a string
///
/// # Returns
///
/// A `ParsedContent` structure containing vectors of all found wiki-links and hashtags.
///
/// # Performance
///
/// Time complexity: O(n) where n is the length of the content string.
/// The function makes two passes over the content (one for each pattern type).
///
/// # Examples
///
/// ```ignore
/// let content = "# Title\n\nSome [[link]] with #tag";
/// let parsed = parse_markdown(content);
/// assert_eq!(parsed.wiki_links, vec!["link"]);
/// assert_eq!(parsed.hashtags, vec!["tag"]);
/// ```
pub fn parse_markdown(content: &str) -> ParsedContent {
    let wiki_links = extract_wiki_links(content);
    let hashtags = extract_hashtags(content);

    ParsedContent {
        wiki_links,
        hashtags,
    }
}

/// Extracts all wiki-links from markdown content.
///
/// Finds all occurrences of the pattern `[[text]]` and extracts the text between
/// the brackets. The regex pattern `\[\[([^\]]+)\]\]` matches double square brackets
/// with any content that doesn't contain a closing bracket.
///
/// # Arguments
///
/// * `content` - Markdown content to search for wiki-links
///
/// # Returns
///
/// Vector of wiki-link target strings without the surrounding brackets.
/// Empty vector if no wiki-links are found.
///
/// # Pattern Details
///
/// - Matches: `[[text]]`, `[[multi word text]]`, `[[text-with-dashes]]`
/// - Does not match: `[single bracket]`, `[[nested [[brackets]]]]` (inner brackets)
///
/// # Panics
///
/// Panics if the regex pattern fails to compile, which should never happen with
/// a valid hard-coded pattern.
fn extract_wiki_links(content: &str) -> Vec<String> {
    let re = Regex::new(r"\[\[([^\]]+)\]\]").unwrap();

    re.captures_iter(content)
        .map(|cap| cap[1].to_string())
        .collect()
}

/// Extracts all hashtags from markdown content.
///
/// Finds all occurrences of the pattern `#word` and extracts the word after the
/// hash symbol. The regex pattern `#(\w+)` matches a hash followed by one or more
/// word characters (letters, digits, underscores).
///
/// # Arguments
///
/// * `content` - Markdown content to search for hashtags
///
/// # Returns
///
/// Vector of hashtag names without the hash symbol.
/// Empty vector if no hashtags are found.
///
/// # Pattern Details
///
/// - Matches: `#tag`, `#CamelCase`, `#tag_with_underscores`, `#tag123`
/// - Does not match: `#tag-with-dashes`, `# tag` (space after hash), hashtags in code blocks
///
/// # Note
///
/// This pattern will match hashtags anywhere in the content, including within
/// code blocks or inline code. For stricter matching, additional context-aware
/// parsing would be needed.
///
/// # Panics
///
/// Panics if the regex pattern fails to compile, which should never happen with
/// a valid hard-coded pattern.
fn extract_hashtags(content: &str) -> Vec<String> {
    let re = Regex::new(r"#(\w+)").unwrap();

    re.captures_iter(content)
        .map(|cap| cap[1].to_string())
        .collect()
}
