/**
 * API Configuration
 * All API URLs should be configured through environment variables
 */

// Get the API base URL from environment, with fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

/**
 * Get the full URL for an attachment
 * @param {string} attachmentId - The attachment ID
 * @returns {string} Full URL to the attachment
 */
export function getAttachmentUrl(attachmentId) {
  return `${API_BASE_URL}/attachments/${attachmentId}`
}

/**
 * Get the upload URL for attachments
 * @returns {string} Full URL for upload endpoint
 */
export function getUploadUrl() {
  return `${API_BASE_URL}/attachments/upload`
}

/**
 * Get the GraphQL endpoint URL
 * @returns {string} Full URL for GraphQL endpoint
 */
export function getGraphQLUrl() {
  return import.meta.env.VITE_GRAPHQL_ENDPOINT || `${API_BASE_URL}/graphql`
}
