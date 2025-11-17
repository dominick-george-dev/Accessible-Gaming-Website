import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function VoiceCommandIndicator() {
  const [isListening, setIsListening] = useState(false);

  const toggleVoiceControl = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.success('Voice control activated', {
        description: 'Say commands like "Show favorites" or "Search games"',
      });
    } else {
      toast.info('Voice control deactivated');
    }
  };

  return (
    <Button
      variant={isListening ? 'default' : 'outline'}
      size="icon"
      onClick={toggleVoiceControl}
      aria-label={isListening ? 'Deactivate voice control' : 'Activate voice control'}
      aria-pressed={isListening}
      className="relative"
    >
      {isListening ? (
        <>
          <Mic className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
        </>
      ) : (
        <MicOff className="w-5 h-5" />
      )}
    </Button>
  );
}
