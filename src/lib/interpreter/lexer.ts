
import type { Token } from './types';
import { TokenType } from './types';

const KEYWORDS: Record<string, TokenType> = {
  'escribir': TokenType.KEYWORD_ESCRIBIR,
};

export function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let line = 1;
  let column = 1;

  while (cursor < input.length) {
    let char = input[cursor];

    // Skip whitespace
    if (/\s/.test(char)) {
      if (char === '\n') {
        // Optionally, emit NEWLINE token or just advance line/column
        // For simplicity now, just advance and skip.
        // tokens.push({ type: TokenType.NEWLINE, value: '\n', line, column });
        line++;
        column = 1;
      } else {
        column++;
      }
      cursor++;
      continue;
    }

    // String literals
    if (char === '"') {
      let value = '';
      const startColumn = column;
      cursor++; // Skip opening quote
      column++;
      while (cursor < input.length && input[cursor] !== '"') {
        value += input[cursor];
        cursor++;
        column++;
      }
      if (cursor < input.length && input[cursor] === '"') {
        cursor++; // Skip closing quote
        column++;
        tokens.push({ type: TokenType.STRING_LITERAL, value, line, column: startColumn });
      } else {
        tokens.push({ type: TokenType.UNKNOWN, value: `"${value}`, line, column: startColumn }); // Unterminated string
      }
      continue;
    }

    // Keywords and Identifiers (simple version)
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      const startColumn = column;
      while (cursor < input.length && /[a-zA-Z0-9_]/.test(input[cursor])) {
        value += input[cursor];
        cursor++;
        column++;
      }
      const lowerValue = value.toLowerCase();
      if (KEYWORDS[lowerValue]) {
        tokens.push({ type: KEYWORDS[lowerValue], value: value, line, column: startColumn });
      } else {
        // For now, unknown identifiers are just UNKNOWN or could be IDENTIFIER type
        tokens.push({ type: TokenType.UNKNOWN, value, line, column: startColumn });
      }
      continue;
    }
    
    // Unknown characters
    tokens.push({ type: TokenType.UNKNOWN, value: char, line, column });
    cursor++;
    column++;
  }

  tokens.push({ type: TokenType.EOF, value: '', line, column });
  return tokens;
}
