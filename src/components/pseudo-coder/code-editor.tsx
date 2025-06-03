
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Trash2 } from 'lucide-react';

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

  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
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
      <CardContent className="flex-grow p-0"> {/* Removed padding to maximize editor space */}
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your PSeInt pseudocode here..."
          className="h-full w-full resize-none font-code text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-3"
          aria-label="Pseudocode editor"
        />
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
