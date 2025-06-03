
import type { ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, ExpressionNode, ASTNode, NumberLiteralNode, IdentifierNode } from './types';

export class Evaluator {
  private output: string = '';
  // Future: private environment: Map<string, any> = new Map();

  public evaluate(program: ProgramNode): string {
    this.output = '';
    for (const statement of program.body) {
      this.evaluateStatement(statement);
    }
    return this.output.trimEnd(); 
  }

  private evaluateStatement(statement: StatementNode): void {
    switch (statement.type) {
      case 'WriteStatement':
        this.evaluateWriteStatement(statement as WriteStatementNode);
        break;
      default:
        // This case should ideally not be reached if the parser only produces valid/known statement types.
        // If it is reached, it might indicate an unhandled statement type.
        // For robustness, we can log or ignore, rather than throwing an error that breaks execution.
        // console.warn(`Evaluator Warning: Unknown or unhandled statement type '${statement.type}'`);
        break;
    }
  }

  private evaluateExpression(expression: ExpressionNode): any {
    switch (expression.type) {
      case 'StringLiteral':
        return expression.value; // Value is already without quotes from parser
      case 'NumberLiteral':
        return expression.value;
      case 'Identifier':
        // For now, we don't have variable storage.
        // We could throw an error: throw new Error(`Evaluator Error: Variable '${expression.name}' not defined.`);
        // Or return a placeholder for display:
        return `[${expression.name}]`; // Placeholder indicating an unevaluated variable
      default:
        // This attempts to get the 'type' property even if expression is not an ASTNode, for better error reporting.
        const exprType = (expression as ASTNode)?.type || 'unknown expression';
        throw new Error(`Evaluator Error: Unknown expression type '${exprType}'.`);
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      lineOutputParts.push(String(value)); // Convert all evaluated parts to string
    }
    // PSeInt ESCRIBIR usually adds spaces between comma-separated items.
    this.output += lineOutputParts.join(' ') + '\n';
  }
}
