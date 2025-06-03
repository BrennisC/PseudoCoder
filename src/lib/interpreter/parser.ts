
import type { Token, ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, NumberLiteralNode, IdentifierNode, ExpressionNode, ProcesoBlockNode } from './types';
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
        // Avoid error on trailing whitespace/comments or if parseStatement correctly returns null for an empty line.
        if (token.type !== TokenType.EOF && 
            token.type !== TokenType.WHITESPACE && 
            token.type !== TokenType.NEWLINE && 
            token.type !== TokenType.COMMENT) {
            throw new Error(`Parser Error (line ${token.line}, col ${token.column}): Unexpected token '${token.value}' (type: ${token.type}) when expecting a statement or block definition.`);
        }
        // If it was just an ignored token and we are not at EOF, advance past it.
        if (token.type !== TokenType.EOF) {
            this.advance();
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
    this.skipIgnoredTokens(); // Skip at the beginning of parsing any statement
    const currentToken = this.peek();
    
    if (currentToken.type === TokenType.KEYWORD_ESCRIBIR) {
      this.advance(); // Consume KEYWORD_ESCRIBIR
      return this.parseWriteStatement();
    } else if (currentToken.type === TokenType.KEYWORD_PROCESO || currentToken.type === TokenType.KEYWORD_ALGORITMO) {
      return this.parseProcesoOrAlgoritmoBlock();
    }
    
    // If we reach here and it's not EOF, it might be an empty line that was skipped,
    // or an actual unhandled token which will be caught by the main loop.
    // It's important that parseStatement can return null for "non-statements" like empty lines.
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
    
    this.skipIgnoredTokens();
    if (this.check(TokenType.SEMICOLON)) {
        this.advance(); 
    }

    return { type: 'WriteStatement', expressions };
  }

  private parseProcesoOrAlgoritmoBlock(): ProcesoBlockNode {
    const blockTypeToken = this.advance(); // Consume Proceso or Algoritmo
    
    this.skipIgnoredTokens();
    const nameToken = this.peek();
    if (nameToken.type !== TokenType.IDENTIFIER) {
      throw new Error(`Parser Error (line ${nameToken.line}, col ${nameToken.column}): Expected an identifier (name) after ${blockTypeToken.value}.`);
    }
    this.advance(); // Consume identifier
    const processNameNode: IdentifierNode = { type: 'Identifier', name: nameToken.value };
  
    const body: StatementNode[] = [];
    this.skipIgnoredTokens();
  
    const endTokenType = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? TokenType.KEYWORD_FINPROCESO : TokenType.KEYWORD_FINALGORITMO;
    const endKeywordValue = blockTypeToken.type === TokenType.KEYWORD_PROCESO ? 'FinProceso' : 'FinAlgoritmo';

    while (!this.isAtEnd() && !this.check(endTokenType)) {
      const statement = this.parseStatement();
      if (statement) {
        body.push(statement);
      } else {
        // If parseStatement returns null, it means it encountered something it couldn't parse as a statement.
        // We need to skip ignored tokens again or check if we are at the end of the block.
        this.skipIgnoredTokens();
        if (this.isAtEnd() || this.check(endTokenType)) {
          break; // Reached end of block or file
        }
        // If not end of block and parseStatement returned null, there's an unexpected token.
        const nextToken = this.peek();
        // Only throw error if it's not something skippable by the next iteration's skipIgnoredTokens
        if (nextToken.type !== TokenType.WHITESPACE && nextToken.type !== TokenType.NEWLINE && nextToken.type !== TokenType.COMMENT) {
             throw new Error(`Parser Error (line ${nextToken.line}, col ${nextToken.column}): Unexpected token '${nextToken.value}' (type: ${nextToken.type}) inside ${blockTypeToken.value} block.`);
        }
        this.advance(); // Cautiously advance to prevent infinite loops on unknown constructs.
      }
      this.skipIgnoredTokens(); // Skip tokens after a successfully parsed statement
    }
  
    if (this.isAtEnd() && !this.check(endTokenType)) { // Check if EOF reached before finding end keyword
      throw new Error(`Parser Error: Unexpected end of input. Expected '${endKeywordValue}'.`);
    }
  
    if (!this.check(endTokenType)) {
        const t = this.peek();
        throw new Error(`Parser Error (line ${t.line}, col ${t.column}): Expected '${endKeywordValue}' but found '${t.value}'.`);
    }
    this.advance(); // Consume FinProceso or FinAlgoritmo
  
    return { type: 'ProcesoBlock', name: processNameNode, body };
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
    if (this.current >= this.tokens.length) return true; 
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    if (this.current >= this.tokens.length) {
        return this.tokens[this.tokens.length -1]; // Return EOF token
    }
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}
