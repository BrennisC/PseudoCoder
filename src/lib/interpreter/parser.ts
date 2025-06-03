
import type { Token, ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, NumberLiteralNode, IdentifierNode, ExpressionNode, ProcesoBlockNode, ReadStatementNode, AssignmentStatementNode, BooleanLiteralNode, BinaryExpressionNode, DefineStatementNode } from './types';
import { TokenType } from './types';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  public parse(tokens: Token[]): ProgramNode {
    this.tokens = tokens;
    this.current = 0;
    const statements: StatementNode[] = [];

    // PSeInt programs typically start with Proceso or Algoritmo
    this.skipIgnoredTokens();
    if (this.check(TokenType.KEYWORD_PROCESO) || this.check(TokenType.KEYWORD_ALGORITMO)) {
      statements.push(this.parseProcesoOrAlgoritmoBlock());
    } else if (!this.isAtEnd()) {
      // Allow other statements if not starting with Proceso/Algoritmo for simpler examples,
      // but a full PSeInt program requires it.
      // For now, to fix the immediate error, we expect Proceso/Algoritmo first.
      const token = this.peek();
      throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Program must start with 'Proceso' or 'Algoritmo'. Found '${token.value}'.`);
    }
    
    // Check for any trailing tokens that are not EOF after the main block
    this.skipIgnoredTokens();
    if (!this.isAtEnd()) {
        const token = this.peek();
        throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Unexpected token '${token.value}' after the main program block.`);
    }

    return { type: 'Program', body: statements };
  }

  private skipIgnoredTokens(): void {
    while (!this.isAtEnd() &&
           (this.check(TokenType.WHITESPACE) ||
            this.check(TokenType.NEWLINE) ||
            this.check(TokenType.COMMENT))) {
      this.advance();
    }
  }

  private parseStatement(): StatementNode | null {
    this.skipIgnoredTokens(); 
    const currentToken = this.peek();
    
    if (currentToken.type === TokenType.KEYWORD_ESCRIBIR) {
      return this.parseWriteStatement();
    } else if (currentToken.type === TokenType.KEYWORD_LEER) {
      return this.parseReadStatement();
    } else if (currentToken.type === TokenType.KEYWORD_DEFINIR) {
      return this.parseDefineStatement();
    } else if (currentToken.type === TokenType.IDENTIFIER && this.peekNext()?.type === TokenType.OPERATOR_ASSIGN) {
      const identifierToken = this.advance(); // Consume IDENTIFIER
      const identifierNode: IdentifierNode = { type: 'Identifier', name: identifierToken.value, line: identifierToken.line, column: identifierToken.column };
      return this.parseAssignmentStatement(identifierNode);
    }
    // Add parsing for other statements here: Si, Mientras, Para, etc.

    return null; 
  }

  private parseDefineStatement(): DefineStatementNode {
    const defineToken = this.advance(); // Consume DEFINIR
    const identifiers: IdentifierNode[] = [];
    
    do {
        this.skipIgnoredTokens();
        const idToken = this.consume(TokenType.IDENTIFIER, `Expected identifier after 'Definir' or comma.`);
        identifiers.push({ type: 'Identifier', name: idToken.value, line: idToken.line, column: idToken.column });
        this.skipIgnoredTokens();
    } while (this.match(TokenType.COMMA));

    this.skipIgnoredTokens();
    this.consume(TokenType.KEYWORD_COMO, "Expected 'Como' in 'Definir' statement.");
    
    this.skipIgnoredTokens();
    // For now, treat data type as an identifier. Later, this could be more specific.
    const dataTypeToken = this.consume(TokenType.IDENTIFIER, "Expected data type after 'Como'."); 
    const dataTypeNode: IdentifierNode = { type: 'Identifier', name: dataTypeToken.value, line: dataTypeToken.line, column: dataTypeToken.column };

    this.skipIgnoredTokens();
    if (this.match(TokenType.SEMICOLON)) {
        // Optional semicolon
    }
    return { type: 'DefineStatement', identifiers, dataType: dataTypeNode, line: defineToken.line, column: defineToken.column };
  }
  
  private parseAssignmentStatement(identifier: IdentifierNode): AssignmentStatementNode {
    const assignToken = this.consume(TokenType.OPERATOR_ASSIGN, "Expected '<-' for assignment.");
    const expression = this.parseExpression();
    if (!expression) {
      throw new Error(`Parser Error (line ${assignToken.line}, col ${assignToken.column + assignToken.value.length}): Expected an expression after '<-'.`);
    }
    this.skipIgnoredTokens();
    if (this.match(TokenType.SEMICOLON)) {
        // Optional semicolon
    }
    return { type: 'AssignmentStatement', identifier, expression, line: identifier.line, column: identifier.column };
  }

  private parseReadStatement(): ReadStatementNode {
    const readToken = this.advance(); // Consume LEER
    const identifiers: IdentifierNode[] = [];
    
    do {
        this.skipIgnoredTokens();
        const idToken = this.consume(TokenType.IDENTIFIER, `Expected identifier after 'Leer' or comma.`);
        identifiers.push({ type: 'Identifier', name: idToken.value, line: idToken.line, column: idToken.column });
        this.skipIgnoredTokens();
    } while (this.match(TokenType.COMMA));

    this.skipIgnoredTokens();
    if (this.match(TokenType.SEMICOLON)) {
        // Optional semicolon
    }
    return { type: 'ReadStatement', identifiers, line: readToken.line, column: readToken.column };
  }

  private parseExpression(): ExpressionNode | null {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): ExpressionNode | null {
    let left = this.parseMultiplicativeExpression();
    if (!left) return null;

    this.skipIgnoredTokens();
    while (this.match(TokenType.OPERATOR_PLUS, TokenType.OPERATOR_MINUS)) {
      const operatorToken = this.previous();
      const operator = operatorToken.type;
      const right = this.parseMultiplicativeExpression();
      if (!right) {
        throw new Error(`Parser Error (line ${operatorToken.line}, col ${operatorToken.column + operatorToken.value.length}): Expected expression after '${operatorToken.value}'.`);
      }
      left = { type: 'BinaryExpression', left, operator, right, line: left.line, column: left.column } as BinaryExpressionNode;
      this.skipIgnoredTokens();
    }
    return left;
  }

  private parseMultiplicativeExpression(): ExpressionNode | null {
    let left = this.parsePrimaryExpression();
    if (!left) return null;

    this.skipIgnoredTokens();
    while (this.match(TokenType.OPERATOR_MULTIPLY, TokenType.OPERATOR_DIVIDE, TokenType.OPERATOR_MODULO)) {
      const operatorToken = this.previous();
      const operator = operatorToken.type;
      const right = this.parsePrimaryExpression();
      if (!right) {
        throw new Error(`Parser Error (line ${operatorToken.line}, col ${operatorToken.column + operatorToken.value.length}): Expected expression after '${operatorToken.value}'.`);
      }
      left = { type: 'BinaryExpression', left, operator, right, line: left.line, column: left.column } as BinaryExpressionNode;
      this.skipIgnoredTokens();
    }
    return left;
  }

  private parsePrimaryExpression(): ExpressionNode | null {
    this.skipIgnoredTokens();
    const token = this.peek();

    if (token.type === TokenType.STRING_LITERAL) {
      this.advance();
      return { type: 'StringLiteral', value: token.value.slice(1, -1), line: token.line, column: token.column } as StringLiteralNode;
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
    } else if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression.");
      return expr;
    }
    // Allow expressions to be null if no primary expression found (e.g. end of input)
    return null;
  }

  private parseWriteStatement(): WriteStatementNode {
    const writeToken = this.advance(); // Consume KEYWORD_ESCRIBIR
    const expressions: ExpressionNode[] = [];
    
    const firstExpr = this.parseExpression();
    if (!firstExpr) {
      const token = this.previous().type === TokenType.KEYWORD_ESCRIBIR ? this.peek() : this.previous();
      throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Expected an expression after ESCRIBIR.`);
    }
    expressions.push(firstExpr);

    this.skipIgnoredTokens();
    while (this.match(TokenType.COMMA)) {
      // this.advance(); // Consume comma - match already does this
      const nextExpr = this.parseExpression();
      if (!nextExpr) {
        const token = this.previous().type === TokenType.COMMA ? this.peek() : this.previous();
        throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Expected an expression after comma in ESCRIBIR statement.`);
      }
      expressions.push(nextExpr);
      this.skipIgnoredTokens();
    }
    
    this.skipIgnoredTokens();
    if (this.match(TokenType.SEMICOLON)) {
        // Optional semicolon
    }

    return { type: 'WriteStatement', expressions, line: writeToken.line, column: writeToken.column };
  }

  private parseProcesoOrAlgoritmoBlock(): ProcesoBlockNode {
    const blockTypeToken = this.advance(); // Consume Proceso or Algoritmo
    
    this.skipIgnoredTokens();
    const nameToken = this.consume(TokenType.IDENTIFIER, `Expected an identifier (name) after ${blockTypeToken.value}.`);
    const processNameNode: IdentifierNode = { type: 'Identifier', name: nameToken.value, line: nameToken.line, column: nameToken.column };
  
    const body: StatementNode[] = [];
    this.skipIgnoredTokens();
  
    const endTokenType = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? TokenType.KEYWORD_FINPROCESO : TokenType.KEYWORD_FINALGORITMO;
    const endKeywordValue = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? 'FinProceso' : 'FinAlgoritmo';

    while (!this.isAtEnd() && !this.check(endTokenType)) {
      const statement = this.parseStatement();
      if (statement) {
        body.push(statement);
      } else {
        this.skipIgnoredTokens();
        if (this.isAtEnd() || this.check(endTokenType)) {
          break; 
        }
        const nextToken = this.peek();
        if (nextToken.type !== TokenType.EOF && nextToken.type !== TokenType.WHITESPACE && nextToken.type !== TokenType.NEWLINE && nextToken.type !== TokenType.COMMENT) {
             throw new Error(`Parser Error (line ${nextToken.line}, col ${nextToken.column}): Unexpected token '${nextToken.value}' (type: ${nextToken.type}) inside ${blockTypeToken.value} block. Expected a statement.`);
        }
        if (!this.isAtEnd()) this.advance(); 
      }
      this.skipIgnoredTokens(); 
    }
  
    if (this.isAtEnd() && !this.check(endTokenType)) { 
      throw new Error(`Parser Error (line ${blockTypeToken.line}, col ${blockTypeToken.column}): Unexpected end of input. Expected '${endKeywordValue}'.`);
    }
  
    this.consume(endTokenType, `Expected '${endKeywordValue}'.`);
  
    return { type: 'ProcesoBlock', name: processNameNode, body, line: blockTypeToken.line, column: blockTypeToken.column };
  }

  private match(...types: TokenType[]): boolean {
    this.skipIgnoredTokens();
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    this.skipIgnoredTokens();
    if (this.check(type)) return this.advance();
    const token = this.peek();
    throw new Error(`Parser Error (line ${token.line}, col ${token.column}): ${message} Found '${token.value}' (type: ${token.type}) instead.`);
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
    // Consider EOF as the end, or if current is past the last actual token
    if (this.current >= this.tokens.length) return true; 
    return this.tokens[this.current].type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
      // Return the last token if out of bounds (should be EOF)
      return this.tokens[this.tokens.length - 1]; 
    }
    return this.tokens[this.current];
  }
   private peekNext(): Token | null {
    if (this.current + 1 >= this.tokens.length) {
      return null;
    }
    // Skip ignored tokens to find the next meaningful token
    let lookahead = this.current + 1;
    while (lookahead < this.tokens.length &&
           (this.tokens[lookahead].type === TokenType.WHITESPACE ||
            this.tokens[lookahead].type === TokenType.NEWLINE ||
            this.tokens[lookahead].type === TokenType.COMMENT)) {
      lookahead++;
    }
    if (lookahead >= this.tokens.length) return null;
    return this.tokens[lookahead];
  }


  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
