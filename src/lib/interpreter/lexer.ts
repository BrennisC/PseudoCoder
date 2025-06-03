
import type { Token } from './types';
import { TokenType } from './types';

const KEYWORDS: Record<string, TokenType> = {
  'algoritmo': TokenType.KEYWORD_ALGORITMO,
  'finalgoritmo': TokenType.KEYWORD_FINALGORITMO,
  'proceso': TokenType.KEYWORD_PROCESO,
  'finproceso': TokenType.KEYWORD_FINPROCESO,
  'definir': TokenType.KEYWORD_DEFINIR,
  'como': TokenType.KEYWORD_COMO,
  'leer': TokenType.KEYWORD_LEER,
  'escribir': TokenType.KEYWORD_ESCRIBIR,
  'si': TokenType.KEYWORD_SI,
  'entonces': TokenType.KEYWORD_ENTONCES,
  'sino': TokenType.KEYWORD_SINO,
  'finsi': TokenType.KEYWORD_FINSI,
  'segun': TokenType.KEYWORD_SEGUN,
  // 'hacer' is tricky as it's part of 'segun ... hacer' and 'mientras ... hacer'
  'deotromodo': TokenType.KEYWORD_DEOTROMODO,
  'finsegun': TokenType.KEYWORD_FINSEGUN,
  'mientras': TokenType.KEYWORD_MIENTRAS,
  'finmientras': TokenType.KEYWORD_FINMIENTRAS,
  'repetir': TokenType.KEYWORD_REPETIR,
  'hastaque': TokenType.KEYWORD_HASTAQUE, // Special case: 'hasta que'
  'para': TokenType.KEYWORD_PARA,
  'hasta': TokenType.KEYWORD_HASTA,
  'con': TokenType.KEYWORD_CON,
  'paso': TokenType.KEYWORD_PASO,
  'finpara': TokenType.KEYWORD_FINPARA,
  'funcion': TokenType.KEYWORD_FUNCION,
  'finfuncion': TokenType.KEYWORD_FINFUNCION,
  'dimension': TokenType.KEYWORD_DIMENSION,
  'entero': TokenType.KEYWORD_ENTERO,
  'real': TokenType.KEYWORD_REAL,
  'numero': TokenType.KEYWORD_NUMERO,
  'logico': TokenType.KEYWORD_LOGICO,
  'caracter': TokenType.KEYWORD_CARACTER,
  'texto': TokenType.KEYWORD_TEXTO,
  'cadena': TokenType.KEYWORD_CADENA,
  'verdadero': TokenType.KEYWORD_VERDADERO,
  'falso': TokenType.KEYWORD_FALSO,
};

