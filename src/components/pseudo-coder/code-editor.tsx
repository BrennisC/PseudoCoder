
"use client";

import * as React from 'react';
import Editor from 'react-simple-code-editor';
import { Card, CardContent } from "@/components/ui/card";
import { lexer } from '@/lib/interpreter/lexer';
import { TokenType, type Token } from '@/lib/interpreter/types';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  // onClear, onSave, onLoad are removed as buttons are handled at page level now
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode }) => {
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<any>(null); 

  const [lineCount, setLineCount] = React.useState(1);

  React.useEffect(() => {
    setLineCount(code.split('\n').length);
  }, [code]);

  React.useEffect(() => {
    const editorComponentInstance = editorRef.current;
    const lineNumbersDiv = lineNumbersRef.current;

    if (editorComponentInstance && editorComponentInstance._input && lineNumbersDiv) {
      const textareaElement = editorComponentInstance._input as HTMLTextAreaElement;

      const handleScroll = () => {
        if (lineNumbersDiv) {
          lineNumbersDiv.scrollTop = textareaElement.scrollTop;
        }
      };
      
      const syncStylesAndScroll = () => {
        if (!textareaElement || !lineNumbersDiv) return;
        
        lineNumbersDiv.scrollTop = textareaElement.scrollTop; 

        const preElement = textareaElement.parentElement?.querySelector('pre');
        if (preElement) { 
          const computedStyle = window.getComputedStyle(preElement);
          lineNumbersDiv.style.fontFamily = computedStyle.fontFamily;
          lineNumbersDiv.style.fontSize = computedStyle.fontSize;
          lineNumbersDiv.style.lineHeight = computedStyle.lineHeight;
          lineNumbersDiv.style.paddingTop = computedStyle.paddingTop;
          lineNumbersDiv.style.paddingBottom = computedStyle.paddingBottom;
        }
      };

      textareaElement.addEventListener('scroll', handleScroll);
      syncStylesAndScroll(); 

      return () => {
        textareaElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [code, lineCount]);

  const highlightCode = (codeToHighlight: string): (string | JSX.Element)[] => {
    const tokens = lexer(codeToHighlight);
    const result: (string | JSX.Element)[] = [];
    let currentIndex = 0;

    for (const token of tokens) {
      if (token.type === TokenType.EOF) break;

      if (token.startIndex > currentIndex) {
        result.push(codeToHighlight.substring(currentIndex, token.startIndex));
      }
      
      let className = '';
      switch (token.type) {
        case TokenType.KEYWORD_ALGORITMO:
        case TokenType.KEYWORD_FINALGORITMO:
        case TokenType.KEYWORD_PROCESO:
        case TokenType.KEYWORD_FINPROCESO:
        case TokenType.KEYWORD_SUBPROCESO:
        case TokenType.KEYWORD_FINSUBPROCESO:
        case TokenType.KEYWORD_DEFINIR:
        case TokenType.KEYWORD_COMO:
        case TokenType.KEYWORD_LEER:
        case TokenType.KEYWORD_ESCRIBIR:
        case TokenType.KEYWORD_SI:
        case TokenType.KEYWORD_ENTONCES:
        case TokenType.KEYWORD_SINO:
        case TokenType.KEYWORD_FINSI:
        case TokenType.KEYWORD_SEGUN:
        case TokenType.KEYWORD_HACER_SEGUN:
        case TokenType.KEYWORD_DEOTROMODO:
        case TokenType.KEYWORD_FINSEGUN:
        case TokenType.KEYWORD_MIENTRAS:
        case TokenType.KEYWORD_HACER_MIENTRAS:
        case TokenType.KEYWORD_FINMIENTRAS:
        case TokenType.KEYWORD_REPETIR:
        case TokenType.KEYWORD_HASTAQUE:
        case TokenType.KEYWORD_PARA:
        case TokenType.KEYWORD_HASTA:
        case TokenType.KEYWORD_CON:
        case TokenType.KEYWORD_PASO:
        case TokenType.KEYWORD_FINPARA:
        case TokenType.KEYWORD_FUNCION:
        case TokenType.KEYWORD_FINFUNCION:
        case TokenType.KEYWORD_DIMENSION:
        case TokenType.KEYWORD_ENTERO:
        case TokenType.KEYWORD_REAL:
        case TokenType.KEYWORD_NUMERO:
        case TokenType.KEYWORD_LOGICO:
        case TokenType.KEYWORD_CARACTER:
        case TokenType.KEYWORD_TEXTO:
        case TokenType.KEYWORD_CADENA:
        case TokenType.KEYWORD_VERDADERO:
        case TokenType.KEYWORD_FALSO:
        case TokenType.KEYWORD_VARIABLE:
        case TokenType.KEYWORD_CONSTANTE:
        case TokenType.KEYWORD_DESDE:
        case TokenType.KEYWORD_HACER: 
        case TokenType.KEYWORD_CASO:
        case TokenType.KEYWORD_POR_REFERENCIA:
        case TokenType.KEYWORD_DE:
        case TokenType.KEYWORD_RETORNAR:
        case TokenType.KEYWORD_FIN:
        case TokenType.KEYWORD_TIPO:
        case TokenType.KEYWORD_REGISTRO:
        case TokenType.KEYWORD_ARREGLO:
        case TokenType.KEYWORD_PROCEDIMIENTO:
        case TokenType.KEYWORD_FINPROCEDIMIENTO:
        case TokenType.KEYWORD_MODULO:
        case TokenType.KEYWORD_FINMODULO:
        case TokenType.KEYWORD_LOGICAL_AND:
        case TokenType.KEYWORD_LOGICAL_OR:
        case TokenType.KEYWORD_LOGICAL_NOT:
          className = 'text-primary font-bold';
          break;
        case TokenType.STRING_LITERAL:
          className = 'text-accent-foreground'; 
          break;
        case TokenType.NUMBER_LITERAL:
          className = 'text-orange-500';
          break;
        case TokenType.IDENTIFIER:
          className = 'text-purple-600';
          break;
        case TokenType.OPERATOR_ASSIGN:
        case TokenType.OPERATOR_PLUS:
        case TokenType.OPERATOR_MINUS:
        case TokenType.OPERATOR_MULTIPLY:
        case TokenType.OPERATOR_DIVIDE:
        case TokenType.OPERATOR_MODULO:
        case TokenType.OPERATOR_POWER:
        case TokenType.OPERATOR_EQ:
        case TokenType.OPERATOR_NEQ:
        case TokenType.OPERATOR_LT:
        case TokenType.OPERATOR_GT:
        case TokenType.OPERATOR_LTE:
        case TokenType.OPERATOR_GTE:
          className = 'text-cyan-600';
          break;
        case TokenType.COMMENT:
          className = 'text-gray-500 italic';
          break;
        case TokenType.LPAREN:
        case TokenType.RPAREN:
        case TokenType.LBRACKET:
        case TokenType.RBRACKET:
        case TokenType.COMMA:
        case TokenType.SEMICOLON:
        case TokenType.COLON:
           className = 'text-gray-700'; 
           break;
        case TokenType.WHITESPACE:
        case TokenType.NEWLINE:
          result.push(token.value); 
          currentIndex = token.startIndex + token.value.length;
          continue;
        default: 
          result.push(token.value);
          currentIndex = token.startIndex + token.value.length;
          continue;
      }
      
      result.push(<span key={`${token.startIndex}-${token.line}-${token.column}`} className={className}>{token.value}</span>);
      currentIndex = token.startIndex + token.value.length;
    }

    if (currentIndex < codeToHighlight.length) {
      result.push(codeToHighlight.substring(currentIndex));
    }
    return result;
  };

  const editorBaseStyle = {
    fontFamily: '"Source Code Pro", monospace',
    fontSize: '0.875rem', 
    lineHeight: '1.25rem', 
  };

  const editorPadding = 12; 

  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg overflow-hidden">
      {/* Removed CardHeader as buttons are no longer here */}
      <CardContent className="flex-grow flex p-0 bg-background">
        <div
          ref={lineNumbersRef}
          className="text-right select-none bg-muted text-muted-foreground"
          style={{
            width: '50px', 
            paddingRight: '10px',
            overflowY: 'hidden', 
            height: '100%', 
            boxSizing: 'border-box',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).map((lineNumber) => (
            <div key={lineNumber} style={{ height: editorBaseStyle.lineHeight }}>
              {lineNumber}
            </div>
          ))}
        </div>
        <Editor
          ref={editorRef} 
          value={code}
          onValueChange={setCode}
          highlight={highlightCode}
          padding={editorPadding} 
          textareaClassName="outline-none"
          preClassName="outline-none" 
          style={{
            ...editorBaseStyle,
            minHeight: '100%', 
            flexGrow: 1,       
            caretColor: 'var(--foreground)', 
            backgroundColor: 'var(--background)', 
          }}
          className="w-full bg-background text-foreground" 
          aria-label="Pseudocode editor"
        />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
