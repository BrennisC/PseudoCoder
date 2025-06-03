
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
        // Runtime errors from the evaluator itself will be added here
        this.output += `Error en tiempo de ejecución: ${error.message}\n`;
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
        // Already handled in the initial pass.
        break;
      case 'MientrasStatement':
        // this.output += `// INFO: Estructura 'Mientras' reconocida por el parser. La lógica de ejecución del bucle aún no está implementada en el evaluador.\n`;
        // For now, Mientras loops are parsed but not executed.
        // Execution logic will be added in a future step.
        break;
      default:
        this.runtimeError(`Sentencia desconocida o no manejada '${(statement as ASTNode)?.type}'.`, statement);
        break;
    }
  }

  private evaluateDefineStatement(node: DefineStatementNode): void {
    for (const id of node.identifiers) {
      // PSeInt initializes numeric to 0, logical to Falso, string to ""
      if (!this.environment.has(id.name) || this.environment.get(id.name) === undefined) {
        const typeLower = node.dataType.name.toLowerCase();
        if (typeLower === 'entero' || typeLower === 'real' || typeLower === 'numero') {
            this.environment.set(id.name, 0);
        } else if (typeLower === 'logico') {
            this.environment.set(id.name, false);
        } else if (typeLower === 'caracter' || typeLower === 'texto' || typeLower === 'cadena') {
             this.environment.set(id.name, "");
        } else {
            // For custom types or uninitialized, PSeInt might behave differently.
            // For simplicity, we can set to undefined or a specific initial value.
            this.environment.set(id.name, undefined);
        }
      }
    }
  }

  private evaluateAssignmentStatement(node: AssignmentStatementNode): void {
    const value = this.evaluateExpression(node.expression);
    this.environment.set(node.identifier.name, value);
    // Removed: this.output += `> ASIGNAR: Variable '${node.identifier.name}' toma el valor: ${this.formatValueForOutput(value)}\n`;
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      let rawInputValue: string | null = null;
      const variableName = id.name;
      // Removed: this.output += `Ejecutando LEER para la variable: '${variableName}'.\n`;

      if (this.preSuppliedInputs && this.currentInputIndex < this.preSuppliedInputs.length) {
        rawInputValue = this.preSuppliedInputs[this.currentInputIndex];
        this.currentInputIndex++;
        // Removed: this.output += `  Fuente: Input Console, valor provisto: "${rawInputValue}" (para '${variableName}')\n`;
      } else {
        // Removed: this.output += `  Fuente: Prompt Interactivo. Esperando entrada del usuario para '${variableName}'...\n`;
        rawInputValue = window.prompt(`Ingrese valor para ${variableName}:`);
        // if (rawInputValue !== null) {
        // Removed: this.output += `  Usuario ingresó (desde Prompt Interactivo): "${rawInputValue}" (para '${variableName}')\n`;
        // } else {
        // Removed: this.output += `  Entrada cancelada por el usuario para '${variableName}' (desde Prompt Interactivo).\n`;
        // }
      }

      if (rawInputValue === null) {
        // Handle cancelled prompt: variable keeps its value or becomes undefined if not previously set.
        // Removed: this.output += `Advertencia: Entrada cancelada o no proporcionada para '${variableName}'.`;
        if (!this.environment.has(variableName)) {
           this.environment.set(variableName, undefined); 
           // Removed: this.output += ` La variable '${variableName}' no tenía valor previo y queda indefinida/sin inicializar.\n`;
        }
        // else { const currentValue = this.environment.get(variableName); Removed: this.output += ` La variable '${variableName}' conserva su valor anterior: ${this.formatValueForOutput(currentValue)}.\n`; }
        continue; 
      }

      const trimmedInput = rawInputValue.trim();
      let assignedValue: any;
      // Removed: let typeOfValue: string;

      const numInput = parseFloat(trimmedInput);
      if (!isNaN(numInput) && String(numInput) === trimmedInput.replace(',', '.')) { // PSeInt might use comma for decimals
        assignedValue = numInput;
        // Removed: typeOfValue = 'Número';
      } else if (trimmedInput.toLowerCase() === "verdadero") {
        assignedValue = true;
        // Removed: typeOfValue = 'Lógico';
      } else if (trimmedInput.toLowerCase() === "falso") {
        assignedValue = false;
        // Removed: typeOfValue = 'Lógico';
      } else {
        // Treat as string if it's not clearly a number or boolean
        // PSeInt's string literals are usually quoted, but Leer reads raw input.
        assignedValue = rawInputValue; 
        // Removed: typeOfValue = 'Texto';
      }
      this.environment.set(variableName, assignedValue);
      // Removed: this.output += `> LEER ASIGNADO: Variable '${variableName}' (entrada original: "${rawInputValue}") toma el valor ${this.formatValueForOutput(assignedValue)} (interpretado como ${typeOfValue})\n`;
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
        this.runtimeError(`Se encontró una expresión nula o inválida.`, expression);
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
          const value = this.environment.get(varName);
          if (value === undefined) {
             // Removed: this.output += `Advertencia: Variable '${varName}' usada pero su valor es indefinido. Puede causar un error o comportamiento inesperado.\n`;
          }
          return value;
        }
        // Removed: this.output += `Advertencia: Variable '${varName}' usada sin valor asignado previamente (o sin Definir explícitamente un valor inicial). Puede causar un error o comportamiento inesperado.\n`;
        // In a stricter interpreter, this should likely be a runtime error.
        // For PSeInt's flexibility, it often defaults to 0 for numbers, "" for strings, false for booleans if not defined.
        // However, our DefineStatement handles initialization, so reaching here for an unknown var is more problematic.
        // For now, returning undefined which might lead to errors in operations.
        this.runtimeError(`Variable '${varName}' no definida.`, expression);
        return undefined; 
      case 'BinaryExpression':
        return this.evaluateBinaryExpression(expression as BinaryExpressionNode);
      default:
        this.runtimeError(`Tipo de expresión desconocido o no manejado '${(expression as ASTNode)?.type}'.`, expression);
        return undefined;
    }
  }

  private evaluateBinaryExpression(node: BinaryExpressionNode): any {
    const left = this.evaluateExpression(node.left);
    const right = this.evaluateExpression(node.right);

    if (node.operator === TokenType.OPERATOR_PLUS && (typeof left === 'string' || typeof right === 'string')) {
        const leftStr = (left === undefined || left === null) ? "" : String(left);
        const rightStr = (right === undefined || right === null) ? "" : String(right);
        return leftStr + rightStr;
    }

    if (left === undefined || right === undefined) {
        let missingVars = [];
        if (left === undefined && node.left.type === 'Identifier') missingVars.push((node.left as IdentifierNode).name);
        if (right === undefined && node.right.type === 'Identifier') missingVars.push((node.right as IdentifierNode).name);
        
        let message = `Operación '${node.operator}' con valor(es) indefinido(s).`;
        if (missingVars.length > 0) {
            message += ` Variable(s) no inicializada(s) o con valor indefinido: ${missingVars.join(', ')}.`;
        }
        message += ` (L: ${this.formatValueForOutput(left)}, R: ${this.formatValueForOutput(right)}). Asegúrese de que las variables estén inicializadas.`;
        this.runtimeError(message, node);
        return NaN; // Return NaN for undefined arithmetic results
    }
    
    // Check for numeric types for arithmetic operations
    const arithmeticOps = [
        TokenType.OPERATOR_MINUS, TokenType.OPERATOR_MULTIPLY, 
        TokenType.OPERATOR_DIVIDE, TokenType.OPERATOR_MODULO
    ];
    if (arithmeticOps.includes(node.operator)) {
        if (typeof left !== 'number' || typeof right !== 'number') {
            this.runtimeError(`Los operandos deben ser números para el operador aritmético '${node.operator}'. Se obtuvo ${typeof left} ('${left}') y ${typeof right} ('${right}').`, node);
            return NaN;
        }
    }

    switch (node.operator) {
      case TokenType.OPERATOR_PLUS: 
        if (typeof left === 'number' && typeof right === 'number') {
            return left + right;
        }
        // String concatenation already handled above.
        // If we reach here, it's an invalid + operation (e.g. boolean + number)
        this.runtimeError(`No se puede sumar ${typeof left} ('${left}') con ${typeof right} ('${right}').`, node);
        return NaN;
      case TokenType.OPERATOR_MINUS:
        return (left as number) - (right as number);
      case TokenType.OPERATOR_MULTIPLY:
        return (left as number) * (right as number);
      case TokenType.OPERATOR_DIVIDE:
        if (right === 0) {
          this.runtimeError('División por cero.', node);
          return NaN;
        }
        return (left as number) / (right as number);
      case TokenType.OPERATOR_MODULO:
         if (right === 0) {
            this.runtimeError('Módulo por cero.', node);
            return NaN;
        }
        return (left as number) % (right as number);
      // TODO: Add comparison and logical operators
      default:
        this.runtimeError(`Operador binario desconocido o no manejado '${node.operator}'.`, node);
        return undefined;
    }
  }

  private evaluateWriteStatement(node: WriteStatementNode): void {
    let lineOutputParts: string[] = [];
    for (const expr of node.expressions) {
      const value = this.evaluateExpression(expr);
      lineOutputParts.push(this.formatValueForOutput(value));
    }
    this.output += lineOutputParts.join('') + '\n';
  }

  private formatValueForOutput(value: any): string {
    if (typeof value === 'string') {
      return value; 
    } else if (typeof value === 'boolean') {
      return value ? 'VERDADERO' : 'FALSO'; 
    } else if (value === undefined) {
      return "[indefinido]"; // Should ideally not be directly output by 'Escribir' from an uninitialized var
    } else if (value === null) {
      return "[nulo]"; 
    }
    return String(value);
  }

  private runtimeError(message: string, node: ASTNode | null) {
    let details = message;
    if (node && node.line !== undefined && node.column !== undefined) {
      // Construct a more PSeInt-like error message if possible
      details = `Error en linea ${node.line}, columna ${node.column}: ${message}`;
    }
    // Instead of throwing, append to output for now, or have a separate error stream
    // throw new Error(details);
    // For now, to make it visible, we'll append to output, but this should be refined
    this.output += `${details}\n`; 
    // And to stop further execution on this path to prevent cascading errors
    throw new Error(details); // This will be caught by the top-level try-catch in evaluate()
  }
}

