import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText } from 'lucide-react';
import { Separator } from './ui/separator';

interface AccessibleVideoPlayerProps {
  gameName: string;
  youtubeUrl: string;      // Pass the YouTube URL
  transcript?: string;      // Optional transcript prop
}

export function AccessibleVideoPlayer({ gameName, youtubeUrl, transcript }: AccessibleVideoPlayerProps) {
  // Extract video ID from URL
  const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([\w-]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : '';
  console.log('Transcript for testing purposes:', transcript);

  return (
    <section aria-labelledby="video-heading" className="space-y-4">
      <h2 id="video-heading" className="text-xl font-bold">{gameName} Trailer</h2>

      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="video">Video Player</TabsTrigger>
          <TabsTrigger value="transcript">Text Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-4">
          <Card className="overflow-hidden">
            {/* YouTube Embed */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                title={`${gameName} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                tabIndex={0} // Ensure keyboard focus
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transcript" className="space-y-4">
          <Card className="p-6">
            <h3 className="mb-4">Complete Video Transcript</h3>
            <Separator className="mb-4" />
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
                {transcript || 'Transcript not available.'}
              </pre>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-green-900 dark:text-green-100">
                  <strong>Why transcripts matter:</strong> Text transcripts make video content accessible to deaf and hard-of-hearing users,
                  users in sound-sensitive environments, and those who prefer reading at their own pace.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
const fullTranscript = `[0:00 - 0:03] Welcome to Puzzle Quest Adventures.

[0:03 - 0:06] Experience vibrant puzzle worlds designed for everyone.

[0:06 - 0:10] Full colorblind mode support with adjustable visual patterns. Our advanced color system adapts to multiple types of color blindness including deuteranopia, protanopia, and tritanopia.

[0:10 - 0:14] Play with one hand using our intuitive control system. All actions can be performed with simple taps or clicks, no complex gestures required.

[0:14 - 0:18] High contrast modes ensure visibility for all players. Toggle between multiple contrast presets to find what works best for you.

[0:18 - 0:22] Complete voice-over narration for all game elements. Every button, menu item, and game piece is fully described by our professional voice actors.

[0:22 - 0:25] Accessibility designed from the ground up. We believe great games should be playable by everyone, regardless of ability.`;

