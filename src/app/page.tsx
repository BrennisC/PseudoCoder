
"use client";

import * as React from 'react';
import CodeEditor from '@/components/pseudo-coder/code-editor';
import RequirementsDisplay from '@/components/pseudo-coder/requirements-display';
import OutputConsole from '@/components/pseudo-coder/output-console';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play } from 'lucide-react';
import { executePseudocode } from '@/lib/interpreter'; // Import the interpreter

export default function PseudoCoderPage() {
  const [code, setCode] = React.useState<string>('// Ejemplo:\n// ESCRIBIR "Hola Mundo"\n');
  const [requirements, setRequirements] = React.useState<string>('// Requerimiento de Ejemplo\n// Crear un programa que muestre "Hola Mundo" en la consola.');
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
    
    const result = executePseudocode(code);
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

  const handleClearCode = () => {
    setCode('');
    setOutput('Editor limpiado. Listo para nuevo pseudocódigo.');
    toast({
      title: "Editor Limpiado",
    });
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
  
  const handleSaveRequirements = () => {
    if (!requirements.trim()) {
      toast({
        title: "Error al Guardar",
        description: "Nada que guardar. El área de requerimientos está vacía.",
        variant: "destructive",
      });
      return;
    }
    downloadFile(requirements, 'requirements.txt', 'text/plain;charset=utf-8');
    toast({
      title: "Requerimientos Guardados",
      description: "Los requerimientos han sido descargados como 'requirements.txt'.",
    });
  };

  const loadFileContent = (file: File, setter: (content: string) => void, type: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target?.result as string);
      setOutput(`Archivo de ${type} "${file.name}" cargado.`);
      toast({
        title: `Archivo de ${type} Cargado`,
        description: `"${file.name}" cargado exitosamente.`,
      });
    };
    reader.onerror = () => {
      setOutput(`Error cargando archivo de ${type} "${file.name}".`);
      toast({
        title: `Error de Carga`,
        description: `No se pudo cargar el archivo de ${type} "${file.name}".`,
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const handleLoadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFileContent(file, setCode, "Código");
    }
    event.target.value = ''; // Reset file input
  };

  const handleLoadRequirements = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFileContent(file, setRequirements, "Requerimientos");
    }
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4 gap-4 overflow-hidden">
      <header className="flex justify-between items-center py-3 px-2 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-headline font-semibold text-primary">PseudoCoder</h1>
        <Button 
          onClick={handleExecute} 
          className="bg-accent hover:bg-accent/90 text-accent-foreground transition-colors duration-150 shadow-md"
          aria-label="Execute pseudocode"
        >
          <Play className="mr-2 h-5 w-5" /> Ejecutar Código
        </Button>
      </header>

      <main className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0"> {/* min-h-0 for flex children */}
        <div className="md:col-span-2 flex flex-col min-h-0"> {/* Added min-h-0 */}
          <CodeEditor
            code={code}
            setCode={setCode}
            onClear={handleClearCode}
            onSave={handleSaveCode}
            onLoad={handleLoadCode}
          />
        </div>

        <div className="flex flex-col gap-4 min-h-0"> {/* Added min-h-0 */}
          <div className="flex-1 min-h-0"> {/* Added min-h-0 to allow child to grow */}
             <RequirementsDisplay
                requirements={requirements}
                setRequirements={setRequirements}
                onSave={handleSaveRequirements}
                onLoad={handleLoadRequirements}
              />
          </div>
          <div className="flex-1 min-h-0"> {/* Added min-h-0 to allow child to grow */}
            <OutputConsole output={output} />
          </div>
        </div>
      </main>
    </div>
  );
}
