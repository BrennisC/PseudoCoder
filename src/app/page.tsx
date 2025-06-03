
"use client";

import * as React from 'react';
import CodeEditor from '@/components/pseudo-coder/code-editor';
import InputConsole from '@/components/pseudo-coder/input-console';
import OutputConsole from '@/components/pseudo-coder/output-console';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, SaveIcon } from 'lucide-react'; // SaveIcon might be better than generic Save
import { executePseudocode } from '@/lib/interpreter'; 

export default function PseudoCoderPage() {
  const [code, setCode] = React.useState<string>('// Ejemplo:\n// ESCRIBIR "Hola Mundo"\nProceso Suma\n    // para cargar un dato, se le muestra un mensaje al u\n    // con la instrucción Escribir, y luego se lee el dat\n    // una variable (A para el primero, B para el segundo\n    // la instrucción Leer\n\n    Escribir "Ingrese el primer numero:"\n    Leer A\n\n    Escribir "Ingrese el segundo numero:"\n    Leer B\n\n    // ahora se calcula la suma y se guarda el resultado\n    // variable C mediante la asignación (<-)\n\n    C <- A+B\n\n    // finalmente, se muestra el resultado, precedido de\n    // mensaje para avisar al usuario, todo en una sola\n    // instrucción Escribir\nFinProceso');
  const [rawInput, setRawInput] = React.useState<string>('');
  const [output, setOutput] = React.useState<string>('');
  const { toast } = useToast();

  const handleExecute = () => {
    if (!code.trim()) {
      setOutput('Error: No hay código para ejecutar. Por favor, escribe algo de pseudocódigo en el editor.');
      toast({
        title: "Error de Ejecución",
        description: "No hay código para ejecutar.",
        variant: "destructive",
      });
      return;
    }
    
    const preSuppliedInputs = rawInput.length > 0 ? rawInput.split('\n') : [];
    const result = executePseudocode(code, preSuppliedInputs);
    setOutput(result);

    if (result.startsWith("Error:")) {
      toast({
        title: "Error de Ejecución",
        description: result,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Ejecución Exitosa",
        description: "Pseudocódigo ejecutado. Salida mostrada en la consola.",
        variant: "default"
      });
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleSaveCode = () => {
    if (!code.trim()) {
      toast({
        title: "Error al Guardar",
        description: "Nada que guardar. El editor de código está vacío.",
        variant: "destructive",
      });
      return;
    }
    downloadFile(code, 'pseudocode.psc', 'text/plain;charset=utf-8');
    toast({
      title: "Código Guardado",
      description: "Tu pseudocódigo ha sido descargado como 'pseudocode.psc'.",
    });
  };

  // handleClearCode, handleLoadCode are removed as their buttons are removed from CodeEditor
  // Requirements related states and handlers are removed

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="flex justify-between items-center py-3 px-6 border-b border-border shrink-0">
        <h1 className="text-2xl sm:text-3xl font-headline font-semibold text-primary">PseudoCoder</h1>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 p-4 min-h-0">
        {/* Left Column: Code Editor */}
        <div className="md:col-span-2 flex flex-col min-h-0"> 
          <CodeEditor
            code={code}
            setCode={setCode}
            // onClear, onSave, onLoad props are removed as buttons are no longer in CodeEditor
          />
        </div>

        {/* Right Column: Controls, Input, Output */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex gap-2 shrink-0">
            <Button 
              onClick={handleExecute} 
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-150 shadow-md py-3 text-base"
              aria-label="Execute pseudocode"
            >
              <Play className="mr-2 h-5 w-5" /> EJECUTAR
            </Button>
            <Button 
              onClick={handleSaveCode}
              variant="outline"
              className="flex-1 py-3 text-base shadow-md"
              aria-label="Save code"
            >
              <SaveIcon className="mr-2 h-5 w-5" /> SAVE
            </Button>
          </div>

          <div className="flex-1 min-h-0">
            <InputConsole
              value={rawInput}
              onChange={setRawInput}
            />
          </div>
          <div className="flex-1 min-h-0"> 
            <OutputConsole output={output} />
          </div>
        </div>
      </main>
    </div>
  );
}
