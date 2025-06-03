
import type { ProgramNode, StatementNode, WriteStatementNode, ExpressionNode, ASTNode, NumberLiteralNode, IdentifierNode, ProcesoBlockNode } from './types';

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
      case 'ProcesoBlock':
        this.evaluateProcesoBlock(statement as ProcesoBlockNode);
        break;
      default:
        // This case should ideally not be reached if the parser only produces valid/known statement types.
        // For robustness, we can log or ignore, rather than throwing an error that breaks execution.
        // console.warn(`Evaluator Warning: Unknown or unhandled statement type '${(statement as ASTNode)?.type}'`);
        break;
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    // For now, simply evaluate the statements within the Proceso block's body.
    // In the future, this could involve setting up a new scope for the process.
    // console.log(`Executing Proceso: ${node.name.name}`);
    for (const statement of node.body) {
      this.evaluateStatement(statement);
    }
  }

  private evaluateExpression(expression: ExpressionNode): any {
    switch (expression.type) {
      case 'StringLiteral':
        return expression.value; 
      case 'NumberLiteral':
        return expression.value;
      case 'Identifier':
        return `[${expression.name}]`; 
      default:
        const exprType = (expression as ASTNode)?.type || 'unknown expression';
        throw new Error(`Evaluator Error: Unknown expression type '${exprType}'.`);
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      lineOutputParts.push(String(value)); 
    }
    this.output += lineOutputParts.join(' ') + '\n';
  }
}
