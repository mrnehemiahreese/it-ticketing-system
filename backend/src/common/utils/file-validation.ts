import { BadRequestException } from '@nestjs/common';

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text
  'text/plain',
  'text/csv',
  'text/html',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/gzip',
  // Code
  'application/json',
  'application/xml',
  'text/javascript',
  'text/css',
];

// Dangerous file extensions that should never be allowed
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.scr', '.pif',
  '.sh', '.bash', '.zsh', '.ps1', '.vbs', '.vbe', '.js', '.jse',
  '.ws', '.wsf', '.wsc', '.wsh', '.hta', '.cpl', '.msc', '.jar',
  '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py', '.rb',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSize?: number;
  blockedExtensions?: string[];
}

export function validateFile(
  file: { originalname: string; mimetype: string; size: number; buffer?: Buffer },
  options: FileValidationOptions = {},
): void {
  const allowedMimeTypes = options.allowedMimeTypes || ALLOWED_MIME_TYPES;
  const maxSize = options.maxSize || MAX_FILE_SIZE;
  const blockedExtensions = options.blockedExtensions || BLOCKED_EXTENSIONS;

  // Check file exists
  if (!file || !file.originalname) {
    throw new BadRequestException('No file provided');
  }

  // Check file size
  if (file.size > maxSize) {
    throw new BadRequestException(
      `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`,
    );
  }

  // Check for blocked extensions
  const filename = file.originalname.toLowerCase();
  for (const ext of blockedExtensions) {
    if (filename.endsWith(ext)) {
      throw new BadRequestException(`File type ${ext} is not allowed for security reasons`);
    }
  }

  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `File type ${file.mimetype} is not allowed. Allowed types: images, documents, archives`,
    );
  }

  // Additional check: verify MIME type matches extension
  const mimeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'application/zip': ['.zip'],
    'text/plain': ['.txt', '.log', '.md'],
    'text/csv': ['.csv'],
    'application/json': ['.json'],
  };

  const expectedExtensions = mimeExtensionMap[file.mimetype];
  if (expectedExtensions) {
    const hasValidExtension = expectedExtensions.some(ext => filename.endsWith(ext));
    if (!hasValidExtension) {
      throw new BadRequestException(
        `File extension does not match MIME type ${file.mimetype}. This may indicate a malicious file.`,
      );
    }
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.split(/[\/]/).pop() || filename;
  
  // Remove dangerous characters and limit length
  return basename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
}
