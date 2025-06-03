
import type { ProgramNode, StatementNode, WriteStatementNode, ExpressionNode, ASTNode, NumberLiteralNode, IdentifierNode, ProcesoBlockNode, AssignmentStatementNode, ReadStatementNode, BinaryExpressionNode, BooleanLiteralNode, StringLiteralNode, DefineStatementNode } from './types';
import { TokenType } from './types';

export class Evaluator {
  private output: string = '';
  private environment: Map<string, any> = new Map();

  public evaluate(program: ProgramNode): string {
    this.output = '';
    this.environment.clear(); // Clear environment for each new evaluation
    try {
      for (const statement of program.body) {
        this.evaluateStatement(statement);
      }
    } catch (error: any) {
        // Append runtime errors to output for user visibility
        this.output += `Runtime Error: ${error.message}\n`;
        // console.error("Runtime Error in Evaluator:", error); // For server-side debugging
    }
    return this.output.trimEnd(); 
  }

  private evaluateStatement(statement: StatementNode): void {
    if (!statement) return; // Should not happen with a correct parser

    // console.log("Evaluating statement:", statement.type);
    switch (statement.type) {
      case 'WriteStatement':
        this.evaluateWriteStatement(statement as WriteStatementNode);
        break;
      case 'ProcesoBlock':
        this.evaluateProcesoBlock(statement as ProcesoBlockNode);
        break;
      case 'AssignmentStatement':
        this.evaluateAssignmentStatement(statement as AssignmentStatementNode);
        break;
      case 'ReadStatement':
        this.evaluateReadStatement(statement as ReadStatementNode);
        break;
      case 'DefineStatement':
        this.evaluateDefineStatement(statement as DefineStatementNode);
        break;
      default:
        this.runtimeError(`Unknown or unhandled statement type '${(statement as ASTNode)?.type}'.`, statement);
        break;
    }
  }
  
  private evaluateDefineStatement(node: DefineStatementNode): void {
    // For now, Define just makes sure variables are in the environment,
    // PSeInt typically initializes numeric to 0 and logical to false.
    // String/Char might be empty or require explicit assignment.
    // We won't enforce types strictly at this stage.
    for (const id of node.identifiers) {
      if (!this.environment.has(id.name)) {
        // Basic default initialization based on PSeInt-like common types
        const typeLower = node.dataType.name.toLowerCase();
        if (typeLower === 'entero' || typeLower === 'real' || typeLower === 'numero') {
            this.environment.set(id.name, 0);
        } else if (typeLower === 'logico') {
            this.environment.set(id.name, false);
        } else if (typeLower === 'caracter' || typeLower === 'texto' || typeLower === 'cadena') {
             this.environment.set(id.name, "");
        } else {
            this.environment.set(id.name, undefined); // Or null
        }
      }
    }
  }


  private evaluateAssignmentStatement(node: AssignmentStatementNode): void {
    const value = this.evaluateExpression(node.expression);
    // console.log(`Assigning ${value} to ${node.identifier.name}`);
    this.environment.set(node.identifier.name, value);
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      const input = window.prompt(`Ingrese valor para ${id.name}:`);
      if (input === null) { // User cancelled prompt
        this.runtimeError(`Input cancelled for variable '${id.name}'.`, node);
        this.environment.set(id.name, undefined); // Or some default error value
        continue;
      }
      // Try to parse as number, otherwise keep as string
      const numInput = parseFloat(input);
      if (!isNaN(numInput) && String(numInput) === input.trim()) {
        this.environment.set(id.name, numInput);
      } else if (input.toLowerCase() === "verdadero") {
        this.environment.set(id.name, true);
      } else if (input.toLowerCase() === "falso") {
        this.environment.set(id.name, false);
      }
      else {
        this.environment.set(id.name, input); // Store as string if not a clear number
      }
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    for (const statement of node.body) {
      this.evaluateStatement(statement);
    }
  }

