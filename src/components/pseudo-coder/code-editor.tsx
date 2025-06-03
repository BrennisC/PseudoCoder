
"use client";

import * as React from 'react';
import Editor from 'react-simple-code-editor';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Trash2 } from 'lucide-react';
import { lexer } from '@/lib/interpreter/lexer';
import { TokenType, type Token } from '@/lib/interpreter/types';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, onClear, onSave, onLoad }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

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

  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b shrink-0">
        <CardTitle className="text-xl font-headline">Code Editor</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLoadClick} aria-label="Load code from file">
            <UploadCloud className="mr-2 h-4 w-4" /> Load
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onLoad}
            style={{ display: 'none' }}
            accept=".txt,.psc,.md"
          />
          <Button variant="outline" size="sm" onClick={onSave} aria-label="Save code to file">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button variant="destructive" size="sm" onClick={onClear} aria-label="Clear editor content">
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-auto"> 
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={highlightCode}
            padding={12} 
            textareaClassName="outline-none"
            preClassName="outline-none"
            style={{
              fontFamily: '"Source Code Pro", monospace',
              fontSize: '0.875rem', 
              lineHeight: '1.25rem', 
              minHeight: '100%', 
              caretColor: 'var(--foreground)', 
            }}
            className="w-full bg-background text-foreground" 
            aria-label="Pseudocode editor"
          />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
