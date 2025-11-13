import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Play, Pause, Volume2, VolumeX, Maximize2, ClosedCaptionIcon as Subtitles, FileText } from 'lucide-react';
import { Separator } from './ui/separator';

interface Caption {
  start: number;
  end: number;
  text: string;
}

interface AccessibleVideoPlayerProps {
  gameName: string;
  thumbnailUrl: string;
}

// Mock captions data - simulating subtitle track
const mockCaptions: Caption[] = [
  { start: 0, end: 3, text: "Welcome to Puzzle Quest Adventures." },
  { start: 3, end: 6, text: "Experience vibrant puzzle worlds designed for everyone." },
  { start: 6, end: 10, text: "Full colorblind mode support with adjustable visual patterns." },
  { start: 10, end: 14, text: "Play with one hand using our intuitive control system." },
  { start: 14, end: 18, text: "High contrast modes ensure visibility for all players." },
  { start: 18, end: 22, text: "Complete voice-over narration for all game elements." },
  { start: 22, end: 25, text: "Accessibility designed from the ground up." },
];

const fullTranscript = `[0:00 - 0:03] Welcome to Puzzle Quest Adventures.

[0:03 - 0:06] Experience vibrant puzzle worlds designed for everyone.

[0:06 - 0:10] Full colorblind mode support with adjustable visual patterns. Our advanced color system adapts to multiple types of color blindness including deuteranopia, protanopia, and tritanopia.

[0:10 - 0:14] Play with one hand using our intuitive control system. All actions can be performed with simple taps or clicks, no complex gestures required.

[0:14 - 0:18] High contrast modes ensure visibility for all players. Toggle between multiple contrast presets to find what works best for you.

[0:18 - 0:22] Complete voice-over narration for all game elements. Every button, menu item, and game piece is fully described by our professional voice actors.

[0:22 - 0:25] Accessibility designed from the ground up. We believe great games should be playable by everyone, regardless of ability.`;

export function AccessibleVideoPlayer({ gameName, thumbnailUrl }: AccessibleVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const videoRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  const duration = 25; // Mock video duration in seconds

  // Simulate video playback
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 0.1;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, duration]);

  // Update captions based on current time
  useEffect(() => {
    const caption = mockCaptions.find(
      (c) => currentTime >= c.start && currentTime < c.end
    );
    setCurrentCaption(caption?.text || '');
  }, [currentTime]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Announce to screen readers
    const announcement = !isPlaying ? 'Video playing' : 'Video paused';
    announceToScreenReader(announcement);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    announceToScreenReader(!isMuted ? 'Audio muted' : 'Audio unmuted');
  };

  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
    announceToScreenReader(!showCaptions ? 'Captions enabled' : 'Captions disabled');
  };

  const announceToScreenReader = (message: string) => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if video player is in focus
      if (!videoRef.current?.contains(document.activeElement)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
          e.preventDefault();
          toggleCaptions();
          break;
        case 'arrowleft':
          e.preventDefault();
          setCurrentTime((prev) => Math.max(0, prev - 5));
          announceToScreenReader('Rewind 5 seconds');
          break;
        case 'arrowright':
          e.preventDefault();
          setCurrentTime((prev) => Math.min(duration, prev + 5));
          announceToScreenReader('Forward 5 seconds');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted, showCaptions]);

  return (
    <section aria-labelledby="video-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 id="video-heading">Game Trailer</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <Subtitles className="w-3 h-3" aria-hidden="true" />
            Closed Captions
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <FileText className="w-3 h-3" aria-hidden="true" />
            Full Transcript
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video">Video Player</TabsTrigger>
          <TabsTrigger value="transcript">Text Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-4">
          <Card className="overflow-hidden">
            {/* Video Display Area */}
            <div
              ref={videoRef}
              className="relative aspect-video bg-black group"
              role="region"
              aria-label={`Video player for ${gameName} trailer`}
            >
              {/* Video Thumbnail/Content */}
              <div className="absolute inset-0">
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ opacity: isPlaying ? 0.7 : 1 }}
                />
                {/* Simulated playback overlay */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 animate-pulse" />
                )}
              </div>

              {/* Captions Overlay */}
              {showCaptions && currentCaption && (
                <div
                  className="absolute bottom-16 left-0 right-0 px-4"
                  role="region"
                  aria-live="polite"
                  aria-label="Video captions"
                >
                  <div className="bg-black/90 text-white px-4 py-3 rounded-lg mx-auto max-w-3xl text-center backdrop-blur-sm">
                    <p className="text-lg leading-relaxed">{currentCaption}</p>
                  </div>
                </div>
              )}

              {/* Play/Pause Overlay Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    className="w-20 h-20 rounded-full"
                    aria-label="Play video"
                  >
                    <Play className="w-10 h-10" />
                  </Button>
                </div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-12 left-0 right-0 px-4">
                <div 
                  className="bg-white/30 backdrop-blur-sm h-1 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label="Video progress"
                  aria-valuenow={Math.round(progressPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="bg-primary h-full transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>

                  <span className="text-white text-sm" aria-live="polite">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  <div className="flex-1" />

                  <Button
                    variant={showCaptions ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={toggleCaptions}
                    aria-label={showCaptions ? 'Hide captions' : 'Show captions'}
                    aria-pressed={showCaptions}
                    className={showCaptions ? '' : 'text-white hover:text-white hover:bg-white/20'}
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Fullscreen"
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Accessibility Features Notice */}
            <div className="p-4 bg-muted">
              <div className="flex items-start gap-3">
                <Subtitles className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <p className="mb-2">
                    <strong>Accessibility Features:</strong>
                  </p>
                  <ul className="text-muted-foreground space-y-1" role="list">
                    <li>• Full text transcript available</li>
                    <li>• Keyboard controls: Space to play/pause, M to mute, C for captions</li>
                    <li>• Screen reader compatible with all controls and status updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="mb-2">
                  <strong className="text-blue-900 dark:text-blue-100">Need a text-only version?</strong>
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Switch to the "Text Transcript" tab above for a complete written version of this trailer, 
                  including timestamps and detailed descriptions of all visual elements.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Complete Video Transcript</h3>
            <Separator className="mb-4" />
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                {fullTranscript}
              </pre>
            </div>
          </Card>

          {/* <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-green-900 dark:text-green-100">
                  <strong>Why transcripts matter:</strong> Text transcripts make video content accessible to 
                  deaf and hard-of-hearing users, those in sound-sensitive environments, and users with 
                  cognitive disabilities who prefer reading at their own pace. They also help with SEO 
                  and allow users to search for specific information.
                </p>
              </div>
            </div>
          </Card> */}
        </TabsContent>
      </Tabs>
    </section>
  );
}
