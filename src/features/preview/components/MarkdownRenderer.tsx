/**
 * Markdown rendering component.
 *
 * Renders markdown content as formatted HTML using react-markdown.
 * Includes styling for common markdown elements and syntax highlighting.
 *
 * @module features/preview/components/MarkdownRenderer
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';
import { NODE_COLORS } from '../../coloring/utils/nodeColors';

/**
 * Props for the MarkdownRenderer component.
 *
 * @property content - The raw markdown content to render
 */
interface MarkdownRendererProps {
  content: string;
}

/**
 * Transforms [[wiki-links]] to italic styled text with incoming node color.
 *
 * Wiki-links in the format `[[link-name]]` are converted to styled `<em>` elements
 * that display the link text in italic with the incoming node color from the
 * graph color scheme.
 *
 * @param text - Raw markdown content containing wiki-links
 * @returns Content with wiki-links converted to styled HTML elements
 *
 * @example
 * transformWikiLinks('See [[other-note]] for details')
 * // Returns: 'See <em style="color: #dbdfac; font-style: italic;">other-note</em> for details'
 */
function transformWikiLinks(text: string): string {
  const wikiLinkColor = NODE_COLORS.incoming.background;
  return text.replace(
    /\[\[([^\]]+)\]\]/g,
    `<em style="color: ${wikiLinkColor}; font-style: italic;">$1</em>`
  );
}

/**
 * Renders markdown content with styling, syntax highlighting, and wiki-link support.
 *
 * Processes raw markdown content and renders it as formatted HTML with:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists, autolinks)
 * - Syntax highlighting for code blocks via highlight.js
 * - Wiki-link transformation (`[[link]]` → styled italic text)
 *
 * @param props - Component props containing the markdown content
 * @returns Rendered markdown component with prose styling
 *
 * @example
 * <MarkdownRenderer content="# Hello\n\nSee [[other-note]] for more." />
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  const transformedContent = transformWikiLinks(content);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {transformedContent}
      </ReactMarkdown>
    </div>
  );
};
