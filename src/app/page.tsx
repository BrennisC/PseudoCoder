
"use client";

import * as React from 'react';
import CodeEditor from '@/components/pseudo-coder/code-editor';
import RequirementsDisplay from '@/components/pseudo-coder/requirements-display';
import OutputConsole from '@/components/pseudo-coder/output-console';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play } from 'lucide-react';

export default function PseudoCoderPage() {
  const [code, setCode] = React.useState<string>('');
  const [requirements, setRequirements] = React.useState<string>('// Example Requirement\n// Create a program that asks for two numbers and displays their sum.');
  const [output, setOutput] = React.useState<string>('');
  const { toast } = useToast();

  const handleExecute = () => {
    if (!code.trim()) {
      setOutput('Error: No code to execute. Please write some pseudocode in the editor.');
      toast({
        title: "Execution Error",
        description: "No code to execute.",
        variant: "destructive",
      });
      return;
    }
    // Simulate execution
    // For a real interpreter, this is where you'd call it.
    // We'll just echo the code with a message.
    setOutput(`Simulating execution of:\n\n${code}\n\n// --- Execution Result --- \n// Program finished successfully. (Simulated)`);
    toast({
      title: "Execution Successful",
      description: "Pseudocode 'executed'. Output displayed in console.",
      variant: "default" // Explicitly set variant, 'default' is usually white background
    });
  };

  const handleClearCode = () => {
    setCode('');
    setOutput('Editor cleared. Ready for new pseudocode.');
    toast({
      title: "Editor Cleared",
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
        title: "Save Error",
        description: "Nothing to save. Code editor is empty.",
        variant: "destructive",
      });
      return;
    }
    downloadFile(code, 'pseudocode.psc', 'text/plain;charset=utf-8');
    toast({
      title: "Code Saved",
      description: "Your pseudocode has been downloaded as 'pseudocode.psc'.",
    });
  };
  
  const handleSaveRequirements = () => {
    if (!requirements.trim()) {
      toast({
        title: "Save Error",
        description: "Nothing to save. Requirements area is empty.",
        variant: "destructive",
      });
      return;
    }
    downloadFile(requirements, 'requirements.txt', 'text/plain;charset=utf-8');
    toast({
      title: "Requirements Saved",
      description: "The requirements have been downloaded as 'requirements.txt'.",
    });
  };

  const loadFileContent = (file: File, setter: (content: string) => void, type: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target?.result as string);
      setOutput(`${type} file "${file.name}" loaded.`);
      toast({
        title: `${type} File Loaded`,
        description: `"${file.name}" loaded successfully.`,
      });
    };
    reader.onerror = () => {
      setOutput(`Error loading ${type} file "${file.name}".`);
      toast({
        title: `Load Error`,
        description: `Could not load ${type} file "${file.name}".`,
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  const handleLoadCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFileContent(file, setCode, "Code");
    }
    event.target.value = ''; // Reset file input
  };

  const handleLoadRequirements = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadFileContent(file, setRequirements, "Requirements");
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
          <Play className="mr-2 h-5 w-5" /> Execute Code
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
