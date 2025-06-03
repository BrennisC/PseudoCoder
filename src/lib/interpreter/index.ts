
import { lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';

export function executePseudocode(code: string): string {
  try {
    const tokens = lexer(code);
    // console.log("Tokens:", tokens); // For debugging
    
    const parser = new Parser();
    const ast = parser.parse(tokens);
    // console.log("AST:", JSON.stringify(ast, null, 2)); // For debugging

    const evaluator = new Evaluator();
    const output = evaluator.evaluate(ast);
    return output;
  } catch (error: any) {
    // console.error("Interpreter Error:", error); // For debugging
    return `Error: ${error.message}`;
  }
}
