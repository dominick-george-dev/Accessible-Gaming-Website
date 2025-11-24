import { useState, useEffect } from 'react';
import { Undo } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { undoManager, type UndoAction } from '../utils/undoManager';

export function UndoButton() {
  const [lastAction, setLastAction] = useState<UndoAction | null>(null);

  useEffect(() => {
    const updateLastAction = () => {
      const action = undoManager.getLastAction();
      setLastAction(action);
    };

    // Initial update
    updateLastAction();

    // Subscribe to changes
    const unsubscribe = undoManager.subscribe(updateLastAction);

    return unsubscribe;
  }, []);

  const handleUndo = () => {
    if (lastAction) {
      const success = undoManager.executeUndo();
      if (success) {
        toast.success(`Undid: ${lastAction.description}`);
      } else {
        toast.error('Failed to undo action');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleUndo();
    }
  };

  // Only show the button when there's an action to undo
  if (!lastAction) {
    return null;
  }
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleUndo}
        onKeyDown={handleKeyDown}
        className="gap-2 bg-background/95 backdrop-blur-sm shadow-lg border-2 hover:scale-105 transition-transform duration-200"
        aria-label={`Undo: ${lastAction.description}`}
      >
        <Undo className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">
          Undo: {lastAction.description.length > 20 
            ? `${lastAction.description.substring(0, 17)}...` 
            : lastAction.description}
        </span>
        <span className="sm:hidden text-xs">Undo</span>
      </Button>    </div>
  );
}
