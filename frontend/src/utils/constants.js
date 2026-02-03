// Ticket Status
export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ON_HOLD: 'ON_HOLD',
}

export const TICKET_STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
}

export const TICKET_STATUS_COLORS = {
  OPEN: 'info',
  IN_PROGRESS: 'warning',
  RESOLVED: 'success',
  CLOSED: 'grey',
  ON_HOLD: 'orange',
}

// Ticket Priority
export const TICKET_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
}

export const TICKET_PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const TICKET_PRIORITY_COLORS = {
  LOW: 'grey',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

// Ticket Category - TM Consulting specific categories
export const TICKET_CATEGORY = {
  HARDWARE: 'HARDWARE',      // Printer, Scanner, F/S Drive, Flash drive
  SOFTWARE: 'SOFTWARE',      // General software issues
  BOOKKEEPING: 'BOOKKEEPING', // GL, Misc Receipts, Mortgage Tax, Official Depository, Warrants
  TAX: 'TAX',                // Tax Inquiry, Payments, Adjustments, Mortgage Co, Delinquent Tax
  BUG_REPORT: 'BUG_REPORT',  // Bug reports - quick access
  BILLING: 'BILLING',        // Billing questions
  OTHER: 'OTHER',            // Miscellaneous
}

export const TICKET_CATEGORY_LABELS = {
  HARDWARE: 'Hardware',
  SOFTWARE: 'Software',
  BOOKKEEPING: 'Bookkeeping',
  TAX: 'Tax',
  BUG_REPORT: 'Bug Report',
  BILLING: 'Billing Questions',
  OTHER: 'Other',
}

export const TICKET_CATEGORY_ICONS = {
  HARDWARE: 'mdi-desktop-tower',
  SOFTWARE: 'mdi-application',
  BOOKKEEPING: 'mdi-book-open-variant',
  TAX: 'mdi-file-document-outline',
  BUG_REPORT: 'mdi-bug',
  BILLING: 'mdi-receipt-text',
  OTHER: 'mdi-dots-horizontal',
}

// User Roles
export const USER_ROLE = {
  USER: 'USER',
  AGENT: 'AGENT',
  ADMIN: 'ADMIN',
}

export const USER_ROLE_LABELS = {
  USER: 'User',
  AGENT: 'Agent',
  ADMIN: 'Administrator',
}

export const USER_ROLE_COLORS = {
  USER: 'grey',
  AGENT: 'blue',
  ADMIN: 'purple',
}

// Form validation rules
export const VALIDATION_RULES = {
  required: (v) => !!v || 'This field is required',
  email: (v) => !v || /.+@.+\..+/.test(v) || 'Email must be valid',
  minLength: (length) => (v) => !v || v.length >= length || `Minimum ${length} characters required`,
  maxLength: (length) => (v) => !v || v.length <= length || `Maximum ${length} characters allowed`,
  password: (v) => !v || v.length >= 8 || 'Password must be at least 8 characters',
  phoneNumber: (v) => !v || /^[\d\s\-\+\(\)]+$/.test(v) || 'Phone number must be valid',
}

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'],
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
}