export function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let line = 1;
  let column = 1;

  while (cursor < input.length) {
    const startIndex = cursor;
    let char = input[cursor];

    // Whitespace and Newlines
    if (/\s/.test(char)) {
      let value = '';
      let type = TokenType.WHITESPACE;
      if (char === '\n') {
        value = '\n';
        type = TokenType.NEWLINE;
        tokens.push({ type, value, line, column, startIndex });
        line++;
        column = 1;
      } else {
         while (cursor < input.length && /[ \t\r]/.test(input[cursor]) && input[cursor] !== '\n') {
          value += input[cursor];
          column++;
          cursor++;
        }
        tokens.push({ type, value, line, column: column - value.length, startIndex });
        cursor--; // Adjust cursor because the outer loop will increment it
      }
      cursor++;
      continue;
    }

    // Comments: // ...
    if (char === '/' && input[cursor + 1] === '/') {
      let value = '//';
      column += 2;
      cursor += 2;
      while (cursor < input.length && input[cursor] !== '\n') {
        value += input[cursor];
        cursor++;
        column++;
      }
      tokens.push({ type: TokenType.COMMENT, value, line, column: column - value.length, startIndex });
      // No cursor++ here as it's handled by the loop or newline
      continue;
    }

    // String literals: "..." or '...'
    if (char === '"' || char === "'") {
      const quoteType = char;
      let value = '';
      const startColumn = column;
      cursor++; 
      column++;
      while (cursor < input.length && input[cursor] !== quoteType) {
        if (input[cursor] === '\n') { // PSeInt strings can't span lines usually
           tokens.push({ type: TokenType.UNKNOWN, value: quoteType + value, line, column: startColumn, startIndex });
           break; // Exit while, let outer loop handle newline
        }
        value += input[cursor];
        cursor++;
        column++;
      }
      if (cursor < input.length && input[cursor] === quoteType) {
        cursor++; 
        column++;
        tokens.push({ type: TokenType.STRING_LITERAL, value: quoteType + value + quoteType, line, column: startColumn, startIndex });
      } else { // Unterminated string
        tokens.push({ type: TokenType.UNKNOWN, value: quoteType + value, line, column: startColumn, startIndex });
      }
      continue;
    }

    // Numbers: 123, 3.14
    if (/[0-9]/.test(char)) {
      let value = '';
      const startColumn = column;
      while (cursor < input.length && /[0-9]/.test(input[cursor])) {
        value += input[cursor];
        cursor++;
        column++;
      }
      if (cursor < input.length && input[cursor] === '.') {
        value += '.';
        cursor++;
        column++;
        while (cursor < input.length && /[0-9]/.test(input[cursor])) {
          value += input[cursor];
          cursor++;
          column++;
        }
      }
      tokens.push({ type: TokenType.NUMBER_LITERAL, value, line, column: startColumn, startIndex });
      continue;
    }

    // Operators and Punctuation
    // Needs to handle multi-character operators like <-, <=, >=, <>
    if (char === '<') {
      if (input[cursor + 1] === '-') {
        tokens.push({ type: TokenType.OPERATOR_ASSIGN, value: '<-', line, column, startIndex });
        cursor += 2; column += 2; continue;
      } else if (input[cursor + 1] === '=') {
        tokens.push({ type: TokenType.OPERATOR_LTE, value: '<=', line, column, startIndex });
        cursor += 2; column += 2; continue;
      } else if (input[cursor + 1] === '>') {
        tokens.push({ type: TokenType.OPERATOR_NEQ, value: '<>', line, column, startIndex });
        cursor += 2; column += 2; continue;
      }
      tokens.push({ type: TokenType.OPERATOR_LT, value: '<', line, column, startIndex });
      cursor++; column++; continue;
    }
    if (char === '>') {
      if (input[cursor + 1] === '=') {
        tokens.push({ type: TokenType.OPERATOR_GTE, value: '>=', line, column, startIndex });
        cursor += 2; column += 2; continue;
      }
      tokens.push({ type: TokenType.OPERATOR_GT, value: '>', line, column, startIndex });
      cursor++; column++; continue;
    }
    if (char === '=') {
       // In PSeInt, '=' can be assignment or comparison. Context determines. Lexer usually marks as ambiguous or defaults to one.
       // For highlighting, it's fine to treat as a generic operator or comparison.
        tokens.push({ type: TokenType.OPERATOR_EQ, value: '=', line, column, startIndex });
        cursor++; column++; continue;
    }
     if (char === '!' && input[cursor + 1] === '=') {
        tokens.push({ type: TokenType.OPERATOR_NEQ, value: '!=', line, column, startIndex });
        cursor += 2; column += 2; continue;
    }
    if (char === ':') { tokens.push({ type: TokenType.COLON, value: ':', line, column, startIndex }); cursor++; column++; continue; }
    if (char === ';') { tokens.push({ type: TokenType.SEMICOLON, value: ';', line, column, startIndex }); cursor++; column++; continue; }
    if (char === ',') { tokens.push({ type: TokenType.COMMA, value: ',', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '(') { tokens.push({ type: TokenType.LPAREN, value: '(', line, column, startIndex }); cursor++; column++; continue; }
    if (char === ')') { tokens.push({ type: TokenType.RPAREN, value: ')', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '[') { tokens.push({ type: TokenType.LBRACKET, value: '[', line, column, startIndex }); cursor++; column++; continue; }
    if (char === ']') { tokens.push({ type: TokenType.RBRACKET, value: ']', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '+') { tokens.push({ type: TokenType.OPERATOR_PLUS, value: '+', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '-') { tokens.push({ type: TokenType.OPERATOR_MINUS, value: '-', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '*') { tokens.push({ type: TokenType.OPERATOR_MULTIPLY, value: '*', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '/') { tokens.push({ type: TokenType.OPERATOR_DIVIDE, value: '/', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '^') { tokens.push({ type: TokenType.OPERATOR_POWER, value: '^', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '%') { tokens.push({ type: TokenType.OPERATOR_MODULO, value: '%', line, column, startIndex }); cursor++; column++; continue; }


    // Keywords and Identifiers
    if (/[a-zA-Z_áéíóúÁÉÍÓÚñÑ]/.test(char)) {
      let value = '';
      const startColumn = column;
      while (cursor < input.length && /[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]/.test(input[cursor])) {
        value += input[cursor];
        cursor++;
        column++;
      }
      const lowerValue = value.toLowerCase();
      
      // Handle 'HASTA QUE' specifically
      if (lowerValue === 'hasta' && input.substring(cursor).trimStart().toLowerCase().startsWith('que')) {
        const spaceMatch = input.substring(cursor).match(/^(\s*)/);
        const spaces = spaceMatch ? spaceMatch[0] : '';
        const queWord = input.substring(cursor + spaces.length, cursor + spaces.length + 3); // "que"
        if (queWord.toLowerCase() === 'que') {
            tokens.push({ type: TokenType.KEYWORD_HASTAQUE, value: value + spaces + queWord, line, column: startColumn, startIndex });
            cursor += spaces.length + 3;
            column += spaces.length + 3;
            continue;
        }
      }
      // Handle 'CON PASO'
       if (lowerValue === 'con' && input.substring(cursor).trimStart().toLowerCase().startsWith('paso')) {
        const spaceMatch = input.substring(cursor).match(/^(\s*)/);
        const spaces = spaceMatch ? spaceMatch[0] : '';
        const pasoWord = input.substring(cursor + spaces.length, cursor + spaces.length + 4); // "paso"
        if (pasoWord.toLowerCase() === 'paso') {
            tokens.push({ type: TokenType.KEYWORD_CON, value: value + spaces + pasoWord, line, column: startColumn, startIndex }); // Or a combined KEYWORD_CONPASO
            cursor += spaces.length + 4;
            column += spaces.length + 4;
            continue;
        }
      }
      // Handle 'HACER' for 'SEGUN ... HACER' and 'MIENTRAS ... HACER'
      if (lowerValue === 'hacer') {
        // Check previous non-whitespace token if it was SEGUN or MIENTRAS
        let prevTokenMeaningful = null;
        for(let i = tokens.length - 1; i >=0; i--) {
            if(tokens[i].type !== TokenType.WHITESPACE && tokens[i].type !== TokenType.NEWLINE) {
                prevTokenMeaningful = tokens[i];
                break;
            }
        }
        if(prevTokenMeaningful?.type === TokenType.KEYWORD_SEGUN) {
            tokens.push({ type: TokenType.KEYWORD_HACER_SEGUN, value, line, column: startColumn, startIndex });
            continue;
        }
        if(prevTokenMeaningful?.type === TokenType.KEYWORD_MIENTRAS) {
            tokens.push({ type: TokenType.KEYWORD_HACER_MIENTRAS, value, line, column: startColumn, startIndex });
            continue;
        }
      }


      if (KEYWORDS[lowerValue]) {
        tokens.push({ type: KEYWORDS[lowerValue], value: value, line, column: startColumn, startIndex });
      } else if (lowerValue === 'mod') {
        tokens.push({ type: TokenType.OPERATOR_MODULO, value: value, line, column: startColumn, startIndex });
      } else if (lowerValue === 'y' || lowerValue === '&') {
        tokens.push({ type: TokenType.OPERATOR_AND, value: value, line, column: startColumn, startIndex });
      } else if (lowerValue === 'o' || lowerValue === '|') {
        tokens.push({ type: TokenType.OPERATOR_OR, value: value, line, column: startColumn, startIndex });
      } else if (lowerValue === 'no' || lowerValue === '!') {
         tokens.push({ type: TokenType.OPERATOR_NOT, value: value, line, column: startColumn, startIndex });
      }
      else {
        tokens.push({ type: TokenType.IDENTIFIER, value, line, column: startColumn, startIndex });
      }
      continue;
    }
    
    // Unknown characters
    tokens.push({ type: TokenType.UNKNOWN, value: char, line, column, startIndex });
    cursor++;
    column++;
  }

  tokens.push({ type: TokenType.EOF, value: '', line, column, startIndex: cursor });
  return tokens;
}
