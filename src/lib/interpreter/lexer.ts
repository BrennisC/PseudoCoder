
import type { Token } from './types';
import { TokenType } from './types';

const KEYWORDS: Record<string, TokenType> = {
  'algoritmo': TokenType.KEYWORD_ALGORITMO,
  'finalgoritmo': TokenType.KEYWORD_FINALGORITMO,
  'proceso': TokenType.KEYWORD_PROCESO,
  'finproceso': TokenType.KEYWORD_FINPROCESO,
  'subproceso': TokenType.KEYWORD_SUBPROCESO,
  'finsubproceso': TokenType.KEYWORD_FINSUBPROCESO,
  'definir': TokenType.KEYWORD_DEFINIR,
  'como': TokenType.KEYWORD_COMO,
  'leer': TokenType.KEYWORD_LEER,
  'escribir': TokenType.KEYWORD_ESCRIBIR,
  'si': TokenType.KEYWORD_SI,
  'entonces': TokenType.KEYWORD_ENTONCES,
  'sino': TokenType.KEYWORD_SINO,
  'finsi': TokenType.KEYWORD_FINSI,
  'segun': TokenType.KEYWORD_SEGUN,
  'deotromodo': TokenType.KEYWORD_DEOTROMODO,
  'finsegun': TokenType.KEYWORD_FINSEGUN,
  'mientras': TokenType.KEYWORD_MIENTRAS,
  'finmientras': TokenType.KEYWORD_FINMIENTRAS,
  'repetir': TokenType.KEYWORD_REPETIR,
  'para': TokenType.KEYWORD_PARA,
  'hasta': TokenType.KEYWORD_HASTA,
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
  'variable': TokenType.KEYWORD_VARIABLE,
  'constante': TokenType.KEYWORD_CONSTANTE,
  'desde': TokenType.KEYWORD_DESDE,
  'hacer': TokenType.KEYWORD_HACER,
  'caso': TokenType.KEYWORD_CASO,
  'de': TokenType.KEYWORD_DE,
  'retornar': TokenType.KEYWORD_RETORNAR,
  'fin': TokenType.KEYWORD_FIN,
  'tipo': TokenType.KEYWORD_TIPO,
  'registro': TokenType.KEYWORD_REGISTRO,
  'arreglo': TokenType.KEYWORD_ARREGLO,
  'procedimiento': TokenType.KEYWORD_PROCEDIMIENTO,
  'finprocedimiento': TokenType.KEYWORD_FINPROCEDIMIENTO,
  'modulo': TokenType.KEYWORD_MODULO,
  'finmodulo': TokenType.KEYWORD_FINMODULO,
  'y': TokenType.KEYWORD_LOGICAL_AND,
  '&': TokenType.KEYWORD_LOGICAL_AND,
  '&&': TokenType.KEYWORD_LOGICAL_AND,
  'o': TokenType.KEYWORD_LOGICAL_OR,
  '|': TokenType.KEYWORD_LOGICAL_OR,
  '||': TokenType.KEYWORD_LOGICAL_OR,
  'no': TokenType.KEYWORD_LOGICAL_NOT,
};

