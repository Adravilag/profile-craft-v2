/**
 * Terminal Response Formatter Utility
 * Enhances terminal response formatting and readability
 */

export interface FormattedResponse {
  type: 'command' | 'response' | 'error' | 'success' | 'warning' | 'info';
  content: string;
  className: string;
  isStructured: boolean;
}

/**
 * Determines the response type based on content
 */
export function detectResponseType(content: string): FormattedResponse['type'] {
  const lowerContent = content.toLowerCase();

  // Check for command patterns
  if (content.startsWith('$') || content.startsWith('>')) {
    return 'command';
  }

  // Check for error patterns
  if (
    lowerContent.includes('error') ||
    lowerContent.includes('failed') ||
    lowerContent.includes('not found') ||
    lowerContent.includes('bash:')
  ) {
    return 'error';
  }

  // Check for success patterns
  if (
    lowerContent.includes('success') ||
    lowerContent.includes('completed') ||
    lowerContent.includes('done') ||
    lowerContent.includes('✓')
  ) {
    return 'success';
  }

  // Check for warning patterns
  if (
    lowerContent.includes('warning') ||
    lowerContent.includes('caution') ||
    lowerContent.includes('⚠')
  ) {
    return 'warning';
  }

  // Check for info patterns
  if (
    lowerContent.includes('info') ||
    lowerContent.includes('note') ||
    lowerContent.includes('tip') ||
    lowerContent.includes('available commands')
  ) {
    return 'info';
  }

  return 'response';
}

/**
 * Checks if content has structured elements
 */
export function hasStructuredContent(content: string): boolean {
  // Check for lists
  if (content.includes('\n- ') || content.includes('\n* ') || /\n\d+\.\s/.test(content)) {
    return true;
  }

  // Check for code blocks
  if (content.includes('```') || content.includes('`')) {
    return true;
  }

  // Check for headers
  if (content.includes('\n# ') || content.includes('\n## ')) {
    return true;
  }

  // Check for tables
  if (content.includes('|') && content.includes('\n')) {
    return true;
  }

  return false;
}

/**
 * Formats terminal response content with enhanced styling
 */
export function formatTerminalResponse(content: string): FormattedResponse {
  const type = detectResponseType(content);
  const isStructured = hasStructuredContent(content);

  let className = 'terminal-line';

  // Add type-specific classes
  switch (type) {
    case 'command':
      className += ' terminal-command-line';
      break;
    case 'error':
      className += ' terminal-response response-error';
      break;
    case 'success':
      className += ' terminal-response response-success';
      break;
    case 'warning':
      className += ' terminal-response response-warning';
      break;
    case 'info':
      className += ' terminal-response response-info';
      break;
    default:
      className += ' terminal-response';
  }

  // Add structured content class
  if (isStructured) {
    className += ' terminal-response-container';
  }

  return {
    type,
    content,
    className,
    isStructured,
  };
}

/**
 * Processes content for enhanced display
 */
export function processResponseContent(content: string): string {
  let processedContent = content;

  // Process inline code
  processedContent = processedContent.replace(
    /`([^`]+)`/g,
    '<span class="response-code-inline">$1</span>'
  );

  // Process bold text
  processedContent = processedContent.replace(
    /\*\*([^*]+)\*\*/g,
    '<span class="response-strong">$1</span>'
  );

  // Process italic text
  processedContent = processedContent.replace(
    /\*([^*]+)\*/g,
    '<span class="response-emphasis">$1</span>'
  );

  // Process links (basic URL detection)
  processedContent = processedContent.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" class="response-link" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return processedContent;
}

/**
 * Formats structured content like lists and code blocks
 */
export function formatStructuredContent(content: string): string {
  let formattedContent = content;

  // Process code blocks
  formattedContent = formattedContent.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    '<div class="response-code">$2</div>'
  );

  // Process headers
  formattedContent = formattedContent.replace(/^# (.+)$/gm, '<div class="response-title">$1</div>');

  formattedContent = formattedContent.replace(
    /^## (.+)$/gm,
    '<div class="response-subtitle">$1</div>'
  );

  // Process lists
  formattedContent = formattedContent.replace(
    /^- (.+)$/gm,
    '<div class="response-list-item">$1</div>'
  );

  // Wrap consecutive list items in a list container
  formattedContent = formattedContent.replace(
    /(<div class="response-list-item">.*?<\/div>\s*)+/gs,
    '<div class="response-list">$&</div>'
  );

  // Process blockquotes
  formattedContent = formattedContent.replace(
    /^> (.+)$/gm,
    '<div class="response-blockquote"><p>$1</p></div>'
  );

  return formattedContent;
}

/**
 * Main function to format terminal output with enhanced styling
 */
export function enhanceTerminalOutput(content: string): FormattedResponse {
  const formatted = formatTerminalResponse(content);

  // Process content for enhanced display
  let enhancedContent = processResponseContent(formatted.content);

  // Apply structured formatting if needed
  if (formatted.isStructured) {
    enhancedContent = formatStructuredContent(enhancedContent);
  }

  return {
    ...formatted,
    content: enhancedContent,
  };
}

/**
 * Utility to create semantic response objects
 */
export const createResponse = {
  success: (content: string): FormattedResponse => ({
    type: 'success',
    content,
    className: 'terminal-response response-success',
    isStructured: hasStructuredContent(content),
  }),

  error: (content: string): FormattedResponse => ({
    type: 'error',
    content,
    className: 'terminal-response response-error',
    isStructured: hasStructuredContent(content),
  }),

  warning: (content: string): FormattedResponse => ({
    type: 'warning',
    content,
    className: 'terminal-response response-warning',
    isStructured: hasStructuredContent(content),
  }),

  info: (content: string): FormattedResponse => ({
    type: 'info',
    content,
    className: 'terminal-response response-info',
    isStructured: hasStructuredContent(content),
  }),

  command: (content: string): FormattedResponse => ({
    type: 'command',
    content,
    className: 'terminal-line terminal-command-line',
    isStructured: false,
  }),

  response: (content: string): FormattedResponse => ({
    type: 'response',
    content,
    className: 'terminal-response',
    isStructured: hasStructuredContent(content),
  }),
};

/**
 * Enhanced bash command responses with better formatting
 */
export const enhancedBashResponses = {
  help: createResponse.info(`# Available Commands

- **help** - Show this help message
- **clear** - Clear the terminal screen
- **ls** - List directory contents
- **pwd** - Print working directory
- **whoami** - Display current user

*Tip: Type any command to see what happens!*`),

  ls: createResponse.response(`portfolio.json    projects/    skills/    experience/

*Use 'ls -la' for detailed view*`),

  pwd: createResponse.response(`/home/adrian-davila`),

  whoami: createResponse.response(`adrian-davila

*Full Stack Developer & UI/UX Designer*`),

  notFound: (command: string) =>
    createResponse.error(`bash: ${command}: command not found

*Type 'help' to see available commands*`),
};
