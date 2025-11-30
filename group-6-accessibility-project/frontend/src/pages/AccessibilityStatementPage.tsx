import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import {
  Eye,
  Ear,
  Hand,
  Brain,
  Check,
  AlertCircle,
  Accessibility,
  Shield,
  Mic,
  Command,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AccessibilityFeature {
  icon: any;
  title: string;
  items: string[];
}

interface VoiceCommandCategory {
  category: string;
  commands: VoiceCommand[];
}

interface VoiceCommand {
  phrase: string;
  description: string;
}

// ============================================
// DATA - ACCESSIBILITY FEATURES
// ============================================

const ACCESSIBILITY_FEATURES: AccessibilityFeature[] = [
  {
    icon: Eye,
    title: 'Visual Accessibility',
    items: [
      'High contrast color schemes',
      'Adjustable text sizes (10-32px)',
      'Screen reader compatibility',
      'Colorblind filters (Protanopia, Deuteranopia, Tritanopia, Achromatopsia)',
      'Dyslexia-friendly font option',
      'Screen magnifier (2x zoom)',
    ],
  },
  {
    icon: Ear,
    title: 'Hearing Accessibility',
    items: [
      'Visual feedback for all sounds',
      'Captions and transcripts',
      'No audio-only content',
      'Adjustable alert preferences',
    ],
  },
  {
    icon: Hand,
    title: 'Motor Accessibility',
    items: [
      'Full keyboard navigation',
      'Voice command support',
      'Switch control compatibility',
      'Large touch targets (44x44px minimum)',
      'Undo button for quick error correction',
    ],
  },
  {
    icon: Brain,
    title: 'Cognitive Accessibility',
    items: [
      'Clear, simple language',
      'Consistent navigation',
      'Error prevention and recovery',
      'Customizable preferences',
      'Breadcrumb navigation',
      'Search autofill suggestions',
    ],
  },
];

// ============================================
// DATA - VOICE COMMANDS
// ============================================

const VOICE_COMMANDS: VoiceCommandCategory[] = [
  {
    category: 'Navigation',
    commands: [
      { phrase: 'Go to home', description: 'Navigate to the home page' },
      { phrase: 'Browse games', description: 'Go to the browse page' },
      { phrase: 'My favorites', description: 'View your favorite games' },
      { phrase: 'Open profile', description: 'Go to your profile page' },
      { phrase: 'Show accessibility', description: 'View accessibility information' },
    ],
  },
  {
    category: 'Actions',
    commands: [
      { phrase: 'Add to favorites', description: 'Add the current game to favorites' },
      { phrase: 'Search for [game name]', description: 'Search for a specific game' },
      { phrase: 'Filter by [category]', description: 'Filter games by accessibility category' },
      { phrase: 'Sort by rating', description: 'Sort games by their rating' },
    ],
  },
  {
    category: 'Accessibility',
    commands: [
      { phrase: 'Increase text size', description: 'Make text larger' },
      { phrase: 'Decrease text size', description: 'Make text smaller' },
      { phrase: 'Enable high contrast', description: 'Turn on high contrast mode' },
      { phrase: 'Read aloud', description: 'Have the current page read aloud' },
    ],
  },
  {
    category: 'Help',
    commands: [
      { phrase: 'Help', description: 'Get help with voice commands' },
      { phrase: 'What can I say?', description: 'List available voice commands' },
      { phrase: 'Go back', description: 'Navigate to the previous page' },
    ],
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function AccessibilityPage() {
    
  const [issueReport, setIssueReport] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');  
  const userId = user?.id;

  const handleReportIssue = async () => {
    if (issueReport.trim() === '') {
      toast.error('Please describe the issue');
      return;
    }
    console.log('Submitting with userId:', user?.id);
    try {
      // Replace userId with the actual logged-in user's ID
        const response = await fetch('http://localhost:3000/accessibility-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          message: issueReport,
        }),
      });
      if (response.ok) {
        toast.success('Issue reported successfully. Thank you for your feedback!');
        setIssueReport('');
      } else {
        toast.error('Failed to submit issue.');
      }
    } catch (error) {
      toast.error('Network error.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      <ReportIssueSection
        issueReport={issueReport}
        setIssueReport={setIssueReport}
        onSubmit={handleReportIssue}
      />
      {/* Mission Statement */}
      <MissionStatement />
      <Separator />
      {/* WCAG Compliance */}
      <ComplianceSection />
      <Separator />
      {/* Platform Features */}
      <FeaturesSection features={ACCESSIBILITY_FEATURES} />
      <Separator />
      {/* Voice Commands Help */}
      <VoiceCommandsSection commands={VOICE_COMMANDS} />
      <Separator />
      {/* Contact */}
      <ContactSection />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Mission Statement Section
 */
function MissionStatement() {
  return (
    <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="bg-primary text-primary-foreground rounded-full p-3">
          <Accessibility className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2>Our Mission</h2>
          <p className="text-muted-foreground">
            We believe gaming should be accessible to everyone, regardless of their
            abilities. This platform is designed to help you discover mobile games that
            meet your specific accessibility needs.
          </p>
        </div>
      </div>
    </Card>
  );
}

/**
 * Standards Compliance Section
 */
function ComplianceSection() {
  const complianceItems = [
    {
      title: 'WCAG 2.1 Level AA Compliant',
      description: 'Our platform meets Web Content Accessibility Guidelines standards',
    },
    {
      title: 'Section 508 Compliant',
      description: 'Meets U.S. federal accessibility standards',
    },
    {
      title: 'Mobile Accessibility',
      description: 'Optimized for mobile screen readers and assistive technologies',
    },
  ];

  return (
    <section aria-labelledby="compliance-heading">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 id="compliance-heading">Standards Compliance</h2>
      </div>
      <Card className="p-4 space-y-3">
        {complianceItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p>{item.title}</p>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}

/**
 * Platform Features Section
 */
function FeaturesSection({ features }: { features: AccessibilityFeature[] }) {
  return (
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" className="mb-6">
        Platform Accessibility Features
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                <h3>{feature.title}</h3>
              </div>
              <ul className="space-y-2 ml-9" role="list">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Voice Commands Section
 */
function VoiceCommandsSection({ commands }: { commands: VoiceCommandCategory[] }) {
  return (
    <section aria-labelledby="voice-commands-heading">
      <div className="flex items-center gap-3 mb-4">
        <Mic className="w-6 h-6 text-primary" aria-hidden="true" />
        <h2 id="voice-commands-heading">Voice Commands</h2>
      </div>
      <Card className="p-6 space-y-6">
        <p className="text-muted-foreground">
          Use voice commands to navigate and interact with the platform. Simply say the command clearly, and the system will respond.
        </p>
        
        {commands.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="flex items-center gap-2">
              <Command className="w-5 h-5 text-primary" aria-hidden="true" />
              {category.category}
            </h3>
            <div className="ml-7 space-y-2">
              {category.commands.map((cmd, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-muted/50 rounded-md">
                  <div>
                    <Badge variant="secondary" className="font-mono">
                      "{cmd.phrase}"
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {cmd.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <VoiceCommandTips />
      </Card>
    </section>
  );
}

/**
 * Voice Command Tips Alert Box
 */
function VoiceCommandTips() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Voice Command Tips</p>
          <ul className="text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Speak clearly and at a moderate pace</li>
            <li>Wait for the microphone indicator before speaking</li>
            <li>Commands are case-insensitive</li>
            <li>You can say "help" at any time for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Report Issue Section
 */
function ReportIssueSection({
  issueReport,
  setIssueReport,
  onSubmit,
}: {
  issueReport: string;
  setIssueReport: (value: string) => void;
  onSubmit: () => void;
}) {
  // Common accessibility issues
  const COMMON_ISSUES = [
    'Screen reader problem',
    'Color contrast',
    'Keyboard navigation',
    'Voice command not working',
    'Text size too small',
    'Missing captions',
    'Touch target too small',
    'Confusing navigation',
    'Other',
  ];

  // Handler for selecting a common issue
  const handleSelectIssue = (issue: string) => {
    if (!issueReport.includes(issue)) {
      setIssueReport(issueReport ? issueReport + '\n' + issue : issue);
    }
  };

  return (
    <section aria-labelledby="report-heading">
      <h2 id="report-heading" className="mb-4">
        Report Accessibility Issue
      </h2>
      <Card className="p-4 space-y-4">
        <p className="text-muted-foreground">
          Found an accessibility barrier? We want to know about it. Your feedback helps
          us improve for everyone.
        </p>

        {/* Common Issues Buttons */}
        <div className="flex flex-wrap gap-2 mb-2" aria-label="Common accessibility issues">
          {COMMON_ISSUES.map((issue) => (
            <Button
              key={issue}
              type="button"
              variant="outline"
              size="sm"
              className={issueReport.includes(issue) ? 'bg-primary/10 border-primary' : ''}
              onClick={() => handleSelectIssue(issue)}
              aria-pressed={issueReport.includes(issue)}
            >
              {issue}
            </Button>
          ))}
        </div>

        <div>
          <label htmlFor="issue-report" className="block mb-2">
            Describe the Issue
          </label>
          <Textarea
            id="issue-report"
            placeholder="Please describe the accessibility issue you encountered..."
            value={issueReport}
            onChange={(e) => setIssueReport(e.target.value)}
            rows={5}
            aria-describedby="report-hint"
          />
          <p id="report-hint" className="text-muted-foreground mt-2">
            Include details like: What were you trying to do? What happened? What
            assistive technology are you using?
          </p>
        </div>

        <Button onClick={onSubmit} className="w-full">
          Submit Report
        </Button>
      </Card>
    </section>
  );
}

/**
 * Contact Section
 */
function ContactSection() {
  return (
    <section aria-labelledby="contact-heading">
      <Card className="p-4 space-y-2">
        <h3 id="contact-heading">Need Help?</h3>
        <p className="text-muted-foreground">
          If you need assistance or have questions about accessibility, contact us at:
        </p>
        <Badge variant="secondary" className="mt-2">
          accessibility@gameplatform.example
        </Badge>
      </Card>
    </section>
  );
}

// ============================================
// CUSTOMIZATION HELPERS
// ============================================

/**
 * Create custom accessibility feature
 */
export function createAccessibilityFeature(
  icon: any,
  title: string,
  items: string[]
): AccessibilityFeature {
  return { icon, title, items };
}

/**
 * Create custom voice command category
 */
export function createVoiceCommandCategory(
  category: string,
  commands: VoiceCommand[]
): VoiceCommandCategory {
  return { category, commands };
}

/**
 * Create custom voice command
 */
export function createVoiceCommand(
  phrase: string,
  description: string
): VoiceCommand {
  return { phrase, description };
}

// ============================================
// STANDALONE VERSION (NO EXTERNAL DEPENDENCIES)
// ============================================

/**
 * Simplified version without shadcn components
 */
export function AccessibilityPageSimple() {
  const [issueReport, setIssueReport] = useState('');

  const handleReportIssue = () => {
    if (issueReport.trim() === '') {
      alert('Please describe the issue');
      return;
    }
    alert('Issue reported successfully. Thank you for your feedback!');
    setIssueReport('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Mission Statement */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p className="text-gray-700 dark:text-gray-300">
          We believe gaming should be accessible to everyone, regardless of their
          abilities. This platform is designed to help you discover mobile games that
          meet your specific accessibility needs.
        </p>
      </div>

      {/* Compliance */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Standards Compliance</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <div className="flex gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-semibold">WCAG 2.1 Level AA Compliant</p>
              <p className="text-gray-600 dark:text-gray-400">
                Our platform meets Web Content Accessibility Guidelines standards
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <p className="font-semibold">Section 508 Compliant</p>
              <p className="text-gray-600 dark:text-gray-400">
                Meets U.S. federal accessibility standards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Platform Accessibility Features</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ACCESSIBILITY_FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <ul className="space-y-2">
                {feature.items.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Report Issue */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Report Accessibility Issue</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Found an accessibility barrier? We want to know about it.
          </p>
          <div>
            <label htmlFor="issue-report-simple" className="block mb-2 font-semibold">
              Describe the Issue
            </label>
            <textarea
              id="issue-report-simple"
              className="w-full p-3 border rounded-lg"
              placeholder="Please describe the accessibility issue you encountered..."
              value={issueReport}
              onChange={(e) => setIssueReport(e.target.value)}
              rows={5}
            />
          </div>
          <button
            onClick={handleReportIssue}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Submit Report
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
        <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          If you need assistance or have questions about accessibility, contact us at:
        </p>
        <a
          href="mailto:accessibility@gameplatform.example"
          className="text-blue-600 dark:text-blue-400 underline"
        >
          accessibility@gameplatform.example
        </a>
      </div>
    </div>
  );
}

export default AccessibilityPage;

export {
  ACCESSIBILITY_FEATURES,
  VOICE_COMMANDS,
  MissionStatement,
  ComplianceSection,
  FeaturesSection,
  VoiceCommandsSection,
  ReportIssueSection,
  ContactSection,
};
