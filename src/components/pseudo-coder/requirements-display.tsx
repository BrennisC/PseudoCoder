
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save } from 'lucide-react'; // Using Save icon (FileText might be too specific)

interface RequirementsDisplayProps {
  requirements: string;
  setRequirements: (requirements: string) => void;
  onSave: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const RequirementsDisplay: React.FC<RequirementsDisplayProps> = ({ requirements, setRequirements, onSave, onLoad }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Card className="flex flex-col flex-grow shadow-lg rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-xl font-headline">Exercise Requirements</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleLoadClick} aria-label="Load requirements from file">
            <UploadCloud className="mr-2 h-4 w-4" /> Load
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onLoad}
            style={{ display: 'none' }}
            accept=".txt,.md"
          />
          <Button variant="outline" size="sm" onClick={onSave} aria-label="Save requirements to file">
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <Textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Enter or load exercise requirements here..."
          className="h-full w-full resize-none font-body text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none p-3"
          aria-label="Exercise requirements editor"
        />
      </CardContent>
    </Card>
  );
};

export default RequirementsDisplay;