  private evaluateExpression(expression: ExpressionNode | null): any {
    if (!expression) {
        this.runtimeError(`Encountered null expression.`, expression);
        return undefined; // Or throw
    }
    // console.log("Evaluating expression:", expression.type, expression);
    switch (expression.type) {
      case 'StringLiteral':
        return (expression as StringLiteralNode).value; 
      case 'NumberLiteral':
        return (expression as NumberLiteralNode).value;
      case 'BooleanLiteral':
        return (expression as BooleanLiteralNode).value;
      case 'Identifier':
        const varName = (expression as IdentifierNode).name;
        if (this.environment.has(varName)) {
          return this.environment.get(varName);
        }
        this.runtimeError(`Variable '${varName}' no definida.`, expression);
        return undefined; // Or throw error
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expression as BinaryExpressionNode);
      default:
        this.runtimeError(`Unknown expression type '${(expression as ASTNode)?.type}'.`, expression);
        return undefined;
    }
  }

  private evaluateBinaryExpression(node: BinaryExpressionNode): any {
    const left = this.evaluateExpression(node.left);
    const right = this.evaluateExpression(node.right);

    // console.log(`Binary Op: ${left} ${node.operator} ${right}`);

    // Type checking and coercion (basic)
    if (typeof left === 'string' || typeof right === 'string') {
        if (node.operator === TokenType.OPERATOR_PLUS) {
            return String(left) + String(right); // String concatenation
        } else {
            this.runtimeError(`Operator '${node.operator}' cannot be applied to strings here (unless it's + for concatenation).`, node);
        }
    }
    
    // Ensure operands are numbers for arithmetic operations (excluding + which might be concat)
    if (node.operator !== TokenType.OPERATOR_PLUS && (typeof left !== 'number' || typeof right !== 'number')) {
         if (node.operator === TokenType.OPERATOR_EQ || node.operator === TokenType.OPERATOR_NEQ ) {
            // Allow comparison for non-numeric types if needed for booleans, etc.
         } else if (typeof left === 'boolean' && typeof right === 'boolean' && 
                   (node.operator === TokenType.KEYWORD_LOGICAL_AND || node.operator === TokenType.KEYWORD_LOGICAL_OR)) {
            // Handled by logical operators below
         }
         else {
            this.runtimeError(`Operands must be numbers for operator '${node.operator}'. Got ${typeof left} and ${typeof right}.`, node);
            return NaN;
         }
    }


    switch (node.operator) {
      case TokenType.OPERATOR_PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right); // Already handled above, but defensive
        this.runtimeError(`Cannot add ${typeof left} and ${typeof right}.`, node); return NaN;
      case TokenType.OPERATOR_MINUS:
        return left - right;
      case TokenType.OPERATOR_MULTIPLY:
        return left * right;
      case TokenType.OPERATOR_DIVIDE:
        if (right === 0) {
          this.runtimeError('Division by zero.', node);
          return NaN; // Or Infinity, PSeInt might error
        }
        return left / right;
      case TokenType.OPERATOR_MODULO: // Assuming MOD is like % for numbers
         if (right === 0) {
            this.runtimeError('Modulo by zero.', node);
            return NaN; 
        }
        return left % right;
      // Add more operators: EQ, NEQ, LT, GT, LTE, GTE, AND, OR, NOT
      default:
        this.runtimeError(`Unknown binary operator '${node.operator}'.`, node);
        return undefined;
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      if (value === undefined && !this.environment.has((expr as IdentifierNode)?.name) && expr.type === 'Identifier') {
         // Value is undefined because variable was not found, error already thrown by evaluateExpression
         lineOutputParts.push(`[Error: Variable ${(expr as IdentifierNode).name} no definida]`);
      } else {
        lineOutputParts.push(String(value)); 
      }
    }
    this.output += lineOutputParts.join('') + '\n'; // PSeInt usually joins without spaces by default for ESCRIBIR a,b,c
  }

  private runtimeError(message: string, node: ASTNode | null) {
    let details = message;
    if (node && node.line !== undefined && node.column !== undefined) {
      details = `Error en linea ${node.line}, columna ${node.column}: ${message}`;
    }
    // For now, this will be caught by the main evaluate() try-catch and added to output.
    throw new Error(details);
  }
}