export function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  let line = 1;
  let column = 1;

  while (cursor < input.length) {
    const startIndex = cursor;
    let char = input[cursor];

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
        cursor--; 
      }
      cursor++;
      continue;
    }

    if (char === '/') {
      if (input[cursor + 1] === '/') { // Single-line comment
        let value = '//';
        column += 2;
        cursor += 2;
        while (cursor < input.length && input[cursor] !== '\n') {
          value += input[cursor];
          cursor++;
          column++;
        }
        tokens.push({ type: TokenType.COMMENT, value, line, column: column - value.length, startIndex });
        continue;
      } else if (input[cursor + 1] === '*') { // Multiline comment
        let value = '/*';
        const startColumnComment = column;
        cursor += 2;
        column += 2;
        let commentClosed = false;
        while (cursor < input.length) {
          if (input[cursor] === '*' && input[cursor + 1] === '/') {
            value += '*/';
            cursor += 2;
            column += 2;
            commentClosed = true;
            break;
          }
          if (input[cursor] === '\n') {
            value += '\n';
            line++;
            column = 1;
          } else {
            value += input[cursor];
            column++;
          }
          cursor++;
        }
        // If not closed, it's still treated as a comment up to EOF for highlighting purposes.
        // A full parser might error here, but for highlighting, this is often acceptable.
        tokens.push({ type: TokenType.COMMENT, value, line: commentClosed ? line : line, column: startColumnComment, startIndex });
        continue;
      }
    }


    if (char === '"' || char === "'") {
      const quoteType = char;
      let value = '';
      const startColumn = column;
      cursor++; 
      column++;
      while (cursor < input.length && input[cursor] !== quoteType) {
        if (input[cursor] === '\n') { 
           tokens.push({ type: TokenType.UNKNOWN, value: quoteType + value, line, column: startColumn, startIndex });
           break; 
        }
        value += input[cursor];
        cursor++;
        column++;
      }
      if (cursor < input.length && input[cursor] === quoteType) {
        cursor++; 
        column++;
        tokens.push({ type: TokenType.STRING_LITERAL, value: quoteType + value + quoteType, line, column: startColumn, startIndex });
      } else { 
        tokens.push({ type: TokenType.UNKNOWN, value: quoteType + value, line, column: startColumn, startIndex });
      }
      continue;
    }

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
        tokens.push({ type: TokenType.OPERATOR_EQ, value: '=', line, column, startIndex });
        cursor++; column++; continue;
    }
     if (char === '!' && input[cursor + 1] === '=') {
        tokens.push({ type: TokenType.OPERATOR_NEQ, value: '!=', line, column, startIndex });
        cursor += 2; column += 2; continue;
    }
    if (char === '!') {
        tokens.push({ type: TokenType.KEYWORD_LOGICAL_NOT, value: '!', line, column, startIndex });
        cursor++; column++; continue;
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
    // Check for '/' as part of comment handled above
    if (char === '/' && !(input[cursor+1] === '/' || input[cursor+1] === '*')) { 
        tokens.push({ type: TokenType.OPERATOR_DIVIDE, value: '/', line, column, startIndex }); 
        cursor++; column++; continue; 
    }
    if (char === '^') { tokens.push({ type: TokenType.OPERATOR_POWER, value: '^', line, column, startIndex }); cursor++; column++; continue; }
    if (char === '%') { tokens.push({ type: TokenType.OPERATOR_MODULO, value: '%', line, column, startIndex }); cursor++; column++; continue; }


    if (/[a-zA-Z_áéíóúÁÉÍÓÚñÑ]/.test(char)) {
      let value = '';
      const startColumn = column;
      while (cursor < input.length && /[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]/.test(input[cursor])) {
        value += input[cursor];
        cursor++;
        column++;
      }
      const lowerValue = value.toLowerCase();
      
      if (lowerValue === 'hasta' && input.substring(cursor).trimStart().toLowerCase().startsWith('que')) {
        const spaceMatch = input.substring(cursor).match(/^(\s*)/);
        const spaces = spaceMatch ? spaceMatch[0] : '';
        const queWord = input.substring(cursor + spaces.length, cursor + spaces.length + 3); 
        if (queWord.toLowerCase() === 'que') {
            tokens.push({ type: TokenType.KEYWORD_HASTAQUE, value: value + spaces + queWord, line, column: startColumn, startIndex });
            cursor += spaces.length + 3;
            column += spaces.length + 3;
            continue;
        }
      }
       if (lowerValue === 'con' && input.substring(cursor).trimStart().toLowerCase().startsWith('paso')) {
        const spaceMatch = input.substring(cursor).match(/^(\s*)/);
        const spaces = spaceMatch ? spaceMatch[0] : '';
        const pasoWord = input.substring(cursor + spaces.length, cursor + spaces.length + 4); 
        if (pasoWord.toLowerCase() === 'paso') {
            tokens.push({ type: TokenType.KEYWORD_CON, value: value + spaces + pasoWord, line, column: startColumn, startIndex }); 
            cursor += spaces.length + 4;
            column += spaces.length + 4;
            continue;
        }
      }
      if (lowerValue === 'por' && input.substring(cursor).trimStart().toLowerCase().startsWith('referencia')) {
        const spaceMatch = input.substring(cursor).match(/^(\s*)/);
        const spaces = spaceMatch ? spaceMatch[0] : '';
        const referenciaWord = input.substring(cursor + spaces.length, cursor + spaces.length + "referencia".length);
        if (referenciaWord.toLowerCase() === 'referencia') {
            tokens.push({ type: TokenType.KEYWORD_POR_REFERENCIA, value: value + spaces + referenciaWord, line, column: startColumn, startIndex });
            cursor += spaces.length + "referencia".length;
            column += spaces.length + "referencia".length;
            continue;
        }
      }

      if (lowerValue === 'hacer') {
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
      }
      else {
        tokens.push({ type: TokenType.IDENTIFIER, value, line, column: startColumn, startIndex });
      }
      continue;
    }
    
    tokens.push({ type: TokenType.UNKNOWN, value: char, line, column, startIndex });
    cursor++;
    column++;
  }

  tokens.push({ type: TokenType.EOF, value: '', line, column, startIndex: cursor });
  return tokens;
}
