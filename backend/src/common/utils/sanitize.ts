import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows basic formatting tags but strips dangerous content
 */
export function sanitizeContent(content: string): string {
  if (!content) return content;

  return sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    ],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      'a': (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
    disallowedTagsMode: 'discard',
  });
}

/**
 * Sanitize plain text - escape HTML entities
 */
export function escapeHtml(text: string): string {
  if (!text) return text;

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
}

/**
 * Strip all HTML tags, leaving only plain text
 */
export function stripHtml(content: string): string {
  if (!content) return content;

  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
