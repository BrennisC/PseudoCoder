
import type { Token, ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, NumberLiteralNode, IdentifierNode, ExpressionNode, ASTNode } from './types';
import { TokenType } from './types';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  public parse(tokens: Token[]): ProgramNode {
    this.tokens = tokens;
    this.current = 0;
    const statements: StatementNode[] = [];

    while (!this.isAtEnd()) {
      this.skipIgnoredTokens(); 
      if (this.isAtEnd()) break;

      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      } else {
        const token = this.peek();
        if (token.type !== TokenType.EOF) { // Avoid error on trailing whitespace/comments
            throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Unexpected token '${token.value}' (type: ${token.type}) when expecting a statement.`);
        }
      }
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
    const currentToken = this.peek();
    if (currentToken.type === TokenType.KEYWORD_ESCRIBIR) {
      this.advance(); // Consume KEYWORD_ESCRIBIR
      return this.parseWriteStatement();
    }
    // Future: Add other statement types like IF, WHILE, ASSIGNMENT etc.
    return null; 
  }
  
  private parseExpression(): ExpressionNode | null {
    this.skipIgnoredTokens();
    const token = this.peek();

    if (token.type === TokenType.STRING_LITERAL) {
      this.advance();
      return { type: 'StringLiteral', value: token.value.slice(1, -1) } as StringLiteralNode;
    } else if (token.type === TokenType.NUMBER_LITERAL) {
      this.advance();
      return { type: 'NumberLiteral', value: parseFloat(token.value) } as NumberLiteralNode;
    } else if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return { type: 'Identifier', name: token.value } as IdentifierNode;
    }
    // Future: boolean literals, function calls, binary operations etc.
    return null;
  }

  private parseWriteStatement(): WriteStatementNode {
    const expressions: ExpressionNode[] = [];
    
    const firstExpr = this.parseExpression();
    if (!firstExpr) {
      const token = this.previous().type === TokenType.KEYWORD_ESCRIBIR ? this.peek() : this.previous();
      throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Expected an expression after ESCRIBIR.`);
    }
    expressions.push(firstExpr);

    this.skipIgnoredTokens();
    while (this.check(TokenType.COMMA)) {
      this.advance(); // Consume comma
      const nextExpr = this.parseExpression();
      if (!nextExpr) {
        const token = this.previous().type === TokenType.COMMA ? this.peek() : this.previous();
        throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Expected an expression after comma in ESCRIBIR statement.`);
      }
      expressions.push(nextExpr);
      this.skipIgnoredTokens();
    }
    
    // PSeInt typically doesn't require semicolons, but we can allow them optionally.
    this.skipIgnoredTokens();
    if (this.check(TokenType.SEMICOLON)) {
        this.advance(); // Consume semicolon
    }

    return { type: 'WriteStatement', expressions };
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
    // Consider EOF as the end, but also if current index is out of bounds after skipping.
    if (this.current >= this.tokens.length) return true; 
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
        // Should ideally not happen if isAtEnd is checked correctly, but as a safeguard:
        return this.tokens[this.tokens.length -1]; // Return EOF token
    }
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
