
import type { ProgramNode, StatementNode, WriteStatementNode, ExpressionNode, ASTNode, NumberLiteralNode, IdentifierNode, ProcesoBlockNode, AssignmentStatementNode, ReadStatementNode, BinaryExpressionNode, BooleanLiteralNode, StringLiteralNode, DefineStatementNode, MientrasStatementNode } from './types';
import { TokenType } from './types';

export class Evaluator {
  private output: string = '';
  private environment: Map<string, any> = new Map();
  private preSuppliedInputs: string[] | undefined;
  private currentInputIndex: number = 0;

  public evaluate(program: ProgramNode, inputs?: string[]): string {
    this.output = '';
    this.environment.clear(); 
    this.preSuppliedInputs = inputs;
    this.currentInputIndex = 0;

    try {
      // First pass: Process all Define statements to initialize variables
      for (const statement of program.body) {
        if (statement.type === 'ProcesoBlock') {
          const procesoBlock = statement as ProcesoBlockNode;
          for (const subStatement of procesoBlock.body) {
            if (subStatement.type === 'DefineStatement') {
              this.evaluateDefineStatement(subStatement as DefineStatementNode);
            }
          }
        } else if (statement.type === 'DefineStatement') {
           this.evaluateDefineStatement(statement as DefineStatementNode);
        }
      }
      // Second pass: Evaluate all other statements
      for (const statement of program.body) {
         if (statement.type !== 'DefineStatement') { // Already processed
            this.evaluateStatement(statement);
        }
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
        // Already handled in the initial pass, but calling again should not harm.
        this.evaluateDefineStatement(statement as DefineStatementNode);
        break;
      case 'MientrasStatement':
        // Placeholder for MIENTRAS loop - recognized but not executed yet.
        this.output += "// Bucle 'Mientras' encontrado, la lógica de ejecución aún no está implementada.\n";
        // this.evaluateMientrasStatement(statement as MientrasStatementNode); // Logic to be implemented
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
    // PSeInt is flexible and allows using variables without explicit 'Definir'.
    // If not defined, we could add it to the environment here or rely on 'Definir'.
    // For now, we assume 'Definir' or prior assignment/read handles declaration.
    // if (!this.environment.has(node.identifier.name)) {
    //     this.runtimeError(`Variable '${node.identifier.name}' no ha sido definida.`, node);
    //     return; 
    // }
    const value = this.evaluateExpression(node.expression);
    this.environment.set(node.identifier.name, value);
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      let inputValue: string | null = null;
      const variableName = id.name;

      // Attempt to get input from pre-supplied list
      if (this.preSuppliedInputs && this.currentInputIndex < this.preSuppliedInputs.length) {
        inputValue = this.preSuppliedInputs[this.currentInputIndex];
        this.currentInputIndex++;
        // Echo the input source and value to the output console
        this.output += `> ${variableName} = ${inputValue} (desde Input Console)\n`; 
      } else {
        // Fallback to window.prompt if no pre-supplied inputs are available
        inputValue = window.prompt(`Ingrese valor para ${variableName}:`);
        if (inputValue !== null) {
           // Echo the input source and value to the output console
           this.output += `> ${variableName} = ${inputValue} (desde prompt)\n`;
        }
      }

      if (inputValue === null) { 
        // Handle cancelled prompt
        this.output += `Advertencia: Entrada cancelada para la variable '${variableName}'. Se le asignará 'indefinido'.\n`;
        this.environment.set(variableName, undefined); 
        continue;
      }
      
      // Try to parse the input value
      const numInput = parseFloat(inputValue);
      if (!isNaN(numInput) && String(numInput) === inputValue.trim()) {
        this.environment.set(variableName, numInput);
      } else if (inputValue.toLowerCase() === "verdadero") {
        this.environment.set(variableName, true);
      } else if (inputValue.toLowerCase() === "falso") {
        this.environment.set(variableName, false);
      } else { 
        this.environment.set(variableName, inputValue); 
      }
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    for (const statement of node.body) {
       if (statement.type !== 'DefineStatement') { 
         this.evaluateStatement(statement);
       }
    }
  }

  // private evaluateMientrasStatement(node: MientrasStatementNode): void {
  //   // Actual loop logic (evaluating condition, executing body) will be implemented here.
  //   // For now, this function is commented out as it's a placeholder.
  // }

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
        this.output += `Advertencia: Variable '${varName}' usada sin valor asignado previamente (o sin Definir). Se asume un valor por defecto o podría causar error.\n`;
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

    if (left === undefined || right === undefined) {
        if (node.operator === TokenType.OPERATOR_PLUS && (typeof left === 'string' || typeof right === 'string')) {
            return String(left === undefined ? "" : left) + String(right === undefined ? "" : right);
        }
        // For other operations, if an operand is undefined, it might result in NaN or an error.
        // PSeInt often treats undefined numeric variables as 0 in arithmetic, but explicit error is safer for now.
        this.runtimeError(`Operación con valor indefinido. L: ${left}, R: ${right} para operador '${node.operator}'. Asegúrese de que las variables estén inicializadas.`, node);
        return NaN;
    }

    if (typeof left === 'string' || typeof right === 'string') {
        if (node.operator === TokenType.OPERATOR_PLUS) {
            return String(left) + String(right); 
        } else {
            this.runtimeError(`Operator '${node.operator}' cannot be applied to strings here (unless it's + for concatenation).`, node);
            return undefined;
        }
    }
    
    if ( (node.operator === TokenType.OPERATOR_PLUS || 
          node.operator === TokenType.OPERATOR_MINUS || 
          node.operator === TokenType.OPERATOR_MULTIPLY || 
          node.operator === TokenType.OPERATOR_DIVIDE || 
          node.operator === TokenType.OPERATOR_MODULO) && 
        (typeof left !== 'number' || typeof right !== 'number') ) {
        this.runtimeError(`Operands must be numbers for arithmetic operator '${node.operator}'. Got ${typeof left} and ${typeof right}.`, node);
        return NaN;
    }

    switch (node.operator) {
      case TokenType.OPERATOR_PLUS:
        return (left as number) + (right as number);
      case TokenType.OPERATOR_MINUS:
        return (left as number) - (right as number);
      case 'OPERATOR_MULTIPLY':
        return (left as number) * (right as number);
      case TokenType.OPERATOR_DIVIDE:
        if (right === 0) {
          this.runtimeError('Division by zero.', node);
          return NaN; 
        }
        return (left as number) / (right as number);
      case TokenType.OPERATOR_MODULO: 
         if (right === 0) {
            this.runtimeError('Modulo by zero.', node);
            return NaN; 
        }
        return (left as number) % (right as number);
      default:
        this.runtimeError(`Unknown or unhandled binary operator '${node.operator}'.`, node);
        return undefined;
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      if (value === undefined && expr.type === 'Identifier' && !this.environment.has((expr as IdentifierNode).name)) {
         lineOutputParts.push(`[Error: Variable ${(expr as IdentifierNode).name} no definida o sin valor asignado]`);
      } else {
        lineOutputParts.push(String(value === undefined ? "indefinido" : value)); 
      }
    }
    this.output += lineOutputParts.join('') + '\n'; 
  }

  private runtimeError(message: string, node: ASTNode | null) {
    let details = message;
    if (node && node.line !== undefined && node.column !== undefined) {
      details = `Error en linea ${node.line}, columna ${node.column}: ${message}`;
    }
    // It's better to throw an actual error to halt execution and provide a stack trace.
    // The evaluate method will catch this and append to output.
    throw new Error(details);
  }
}

