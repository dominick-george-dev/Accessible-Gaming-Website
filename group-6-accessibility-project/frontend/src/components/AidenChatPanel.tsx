import { useEffect } from 'react';
import A11yChat from './ui/A11yChat';

// Custom sliding panel for chat, right side, animated, non-modal
export const CHAT_PANEL_WIDTH = 320; // px, about 2/3 of previous max-w-md (was 480px)

export function AidenChatPanel({ open, onOpenChange, onWakeWord }: { open: boolean; onOpenChange: (open: boolean) => void; onWakeWord?: () => void }) {
  useEffect(() => {
    document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div
      aria-label="Aiden Chat Panel"
      className={`fixed top-0 right-0 h-full z-40 transition-transform duration-500 ease-in-out pointer-events-none`}
      style={{
        width: CHAT_PANEL_WIDTH,
        transform: open ? 'translateX(0)' : `translateX(${CHAT_PANEL_WIDTH}px)`,
      }}
    >      <div
        className="h-full bg-card shadow-2xl border-l border-border flex flex-col w-full pointer-events-auto relative"
        tabIndex={-1}
      >        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-card-foreground">Aiden – Accessibility Chat</h2>
        </div><div className="p-2 h-full overflow-y-auto">
          <A11yChat onWakeWord={onWakeWord} />
        </div>
      </div>
    </div>
  );
}
