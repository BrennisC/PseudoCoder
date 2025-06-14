
export enum TokenType {
  KEYWORD_ALGORITMO = 'KEYWORD_ALGORITMO',
  KEYWORD_FINALGORITMO = 'KEYWORD_FINALGORITMO',
  KEYWORD_PROCESO = 'KEYWORD_PROCESO',
  KEYWORD_FINPROCESO = 'KEYWORD_FINPROCESO',
  KEYWORD_SUBPROCESO = 'KEYWORD_SUBPROCESO',
  KEYWORD_FINSUBPROCESO = 'KEYWORD_FINSUBPROCESO',
  KEYWORD_DEFINIR = 'KEYWORD_DEFINIR',
  KEYWORD_COMO = 'KEYWORD_COMO',
  KEYWORD_LEER = 'KEYWORD_LEER',
  KEYWORD_ESCRIBIR = 'KEYWORD_ESCRIBIR',
  KEYWORD_SI = 'KEYWORD_SI',
  KEYWORD_ENTONCES = 'KEYWORD_ENTONCES',
  KEYWORD_SINO = 'KEYWORD_SINO',
  KEYWORD_FINSI = 'KEYWORD_FINSI',
  KEYWORD_SEGUN = 'KEYWORD_SEGUN',
  KEYWORD_HACER_SEGUN = 'KEYWORD_HACER_SEGUN', 
  KEYWORD_DEOTROMODO = 'KEYWORD_DEOTROMODO',
  KEYWORD_FINSEGUN = 'KEYWORD_FINSEGUN',
  KEYWORD_MIENTRAS = 'KEYWORD_MIENTRAS',
  KEYWORD_HACER_MIENTRAS = 'KEYWORD_HACER_MIENTRAS',
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

  KEYWORD_VARIABLE = 'KEYWORD_VARIABLE',
  KEYWORD_CONSTANTE = 'KEYWORD_CONSTANTE',
  KEYWORD_DESDE = 'KEYWORD_DESDE',
  KEYWORD_HACER = 'KEYWORD_HACER', 
  KEYWORD_CASO = 'KEYWORD_CASO',
  KEYWORD_POR_REFERENCIA = 'KEYWORD_POR_REFERENCIA', 
  KEYWORD_DE = 'KEYWORD_DE',
  KEYWORD_RETORNAR = 'KEYWORD_RETORNAR',
  KEYWORD_FIN = 'KEYWORD_FIN', 
  KEYWORD_TIPO = 'KEYWORD_TIPO',
  KEYWORD_REGISTRO = 'KEYWORD_REGISTRO',
  KEYWORD_ARREGLO = 'KEYWORD_ARREGLO',
  KEYWORD_PROCEDIMIENTO = 'KEYWORD_PROCEDIMIENTO',
  KEYWORD_FINPROCEDIMIENTO = 'KEYWORD_FINPROCEDIMIENTO',
  KEYWORD_MODULO = 'KEYWORD_MODULO',
  KEYWORD_FINMODULO = 'KEYWORD_FINMODULO',

  KEYWORD_LOGICAL_AND = 'KEYWORD_LOGICAL_AND', 
  KEYWORD_LOGICAL_OR = 'KEYWORD_LOGICAL_OR',   
  KEYWORD_LOGICAL_NOT = 'KEYWORD_LOGICAL_NOT', 

  IDENTIFIER = 'IDENTIFIER',
  STRING_LITERAL = 'STRING_LITERAL', 
  NUMBER_LITERAL = 'NUMBER_LITERAL',
  
  OPERATOR_ASSIGN = 'OPERATOR_ASSIGN', 
  OPERATOR_PLUS = 'OPERATOR_PLUS',     
  OPERATOR_MINUS = 'OPERATOR_MINUS',    
  OPERATOR_MULTIPLY = 'OPERATOR_MULTIPLY',
  OPERATOR_DIVIDE = 'OPERATOR_DIVIDE',  
  OPERATOR_MODULO = 'OPERATOR_MODULO',  
  OPERATOR_POWER = 'OPERATOR_POWER',   
  
  OPERATOR_EQ = 'OPERATOR_EQ',        
  OPERATOR_NEQ = 'OPERATOR_NEQ',      
  OPERATOR_LT = 'OPERATOR_LT',        
  OPERATOR_GT = 'OPERATOR_GT',        
  OPERATOR_LTE = 'OPERATOR_LTE',      
  OPERATOR_GTE = 'OPERATOR_GTE',      

  LPAREN = 'LPAREN',                  
  RPAREN = 'RPAREN',                  
  LBRACKET = 'LBRACKET',              
  RBRACKET = 'RBRACKET',              
  COMMA = 'COMMA',                    
  SEMICOLON = 'SEMICOLON',            
  COLON = 'COLON',                    

  COMMENT = 'COMMENT',                
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
  startIndex: number; 
}

export interface ASTNode {
  type: string;
  line?: number; 
  column?: number; 
}

export interface StringLiteralNode extends ASTNode {
  type: 'StringLiteral';
  value: string; 
}

export interface NumberLiteralNode extends ASTNode {
  type: 'NumberLiteral';
  value: number;
}

export interface BooleanLiteralNode extends ASTNode {
  type: 'BooleanLiteral';
  value: boolean;
}

export interface IdentifierNode extends ASTNode {
  type: 'Identifier';
  name: string;
}

export interface BinaryExpressionNode extends ASTNode {
  type: 'BinaryExpression';
  left: ExpressionNode;
  operator: TokenType; 
  right: ExpressionNode;
}

export type ExpressionNode = 
  | StringLiteralNode 
  | NumberLiteralNode 
  | IdentifierNode
  | BooleanLiteralNode
  | BinaryExpressionNode;

export interface WriteStatementNode extends ASTNode {
  type: 'WriteStatement';
  expressions: ExpressionNode[]; 
}

export interface ReadStatementNode extends ASTNode {
  type: 'ReadStatement';
  identifiers: IdentifierNode[];
}

export interface AssignmentStatementNode extends ASTNode {
  type: 'AssignmentStatement';
  identifier: IdentifierNode;
  expression: ExpressionNode;
}

export interface DefineStatementNode extends ASTNode { 
  type: 'DefineStatement';
  identifiers: IdentifierNode[];
  dataType: IdentifierNode; 
}

export interface MientrasStatementNode extends ASTNode {
  type: 'MientrasStatement';
  condition: ExpressionNode;
  body: StatementNode[];
}

export interface ProcesoBlockNode extends ASTNode {
  type: 'ProcesoBlock'; 
  name: IdentifierNode;
  body: StatementNode[];
}

export type StatementNode = 
  | WriteStatementNode 
  | ProcesoBlockNode
  | ReadStatementNode
  | AssignmentStatementNode
  | DefineStatementNode
  | MientrasStatementNode; 

export interface ProgramNode extends ASTNode {
  type: 'Program';
  body: StatementNode[]; 
}
