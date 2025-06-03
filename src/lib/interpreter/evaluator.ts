
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
        this.output += `// INFO: Estructura 'Mientras' reconocida. La lógica de ejecución del bucle aún no está implementada.\n`;
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
    const value = this.evaluateExpression(node.expression);
    this.environment.set(node.identifier.name, value);
    this.output += `> '${node.identifier.name}' toma el valor: ${value}\n`;
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      let rawInputValue: string | null = null;
      const variableName = id.name;

      this.output += `Ejecutando LEER para la variable: '${variableName}'.\n`;

      // Attempt to get input from pre-supplied list
      if (this.preSuppliedInputs && this.currentInputIndex < this.preSuppliedInputs.length) {
        rawInputValue = this.preSuppliedInputs[this.currentInputIndex];
        this.currentInputIndex++;
        this.output += `  Input Console proveyó: "${rawInputValue}"\n`;
      } else {
        // Fallback to window.prompt if no pre-supplied inputs are available
        this.output += `  Esperando entrada del usuario para '${variableName}'...\n`;
        rawInputValue = window.prompt(`Ingrese valor para ${variableName}:`);
        if (rawInputValue !== null) {
          this.output += `  Usuario ingresó: "${rawInputValue}"\n`;
        }
      }

      if (rawInputValue === null) { // Input was cancelled (e.g., user pressed Cancel on prompt)
        this.output += `Advertencia: Entrada cancelada para '${variableName}'.`;
        if (this.environment.has(variableName)) {
          this.output += ` La variable '${variableName}' conserva su valor anterior: ${this.environment.get(variableName)}.\n`;
        } else {
          this.environment.set(variableName, undefined); // Mark as uninitialized/cancelled read
          this.output += ` La variable '${variableName}' queda sin inicializar (o indefinida).\n`;
        }
        continue; // Skip further processing for this identifier
      }

      // Try to parse the input value
      const trimmedInput = rawInputValue.trim();
      let assignedValue: any;
      let typeOfValue: string;

      const numInput = parseFloat(trimmedInput);
      // Check if it's a number and the trimmed string is identical to its string representation
      if (!isNaN(numInput) && String(numInput) === trimmedInput) {
        assignedValue = numInput;
        typeOfValue = 'Número';
        this.environment.set(variableName, numInput);
      } else if (trimmedInput.toLowerCase() === "verdadero") {
        assignedValue = true;
        typeOfValue = 'Lógico';
        this.environment.set(variableName, true);
      } else if (trimmedInput.toLowerCase() === "falso") {
        assignedValue = false;
        typeOfValue = 'Lógico';
        this.environment.set(variableName, false);
      } else {
        // Default to string if not clearly a number or boolean
        assignedValue = rawInputValue; // Keep original raw input for strings
        typeOfValue = 'Texto';
        this.environment.set(variableName, rawInputValue);
      }
      this.output += `> '${variableName}' toma el valor: ${assignedValue} (Tipo: ${typeOfValue})\n`;
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    for (const statement of node.body) {
       if (statement.type !== 'DefineStatement') {
         this.evaluateStatement(statement);
       }
    }
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
        // PSeInt often defaults uninitialized variables depending on context (e.g., 0 in arithmetic)
        // For now, returning undefined and letting operations handle it or erroring.
        this.output += `Advertencia: Variable '${varName}' usada sin valor asignado previamente (o sin Definir explícitamente un valor inicial). Puede causar un error o comportamiento inesperado.\n`;
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

    // Handle undefined operands for concatenation
    if (node.operator === TokenType.OPERATOR_PLUS && (typeof left === 'string' || typeof right === 'string')) {
        const leftStr = left === undefined ? "" : String(left);
        const rightStr = right === undefined ? "" : String(right);
        return leftStr + rightStr;
    }

    if (left === undefined || right === undefined) {
        this.runtimeError(`Operación con valor indefinido. L: ${left}, R: ${right} para operador '${node.operator}'. Asegúrese de que las variables estén inicializadas.`, node);
        return NaN; // Or some other error indicator
    }

    // Type checking for arithmetic operations
    if ( (node.operator === TokenType.OPERATOR_PLUS ||
          node.operator === TokenType.OPERATOR_MINUS ||
          node.operator === TokenType.OPERATOR_MULTIPLY ||
          node.operator === TokenType.OPERATOR_DIVIDE ||
          node.operator === TokenType.OPERATOR_MODULO) &&
        (typeof left !== 'number' || typeof right !== 'number') ) {
        this.runtimeError(`Operands must be numbers for arithmetic operator '${node.operator}'. Got ${typeof left} ('${left}') and ${typeof right} ('${right}').`, node);
        return NaN;
    }


    switch (node.operator) {
      case TokenType.OPERATOR_PLUS: // Already handled if one is string, this is for number + number
        return (left as number) + (right as number);
      case TokenType.OPERATOR_MINUS:
        return (left as number) - (right as number);
      case TokenType.OPERATOR_MULTIPLY:
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
      // Add other binary operators here (logical, relational) when implemented
      default:
        this.runtimeError(`Unknown or unhandled binary operator '${node.operator}'.`, node);
        return undefined;
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      if (value === undefined && expr.type === 'Identifier') {
         const idNode = expr as IdentifierNode;
         // Check if it was truly undefined or just not in environment yet
         if (!this.environment.has(idNode.name)) {
            lineOutputParts.push(`[Error: Variable '${idNode.name}' no definida o sin valor asignado]`);
         } else {
            // It means environment.get(idNode.name) returned undefined
            lineOutputParts.push("indefinido");
         }
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
    throw new Error(details);
  }
}

