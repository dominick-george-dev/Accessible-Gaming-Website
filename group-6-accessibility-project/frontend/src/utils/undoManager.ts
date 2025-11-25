interface UndoAction {
  id: string;
  description: string;
  timestamp: number;
  undoFn: () => void;
}

// Global undo manager
class UndoManager {
  private actions: UndoAction[] = [];
  private subscribers: (() => void)[] = [];
  private maxActions = 10; // Keep last 10 actions

  addAction(action: Omit<UndoAction, 'id' | 'timestamp'>) {
    const newAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    this.actions.unshift(newAction); // Add to beginning
    if (this.actions.length > this.maxActions) {
      this.actions.pop(); // Remove oldest
    }

    this.notifySubscribers();
  }

  getLastAction(): UndoAction | null {
    return this.actions[0] || null;
  }

  executeUndo(): boolean {
    const lastAction = this.actions.shift();
    if (lastAction) {
      try {
        lastAction.undoFn();
        this.notifySubscribers();
        return true;
      } catch (error) {
        console.error('Undo failed:', error);
        // Put the action back if undo failed
        this.actions.unshift(lastAction);
        return false;
      }
    }
    return false;
  }

  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

// Create global instance
export const undoManager = new UndoManager();

// Helper function to add actions from anywhere in the app
export const addUndoAction = (description: string, undoFn: () => void) => {
  undoManager.addAction({ description, undoFn });
};

// Export types for use in other components
export type { UndoAction };
