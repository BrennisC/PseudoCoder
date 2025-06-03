
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
// Info icon removed

interface InputConsoleProps {
  value: string;
  onChange: (value: string) => void;
}

const InputConsole: React.FC<InputConsoleProps> = ({ value, onChange }) => {
  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-xl font-headline">INPUT</CardTitle>
        {/* Info icon and text removed */}
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escriba sus entradas aquí, una por línea..."
          className="h-full w-full resize-none font-code text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-3"
          aria-label="Consola de entrada para ejecución de pseudocódigo"
        />
      </CardContent>
    </Card>
  );
};

export default InputConsole;
