import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// Configure marked with syntax highlighting
marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

// Set default options for marked
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
  headerIds: false, // Disable header IDs for security
});

export function formatMarkdown(content: string): string {
  // Convert markdown to HTML and sanitize
  const rawHtml = marked(content);
  const cleanHtml = DOMPurify.sanitize(rawHtml);
  return cleanHtml;
}