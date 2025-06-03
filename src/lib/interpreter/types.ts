
export enum TokenType {
  KEYWORD_ALGORITMO = 'KEYWORD_ALGORITMO',
  KEYWORD_FINALGORITMO = 'KEYWORD_FINALGORITMO',
  KEYWORD_PROCESO = 'KEYWORD_PROCESO',
  KEYWORD_FINPROCESO = 'KEYWORD_FINPROCESO',
  KEYWORD_DEFINIR = 'KEYWORD_DEFINIR',
  KEYWORD_COMO = 'KEYWORD_COMO',
  KEYWORD_LEER = 'KEYWORD_LEER',
  KEYWORD_ESCRIBIR = 'KEYWORD_ESCRIBIR',
  KEYWORD_SI = 'KEYWORD_SI',
  KEYWORD_ENTONCES = 'KEYWORD_ENTONCES',
  KEYWORD_SINO = 'KEYWORD_SINO',
  KEYWORD_FINSI = 'KEYWORD_FINSI',
  KEYWORD_SEGUN = 'KEYWORD_SEGUN',
  KEYWORD_HACER_SEGUN = 'KEYWORD_HACER_SEGUN', // For SEEGUN ... HACER
  KEYWORD_DEOTROMODO = 'KEYWORD_DEOTROMODO',
  KEYWORD_FINSEGUN = 'KEYWORD_FINSEGUN',
  KEYWORD_MIENTRAS = 'KEYWORD_MIENTRAS',
  KEYWORD_HACER_MIENTRAS = 'KEYWORD_HACER_MIENTRAS', // For MIENTRAS ... HACER
  KEYWORD_FINMIENTRAS = 'KEYWORD_FINMIENTRAS',
  KEYWORD_REPETIR = 'KEYWORD_REPETIR',
  KEYWORD_HASTAQUE = 'KEYWORD_HASTAQUE',
  KEYWORD_PARA = 'KEYWORD_PARA',
  KEYWORD_HASTA = 'KEYWORD_HASTA',
  KEYWORD_CON = 'KEYWORD_CON',
  KEYWORD_PASO = 'KEYWORD_PASO',
  KEYWORD_FINPARA = 'KEYWORD_FINPARA',
  KEYWORD_FUNCION = 'KEYWORD_FUNCION',
  KEYWORD_FINFUNCION = 'KEYWORD_FINFUNCION',
  KEYWORD_DIMENSION = 'KEYWORD_DIMENSION',

  KEYWORD_ENTERO = 'KEYWORD_ENTERO',
  KEYWORD_REAL = 'KEYWORD_REAL',
  KEYWORD_NUMERO = 'KEYWORD_NUMERO',
  KEYWORD_LOGICO = 'KEYWORD_LOGICO',
  KEYWORD_CARACTER = 'KEYWORD_CARACTER',
  KEYWORD_TEXTO = 'KEYWORD_TEXTO',
  KEYWORD_CADENA = 'KEYWORD_CADENA',
  
  KEYWORD_VERDADERO = 'KEYWORD_VERDADERO',
  KEYWORD_FALSO = 'KEYWORD_FALSO',

  IDENTIFIER = 'IDENTIFIER',
  STRING_LITERAL = 'STRING_LITERAL', // Value includes quotes
  NUMBER_LITERAL = 'NUMBER_LITERAL',
  
  OPERATOR_ASSIGN = 'OPERATOR_ASSIGN', // <- or =
  OPERATOR_PLUS = 'OPERATOR_PLUS',     // +
  OPERATOR_MINUS = 'OPERATOR_MINUS',    // -
  OPERATOR_MULTIPLY = 'OPERATOR_MULTIPLY',// *
  OPERATOR_DIVIDE = 'OPERATOR_DIVIDE',  // /
  OPERATOR_MODULO = 'OPERATOR_MODULO',  // % MOD
  OPERATOR_POWER = 'OPERATOR_POWER',   // ^ POTENCIA
  
  OPERATOR_EQ = 'OPERATOR_EQ',        // = (comparison)
  OPERATOR_NEQ = 'OPERATOR_NEQ',      // <> !=
  OPERATOR_LT = 'OPERATOR_LT',        // <
  OPERATOR_GT = 'OPERATOR_GT',        // >
  OPERATOR_LTE = 'OPERATOR_LTE',      // <=
  OPERATOR_GTE = 'OPERATOR_GTE',      // >=

  OPERATOR_AND = 'OPERATOR_AND',      // Y & &&
  OPERATOR_OR = 'OPERATOR_OR',       // O | ||
  OPERATOR_NOT = 'OPERATOR_NOT',      // NO !

  LPAREN = 'LPAREN',                  // (
  RPAREN = 'RPAREN',                  // )
  LBRACKET = 'LBRACKET',              // [
  RBRACKET = 'RBRACKET',              // ]
  COMMA = 'COMMA',                    // ,
  SEMICOLON = 'SEMICOLON',            // ; (optional in PSeInt, but good to recognize)
  COLON = 'COLON',                    // : (used in Segun)

  COMMENT = 'COMMENT',                // // ...
  WHITESPACE = 'WHITESPACE',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
  UNKNOWN = 'UNKNOWN',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
  startIndex: number; // Index in the original input string
}

export interface ASTNode {
  type: string;
}

export interface StringLiteralNode extends ASTNode {
  type: 'StringLiteral';
  value: string; // Content of the string, WITHOUT surrounding quotes
}

export interface NumberLiteralNode extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

export type ExpressionNode = StringLiteralNode | NumberLiteralNode | IdentifierNode;

export interface WriteStatementNode extends ASTNode {
  type: 'WriteStatement';
  expressions: ExpressionNode[]; 
}

export type StatementNode = WriteStatementNode; // Will expand with IfStatement, WhileStatement, etc.

export interface ProgramNode extends ASTNode {
  type: 'Program';
  body: StatementNode[];
}
