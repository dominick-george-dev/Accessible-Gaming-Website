import { MessageCircle } from 'lucide-react';
import { Button } from './ui/button';

export function AidenChatButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        variant="default"
        size="icon"
        onClick={onClick}
        className="w-20 h-20 rounded-full shadow-xl flex items-center justify-center bg-primary hover:bg-primary/90 transition-all border-4 border-primary/30"
        aria-label="Open Aiden chat bot"
        style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)' }}
      >
        <MessageCircle className="w-12 h-12 text-white drop-shadow-lg" style={{ color: '#38bdf8' }} />
      </Button>
    </div>
  );
}
