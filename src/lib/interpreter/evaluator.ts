
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
      // Primero, procesar todas las declaraciones Definir para inicializar variables
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
      // Luego, evaluar todas las demás declaraciones
      for (const statement of program.body) {
         if (statement.type !== 'DefineStatement') { // Ya las procesamos
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
        // Ya se manejan en la pasada inicial, pero no debería hacer daño si se llama de nuevo
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
      // Solo definir si no existe, para no sobrescribir un valor ya asignado por Leer, por ejemplo.
      // Opcionalmente, PSeInt podría reinicializar o dar error si se re-define. Por ahora, no sobrescribimos.
      if (!this.environment.has(id.name)) {
        const typeLower = node.dataType.name.toLowerCase();
        if (typeLower === 'entero' || typeLower === 'real' || typeLower === 'numero') {
            this.environment.set(id.name, 0);
        } else if (typeLower === 'logico') {
            this.environment.set(id.name, false);
        } else if (typeLower === 'caracter' || typeLower === 'texto' || typeLower === 'cadena') {
             this.environment.set(id.name, "");
        } else {
            // Para tipos desconocidos o no implementados (ej. arreglos, registros)
            this.environment.set(id.name, undefined); 
        }
      }
    }
  }

  private evaluateAssignmentStatement(node: AssignmentStatementNode): void {
    if (!this.environment.has(node.identifier.name)) {
        // PSeInt es flexible y permite usar variables sin Definir explícitamente.
        // Si no está definida, la añadimos al entorno.
        // Alternativamente, se podría lanzar un error si se quiere ser más estricto.
        // this.runtimeError(`Variable '${node.identifier.name}' no ha sido definida.`, node);
        // return; 
    }
    const value = this.evaluateExpression(node.expression);
    this.environment.set(node.identifier.name, value);
  }

  private evaluateReadStatement(node: ReadStatementNode): void {
    for (const id of node.identifiers) {
      let inputValue: string | null = null;

      if (this.preSuppliedInputs && this.currentInputIndex < this.preSuppliedInputs.length) {
        inputValue = this.preSuppliedInputs[this.currentInputIndex];
        this.currentInputIndex++;
        this.output += `> ${id.name} = ${inputValue}\n`; // Echo input to output console
      } else {
        inputValue = window.prompt(`Ingrese valor para ${id.name}:`);
        if (inputValue !== null) {
           this.output += `> ${id.name} = ${inputValue}\n`; // Echo input to output console
        }
      }

      if (inputValue === null) { 
        this.output += `Advertencia: Entrada cancelada para la variable '${id.name}'. Se le asignará 'indefinido'.\n`;
        this.environment.set(id.name, undefined); 
        continue;
      }
      
      // Intentar convertir a número si es posible
      const numInput = parseFloat(inputValue);
      if (!isNaN(numInput) && String(numInput) === inputValue.trim()) {
        this.environment.set(id.name, numInput);
      } else if (inputValue.toLowerCase() === "verdadero") {
        this.environment.set(id.name, true);
      } else if (inputValue.toLowerCase() === "falso") {
        this.environment.set(id.name, false);
      } else { // Tratar como cadena si no es número ni booleano PSeInt
        this.environment.set(id.name, inputValue); 
      }
    }
  }

  private evaluateProcesoBlock(node: ProcesoBlockNode): void {
    for (const statement of node.body) {
       if (statement.type !== 'DefineStatement') { // Ya las procesamos globalmente
         this.evaluateStatement(statement);
       }
    }
  }

  private evaluateMientrasStatement(node: MientrasStatementNode): void {
    // Placeholder: For now, we just acknowledge the statement.
    // Actual loop logic (evaluating condition, executing body) will be implemented later.
    this.output += "// Bucle 'Mientras' encontrado, pero aún no se ejecuta.\n";
    // console.log("Mientras statement encountered, condition:", node.condition, "body:", node.body.length, "statements");
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
        // PSeInt es flexible aquí, puede devolver 0 o "" o error.
        // Por ahora, devolvemos un valor que indique que no está definida explícitamente para evitar errores fatales.
        // Podría ser 0 para números, "" para cadenas, false para lógicos si no están definidos.
        // O lanzar un error si queremos ser más estrictos.
        this.output += `Advertencia: Variable '${varName}' usada sin valor asignado previamente (o sin Definir). Se asume un valor por defecto o podría causar error.\n`;
        return undefined; // O un valor por defecto según el contexto esperado
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

    // Lógica para manejar operandos indefinidos (común si las variables no se inicializaron)
    if (left === undefined || right === undefined) {
        // Para operaciones numéricas, si uno es undefined, PSeInt a menudo trata undefined como 0.
        // Para concatenación de cadenas, podría tratar undefined como "".
        // Por ahora, lanzaremos un error para ser más claros, pero esto podría flexibilizarse.
        if (typeof left !== 'string' && typeof right !== 'string' && node.operator === TokenType.OPERATOR_PLUS) {
             this.runtimeError(`Operación aritmética con valor indefinido. L: ${left}, R: ${right} para operador '${node.operator}'. Asegúrese de que las variables estén inicializadas.`, node);
             return NaN;
        }
        // Si es concatenación, permite undefined como cadena vacía
         if (node.operator === TokenType.OPERATOR_PLUS && (typeof left === 'string' || typeof right === 'string')) {
            return String(left === undefined ? "" : left) + String(right === undefined ? "" : right);
        }
    }


    if (typeof left === 'string' || typeof right === 'string') {
        if (node.operator === TokenType.OPERATOR_PLUS) {
            return String(left) + String(right); 
        } else {
            this.runtimeError(`Operator '${node.operator}' cannot be applied to strings here (unless it's + for concatenation).`, node);
            return undefined;
        }
    }
    
    // Para operadores no aritméticos, o si uno de los operandos no es un número (y no es concatenación)
    if (node.operator !== TokenType.OPERATOR_PLUS && 
        node.operator !== TokenType.OPERATOR_MINUS && 
        node.operator !== TokenType.OPERATOR_MULTIPLY && 
        node.operator !== TokenType.OPERATOR_DIVIDE && 
        node.operator !== TokenType.OPERATOR_MODULO) {
        // Aquí irían operadores lógicos, relacionales
    } else if (typeof left !== 'number' || typeof right !== 'number') {
        this.runtimeError(`Operands must be numbers for arithmetic operator '${node.operator}'. Got ${typeof left} and ${typeof right}.`, node);
        return NaN;
    }


    switch (node.operator) {
      case TokenType.OPERATOR_PLUS:
        if (typeof left === 'number' && typeof right === 'number') return left + right;
        // La concatenación de string ya se manejó arriba
        this.runtimeError(`Cannot add ${typeof left} and ${typeof right}.`, node); return NaN;
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
    throw new Error(details);
  }
}
