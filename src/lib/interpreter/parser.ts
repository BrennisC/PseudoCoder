
import type { Token, ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, NumberLiteralNode, IdentifierNode, ExpressionNode, ProcesoBlockNode, ReadStatementNode, AssignmentStatementNode, BooleanLiteralNode, BinaryExpressionNode, DefineStatementNode, MientrasStatementNode } from './types';
import { TokenType } from './types';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  public parse(tokens: Token[]): ProgramNode {
    // Filter out whitespace and comments, as they are generally not syntactically significant for PSeInt's structure
    // Newlines can be significant for statement termination if semicolons are omitted.
    this.tokens = tokens.filter(token => token.type !== TokenType.WHITESPACE && token.type !== TokenType.COMMENT);
    this.current = 0;
    const statements: StatementNode[] = [];

    this.skipNewlines(); // Skip any leading newlines

    if (this.check(TokenType.KEYWORD_PROCESO) || this.check(TokenType.KEYWORD_ALGORITMO)) {
      statements.push(this.parseProcesoOrAlgoritmoBlock());
    } else {
      const token = this.peek();
      if (token.type === TokenType.EOF) {
        throw new Error(`Parser Error: El archivo está vacío. Se esperaba 'Proceso' o 'Algoritmo'.`);
      }
      throw new Error(`Parser Error (line ${token.line}, col ${token.column}): El programa debe comenzar con 'Proceso' o 'Algoritmo'. Se encontró '${token.value}'.`);
    }
    
    this.skipNewlines(); 
    if (!this.isAtEnd()) {
        const token = this.peek();
        throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Se encontró un token inesperado '${token.value}' después del bloque principal del programa ('FinProceso' o 'FinAlgoritmo').`);
    }

    return { type: 'Program', body: statements };
  }

  private skipNewlines(): void {
    while (!this.isAtEnd() && this.check(TokenType.NEWLINE)) {
      this.advance();
    }
  }
  
  private parseStatement(): StatementNode | null {
    this.skipNewlines(); 
    const currentToken = this.peek();
    
    if (currentToken.type === TokenType.KEYWORD_ESCRIBIR) {
      return this.parseWriteStatement();
    } else if (currentToken.type === TokenType.KEYWORD_LEER) {
      return this.parseReadStatement();
    } else if (currentToken.type === TokenType.KEYWORD_DEFINIR) {
      return this.parseDefineStatement();
    } else if (currentToken.type === TokenType.KEYWORD_MIENTRAS) {
      return this.parseMientrasStatement();
    } else if (currentToken.type === TokenType.IDENTIFIER) {
        const nextToken = this.peekNextNonNewline(); // Check what follows the identifier
        if (nextToken && nextToken.type === TokenType.OPERATOR_ASSIGN) {
            const identifierToken = this.advance(); 
            const identifierNode: IdentifierNode = { type: 'Identifier', name: identifierToken.value, line: identifierToken.line, column: identifierToken.column };
            return this.parseAssignmentStatement(identifierNode);
        }
        // Later, add procedure call parsing here if IDENTIFIER is not followed by <-
        // For now, if it's just an IDENTIFIER, it's likely an error or an unimplemented feature.
    }
    return null; 
  }

  private parseDefineStatement(): DefineStatementNode {
    const defineToken = this.consume(TokenType.KEYWORD_DEFINIR, "Error interno: Se esperaba DEFINIR."); 
    const identifiers: IdentifierNode[] = [];
    
    this.skipNewlines();
    do {
        this.skipNewlines();
        const idToken = this.consume(TokenType.IDENTIFIER, `Se esperaba un identificador después de 'Definir' o una coma.`);
        identifiers.push({ type: 'Identifier', name: idToken.value, line: idToken.line, column: idToken.column });
        this.skipNewlines();
    } while (this.match(TokenType.COMMA));

    this.skipNewlines();
    this.consume(TokenType.KEYWORD_COMO, "Se esperaba la palabra clave 'Como' en la instrucción 'Definir'.");
    
    this.skipNewlines();
    const dataTypeToken = this.advance(); 
    if (![TokenType.KEYWORD_ENTERO, TokenType.KEYWORD_REAL, TokenType.KEYWORD_NUMERO, TokenType.KEYWORD_LOGICO, TokenType.KEYWORD_CARACTER, TokenType.KEYWORD_TEXTO, TokenType.KEYWORD_CADENA, TokenType.IDENTIFIER].includes(dataTypeToken.type)) {
      throw new Error(`Parser Error (line ${dataTypeToken.line}, col ${dataTypeToken.column}): Se esperaba un tipo de dato (Ej: Entero, Real, Logico, Caracter, Texto, Cadena) después de 'Como'. Se encontró '${dataTypeToken.value}'.`);
    }
    const dataTypeNode: IdentifierNode = { type: 'Identifier', name: dataTypeToken.value, line: dataTypeToken.line, column: dataTypeToken.column };

    this.consumeOptionalSemicolonOrNewline();
    return { type: 'DefineStatement', identifiers, dataType: dataTypeNode, line: defineToken.line, column: defineToken.column };
  }
  
  private parseAssignmentStatement(identifier: IdentifierNode): AssignmentStatementNode {
    const assignToken = this.consume(TokenType.OPERATOR_ASSIGN, "Se esperaba el operador de asignación '<-'.");
    this.skipNewlines();
    const expression = this.parseExpression();
    if (!expression) {
      throw new Error(`Parser Error (line ${assignToken.line}, col ${assignToken.column + assignToken.value.length}): Se esperaba una expresión después del operador de asignación '<-'.`);
    }
    this.consumeOptionalSemicolonOrNewline();
    return { type: 'AssignmentStatement', identifier, expression, line: identifier.line, column: identifier.column };
  }

  private parseReadStatement(): ReadStatementNode {
    const readToken = this.consume(TokenType.KEYWORD_LEER, "Error interno: Se esperaba LEER."); 
    const identifiers: IdentifierNode[] = [];
    
    this.skipNewlines();
    do {
        this.skipNewlines();
        const idToken = this.consume(TokenType.IDENTIFIER, `Se esperaba un identificador de variable después de 'Leer' o una coma.`);
        identifiers.push({ type: 'Identifier', name: idToken.value, line: idToken.line, column: idToken.column });
        this.skipNewlines();
    } while (this.match(TokenType.COMMA));

    this.consumeOptionalSemicolonOrNewline();
    return { type: 'ReadStatement', identifiers, line: readToken.line, column: readToken.column };
  }

  private parseMientrasStatement(): MientrasStatementNode {
    const mientrasToken = this.consume(TokenType.KEYWORD_MIENTRAS, "Error interno: se esperaba MIENTRAS."); 
    
    this.skipNewlines();
    const condition = this.parseExpression();
    if (!condition) {
      throw new Error(`Parser Error (line ${mientrasToken.line}, col ${mientrasToken.column + mientrasToken.value.length}): Se esperaba una condición después de 'Mientras'.`);
    }

    this.skipNewlines();
    this.consume(TokenType.KEYWORD_HACER_MIENTRAS, "Se esperaba la palabra clave 'Hacer' después de la condición en la instrucción 'Mientras'.");

    const body: StatementNode[] = [];
    this.skipNewlines(); // Skip newlines before the body statements

    while (!this.isAtEnd() && !this.check(TokenType.KEYWORD_FINMIENTRAS)) {
      const statement = this.parseStatement();
      if (statement) {
        body.push(statement);
      } else {
        this.skipNewlines(); 
        if (this.isAtEnd() || this.check(TokenType.KEYWORD_FINMIENTRAS)) {
          break; 
        }
        const nextToken = this.peek();
        throw new Error(`Parser Error (line ${nextToken.line}, col ${nextToken.column}): Token inesperado '${nextToken.value}' (tipo: ${nextToken.type}) dentro del bloque 'Mientras'. Se esperaba una instrucción válida o 'FinMientras'.`);
      }
      // parseStatement itself should handle consuming its trailing newline/semicolon
    }

    this.skipNewlines(); // Skip newlines before FinMientras
    this.consume(TokenType.KEYWORD_FINMIENTRAS, "Se esperaba la palabra clave 'FinMientras' para cerrar el bloque 'Mientras'.");
    this.consumeOptionalSemicolonOrNewline(); // FinMientras can also be followed by ; or newline
    return { type: 'MientrasStatement', condition, body, line: mientrasToken.line, column: mientrasToken.column };
  }

  private parseExpression(): ExpressionNode | null {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): ExpressionNode | null {
    this.skipNewlines();
    let left = this.parseMultiplicativeExpression();
    if (!left) return null;

    this.skipNewlines();
    while (this.check(TokenType.OPERATOR_PLUS) || this.check(TokenType.OPERATOR_MINUS)) {
      const operatorToken = this.advance(); 
      const operator = operatorToken.type;
      this.skipNewlines();
      const right = this.parseMultiplicativeExpression();
      if (!right) {
        throw new Error(`Parser Error (line ${operatorToken.line}, col ${operatorToken.column + operatorToken.value.length}): Se esperaba una expresión después del operador '${operatorToken.value}'.`);
      }
      left = { type: 'BinaryExpression', left, operator, right, line: left.line, column: left.column } as BinaryExpressionNode;
      this.skipNewlines();
    }
    return left;
  }

  private parseMultiplicativeExpression(): ExpressionNode | null {
    this.skipNewlines();
    let left = this.parsePrimaryExpression();
    if (!left) return null;

    this.skipNewlines();
    while (this.check(TokenType.OPERATOR_MULTIPLY) || this.check(TokenType.OPERATOR_DIVIDE) || this.check(TokenType.OPERATOR_MODULO)) {
      const operatorToken = this.advance(); 
      const operator = operatorToken.type;
      this.skipNewlines();
      const right = this.parsePrimaryExpression();
      if (!right) {
        throw new Error(`Parser Error (line ${operatorToken.line}, col ${operatorToken.column + operatorToken.value.length}): Se esperaba una expresión después del operador '${operatorToken.value}'.`);
      }
      left = { type: 'BinaryExpression', left, operator, right, line: left.line, column: left.column } as BinaryExpressionNode;
      this.skipNewlines();
    }
    return left;
  }

  private parsePrimaryExpression(): ExpressionNode | null {
    this.skipNewlines();
    const token = this.peek();

    if (token.type === TokenType.STRING_LITERAL) {
      this.advance();
      let value = token.value;
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      return { type: 'StringLiteral', value: value, line: token.line, column: token.column } as StringLiteralNode;
    } else if (token.type === TokenType.NUMBER_LITERAL) {
      this.advance();
      return { type: 'NumberLiteral', value: parseFloat(token.value), line: token.line, column: token.column } as NumberLiteralNode;
    } else if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: 'Identifier', name: token.value, line: token.line, column: token.column } as IdentifierNode;
    } else if (token.type === TokenType.KEYWORD_VERDADERO) {
      this.advance();
      return { type: 'BooleanLiteral', value: true, line: token.line, column: token.column } as BooleanLiteralNode;
    } else if (token.type === TokenType.KEYWORD_FALSO) {
      this.advance();
      return { type: 'BooleanLiteral', value: false, line: token.line, column: token.column } as BooleanLiteralNode;
    } else if (this.check(TokenType.LPAREN)) {
      this.advance(); 
      this.skipNewlines();
      const expr = this.parseExpression();
      this.skipNewlines();
      this.consume(TokenType.RPAREN, "Se esperaba ')' después de la expresión entre paréntesis.");
      return expr;
    }
    return null;
  }

  private parseWriteStatement(): WriteStatementNode {
    const writeToken = this.consume(TokenType.KEYWORD_ESCRIBIR, "Error interno: Se esperaba ESCRIBIR."); 
    const expressions: ExpressionNode[] = [];
    
    this.skipNewlines();
    const firstExpr = this.parseExpression();
    if (!firstExpr) {
      const token = this.previous().type === TokenType.KEYWORD_ESCRIBIR ? this.peek() : this.previous();
      throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Se esperaba una expresión después de 'Escribir'.`);
    }
    expressions.push(firstExpr);

    this.skipNewlines();
    while (this.match(TokenType.COMMA)) {
      this.skipNewlines();
      const nextExpr = this.parseExpression();
      if (!nextExpr) {
        const token = this.previous().type === TokenType.COMMA ? this.peek() : this.previous();
        throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Se esperaba una expresión después de la coma en la instrucción 'Escribir'.`);
      }
      expressions.push(nextExpr);
      this.skipNewlines();
    }
    
    this.consumeOptionalSemicolonOrNewline();
    return { type: 'WriteStatement', expressions, line: writeToken.line, column: writeToken.column };
  }

  private parseProcesoOrAlgoritmoBlock(): ProcesoBlockNode {
    const blockTypeToken = this.advance(); 
    
    this.skipNewlines();
    const nameToken = this.consume(TokenType.IDENTIFIER, `Se esperaba un nombre (identificador) después de '${blockTypeToken.value}'.`);
    const processNameNode: IdentifierNode = { type: 'Identifier', name: nameToken.value, line: nameToken.line, column: nameToken.column };
  
    const body: StatementNode[] = [];
    // Newlines after Proceso Name are significant before the first statement
    this.skipNewlines(); 
  
    const endTokenType = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? TokenType.KEYWORD_FINPROCESO : TokenType.KEYWORD_FINALGORITMO;
    const endKeywordValue = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? 'FinProceso' : 'FinAlgoritmo';

    while (!this.isAtEnd() && !this.check(endTokenType)) {
      const statement = this.parseStatement(); // parseStatement now handles its leading newlines
      if (statement) {
        body.push(statement);
        // parseStatement should also handle its own trailing newline/semicolon
      } else {
        this.skipNewlines(); 
        if (this.isAtEnd() || this.check(endTokenType)) {
          break; 
        }
        const nextToken = this.peek();
        throw new Error(`Parser Error (line ${nextToken.line}, col ${nextToken.column}): Token inesperado '${nextToken.value}' (tipo: ${nextToken.type}) dentro del bloque '${blockTypeToken.value}'. Se esperaba una instrucción válida.`);
      }
    }
  
    this.skipNewlines(); // Skip newlines before FinProceso/FinAlgoritmo
    this.consume(endTokenType, `Se esperaba '${endKeywordValue}' para finalizar el bloque '${blockTypeToken.value}'.`);
    this.consumeOptionalSemicolonOrNewline(); // FinProceso/Algoritmo can also be followed by ; or newline
  
    return { type: 'ProcesoBlock', name: processNameNode, body, line: blockTypeToken.line, column: blockTypeToken.column };
  }

  private consumeOptionalSemicolonOrNewline(): void {
    this.skipNewlines(); // Prefer consuming newlines first if present
    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
      this.skipNewlines(); // Also skip newlines after a semicolon
    } else if (!this.isAtEnd() && !this.isNextTokenAValidStatementStartOrBlockEnd()) {
      // If there's no semicolon and no newline (already skipped),
      // and the next token isn't something that can start a new statement or end a block,
      // it might be an error depending on PSeInt's strictness.
      // For now, we are more lenient and assume newline was sufficient or implied.
    }
  }

  private isNextTokenAValidStatementStartOrBlockEnd(): boolean {
    const tokenType = this.peek().type;
    return [
        TokenType.KEYWORD_ESCRIBIR, TokenType.KEYWORD_LEER, TokenType.KEYWORD_DEFINIR,
        TokenType.KEYWORD_MIENTRAS, TokenType.IDENTIFIER, // Add other statement starters
        TokenType.KEYWORD_FINPROCESO, TokenType.KEYWORD_FINALGORITMO, 
        TokenType.KEYWORD_FINMIENTRAS, // Add other Fin... keywords
        TokenType.EOF
    ].includes(tokenType);
}


  private match(...types: TokenType[]): boolean {
    // skipNewlines() should be called before match if newlines are to be ignored before the token
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    // skipNewlines() should be called before consume if newlines are to be ignored
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new Error(`Parser Error (line ${token.line}, col ${token.column}): ${message} Se encontró '${token.value}' (tipo: ${token.type}) en su lugar.`);
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.tokens[this.current].type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
      const lastKnownToken = this.tokens.length > 0 ? this.tokens[this.tokens.length - 1] : null;
      return { type: TokenType.EOF, value: '', line: lastKnownToken ? lastKnownToken.line : 1, column: lastKnownToken ? lastKnownToken.column + 1 : 1, startIndex: lastKnownToken ? lastKnownToken.startIndex + 1 : 0 };
    }
    return this.tokens[this.current];
  }

  private peekNextNonNewline(): Token | null {
    let lookahead = this.current + 1;
    while (lookahead < this.tokens.length) {
        const tokenType = this.tokens[lookahead].type;
        if (tokenType === TokenType.NEWLINE) { // Only skip newlines here
            lookahead++;
        } else {
            return this.tokens[lookahead]; // Return the first non-newline token
        }
    }
    return null; // Reached end or only found newlines
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
