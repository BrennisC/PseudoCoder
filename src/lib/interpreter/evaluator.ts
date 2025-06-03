
import type { ProgramNode, StatementNode, WriteStatementNode, StringLiteralNode, ExpressionNode } from './types';

export class Evaluator {
  private output: string = '';

  public evaluate(program: ProgramNode): string {
    this.output = '';
    for (const statement of program.body) {
      this.evaluateStatement(statement);
    }
    return this.output.trimEnd(); // Remove trailing newline if any was added
  }

  private evaluateStatement(statement: StatementNode): void {
    switch (statement.type) {
      case 'WriteStatement':
        this.evaluateWriteStatement(statement as WriteStatementNode);
        break;
      // Future: Add cases for other statement types
      default:
        throw new Error(`Evaluator Error: Unknown statement type '${statement.type}'`);
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutput = '';
    for (const expr of node.expressions) {
      // For now, expressions are only StringLiterals
      if (expr.type === 'StringLiteral') {
        lineOutput += (expr as StringLiteralNode).value;
      } else {
        throw new Error(`Evaluator Error: Unsupported expression type '${expr.type}' in ESCRIBIR.`);
      }
      // Future: Handle different expression types (variables, numbers, operations)
      // and add spaces between comma-separated items if PSeInt does that by default.
    }
    this.output += lineOutput + '\n';
  }
}
