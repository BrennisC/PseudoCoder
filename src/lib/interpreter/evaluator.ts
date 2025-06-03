
import type { ProgramNode, StatementNode, WriteStatementNode, ExpressionNode, ASTNode, NumberLiteralNode, IdentifierNode, ProcesoBlockNode, AssignmentStatementNode, ReadStatementNode, BinaryExpressionNode, BooleanLiteralNode, StringLiteralNode, DefineStatementNode, MientrasStatementNode } from './types';
import { TokenType } from './types';

export class Evaluator {
  private output: string = '';
  private environment: Map<string, any> = new Map();

  public evaluate(program: ProgramNode): string {
    this.output = '';
    this.environment.clear(); 
    try {
      for (const statement of program.body) {
        this.evaluateStatement(statement);
      }
    } catch (error: any) {
        this.output += `Runtime Error: ${error.message}\n`;
    }
    return this.output.trimEnd(); 
  }

  private evaluateStatement(statement: StatementNode): void {
    if (!statement) return; 

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
      case 'MientrasStatement':
        this.evaluateMientrasStatement(statement as MientrasStatementNode);
        break;
      default:
        this.runtimeError(`Unknown or unhandled statement type '${(statement as ASTNode)?.type}'.`, statement);
        break;
    }
  }
  
  private evaluateDefineStatement(node: DefineStatementNode): void {
    for (const id of node.identifiers) {
      if (!this.environment.has(id.name)) {
        const typeLower = node.dataType.name.toLowerCase();
        if (typeLower === 'entero' || typeLower === 'real' || typeLower === 'numero') {
            this.environment.set(id.name, 0);
        } else if (typeLower === 'logico') {
            this.environment.set(id.name, false);
        } else if (typeLower === 'caracter' || typeLower === 'texto' || typeLower === 'cadena') {
             this.environment.set(id.name, "");
        } else {
            this.environment.set(id.name, undefined); 
        }
      }
    }
  }

  private evaluateAssignmentStatement(node: AssignmentStatementNode): void {
    const value = this.evaluateExpression(node.expression);
    this.environment.set(node.identifier.name, value);
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      const input = window.prompt(`Ingrese valor para ${id.name}:`);
      if (input === null) { 
        this.runtimeError(`Input cancelled for variable '${id.name}'.`, node);
        this.environment.set(id.name, undefined); 
        continue;
      }
      const numInput = parseFloat(input);
      if (!isNaN(numInput) && String(numInput) === input.trim()) {
        this.environment.set(id.name, numInput);
      } else if (input.toLowerCase() === "verdadero") {
        this.environment.set(id.name, true);
      } else if (input.toLowerCase() === "falso") {
        this.environment.set(id.name, false);
      }
      else {
        this.environment.set(id.name, input); 
      }
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    for (const statement of node.body) {
      this.evaluateStatement(statement);
    }
  }

  private evaluateMientrasStatement(node: MientrasStatementNode): void {
    // Placeholder: For now, we just acknowledge the statement.
    // Actual loop logic (evaluating condition, executing body) will be implemented later.
    // console.log("Mientras statement encountered, condition:", node.condition, "body:", node.body.length, "statements");
    // To prevent infinite loops if it were implemented partially, we just do nothing.
  }

  private evaluateExpression(expression: ExpressionNode | null): any {
    if (!expression) {
        this.runtimeError(`Encountered null expression.`, expression);
        return undefined; 
    }
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
        return undefined; 
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

    if (typeof left === 'string' || typeof right === 'string') {
        if (node.operator === TokenType.OPERATOR_PLUS) {
            return String(left) + String(right); 
        } else {
            this.runtimeError(`Operator '${node.operator}' cannot be applied to strings here (unless it's + for concatenation).`, node);
        }
    }
    
    if (node.operator !== TokenType.OPERATOR_PLUS && (typeof left !== 'number' || typeof right !== 'number')) {
         if (node.operator === TokenType.OPERATOR_EQ || node.operator === TokenType.OPERATOR_NEQ ) {
         } else if (typeof left === 'boolean' && typeof right === 'boolean' && 
                   (node.operator === TokenType.KEYWORD_LOGICAL_AND || node.operator === TokenType.KEYWORD_LOGICAL_OR)) {
         }
         else {
            this.runtimeError(`Operands must be numbers for operator '${node.operator}'. Got ${typeof left} and ${typeof right}.`, node);
            return NaN;
         }
    }

    switch (node.operator) {
      case TokenType.OPERATOR_PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right); 
        this.runtimeError(`Cannot add ${typeof left} and ${typeof right}.`, node); return NaN;
      case TokenType.OPERATOR_MINUS:
        return left - right;
      case TokenType.OPERATOR_MULTIPLY:
        return left * right;
      case TokenType.OPERATOR_DIVIDE:
        if (right === 0) {
          this.runtimeError('Division by zero.', node);
          return NaN; 
        }
        return left / right;
      case TokenType.OPERATOR_MODULO: 
         if (right === 0) {
            this.runtimeError('Modulo by zero.', node);
            return NaN; 
        }
        return left % right;
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
         lineOutputParts.push(`[Error: Variable ${(expr as IdentifierNode).name} no definida]`);
      } else {
        lineOutputParts.push(String(value)); 
      }
    }
    this.output += lineOutputParts.join('') + '\n'; 
  }

  private runtimeError(message: string, node: ASTNode | null) {
    let details = message;
    if (node && node.line !== undefined && node.column !== undefined) {
      details = `Error en linea ${node.line}, columna ${node.column}: ${message}`;
    }
    throw new Error(details);
  }
}
