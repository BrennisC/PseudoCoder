
export enum TokenType {
  KEYWORD_ESCRIBIR = 'KEYWORD_ESCRIBIR',
  STRING_LITERAL = 'STRING_LITERAL',
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN',
  NEWLINE = 'NEWLINE',
  // Future: COMMA, IDENTIFIER, NUMBER_LITERAL, OPERATOR, etc.
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
}

export interface StringLiteralNode extends ASTNode {
  type: 'StringLiteral';
  value: string;
}

// For now, an expression is just a string literal
export type ExpressionNode = StringLiteralNode;

export interface WriteStatementNode extends ASTNode {
  type: 'WriteStatement';
  expressions: ExpressionNode[]; 
}

export type StatementNode = WriteStatementNode; // Will expand with IfStatement, WhileStatement, etc.

export interface ProgramNode extends ASTNode {
  type: 'Program';
  body: StatementNode[];
}
