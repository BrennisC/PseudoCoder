
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Info } from 'lucide-react';

interface InputConsoleProps {
  value: string;
  onChange: (value: string) => void;
}

const InputConsole: React.FC<InputConsoleProps> = ({ value, onChange }) => {
  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-xl font-headline">Input Console</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="mr-1 h-4 w-4" />
          <span>Enter each input on a new line.</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your inputs here, one per line..."
          className="h-full w-full resize-none font-code text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-3"
          aria-label="Input console for pseudocode execution"
        />
      </CardContent>
    </Card>
  );
};

export default InputConsole;
