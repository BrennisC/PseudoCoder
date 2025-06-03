
import type { Token, ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, ExpressionNode } from './types';
import { TokenType } from './types';

export class Parser {
  private tokens: Token[] = [];
  private current = 0;

  public parse(tokens: Token[]): ProgramNode {
    this.tokens = tokens;
    this.current = 0;
    const statements: StatementNode[] = [];

    while (!this.isAtEnd()) {
      const statement = this.parseStatement();
      if (statement) {
        statements.push(statement);
      } else if (!this.isAtEnd()){
        // If parseStatement returns null and we are not at end, it means there's an error or unhandled token.
        // Skip to next potential statement start or handle error. For now, simple skip.
        this.advance(); 
      }
    }
    return { type: 'Program', body: statements };
  }

  private parseStatement(): StatementNode | null {
    if (this.match(TokenType.KEYWORD_ESCRIBIR)) {
      return this.parseWriteStatement();
    }
    // Future: Add other statement types like IF, WHILE, ASSIGNMENT etc.
    // If no statement matches, and it's not EOF, it might be an error or an empty line.
    // For simplicity, we'll return null, and the main loop will advance.
    return null;
  }

  private parseWriteStatement(): WriteStatementNode {
    const expressions: ExpressionNode[] = [];
    // PSeInt's ESCRIBIR takes one or more expressions, comma-separated.
    // For now, we only support one string literal.
    if (this.check(TokenType.STRING_LITERAL)) {
      const token = this.advance();
      expressions.push({ type: 'StringLiteral', value: token.value } as StringLiteralNode);
    } else {
      throw new Error(`Parser Error (line ${this.peek().line}, col ${this.peek().column}): Expected a string literal after ESCRIBIR.`);
    }

    // Future: loop for comma and more expressions
    // while (this.match(TokenType.COMMA)) { ... }

    return { type: 'WriteStatement', expressions };
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
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
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
