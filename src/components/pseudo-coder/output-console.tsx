
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutputConsoleProps {
  output: string;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ output }) => {
  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-xl font-headline">OUTPUT</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <div 
          className="h-full w-full bg-muted/70 p-3 font-code text-sm rounded-b-lg overflow-auto whitespace-pre-wrap"
          aria-live="polite"
          role="log"
        >
          {output || "La salida aparecerá aquí..."}
        </div>
      </CardContent>
    </Card>
  );
};

export default OutputConsole;
