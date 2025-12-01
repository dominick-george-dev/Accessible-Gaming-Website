import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Eye, Ear, Hand, Brain } from 'lucide-react';

interface FilterPanelProps {
  selectedCategories: {
    visual: boolean;
    hearing: boolean;
    dexterity: boolean;
    cognitive: boolean;
  };
  onCategoryChange: (category: string, checked: boolean) => void;
  activeFilterCount: number;
}

// Helper function to get category icon and color
const getCategoryStyle = (categoryId: string) => {
  switch (categoryId) {
    case 'visual':
      return { 
        icon: Eye,
        color: 'text-blue-600 dark:text-blue-400'
      };
    case 'hearing':
      return { 
        icon: Ear,
        color: 'text-purple-600 dark:text-purple-400'
      };
    case 'dexterity':
      return { 
        icon: Hand,
        color: 'text-green-600 dark:text-green-400'
      };
    case 'cognitive':
      return { 
        icon: Brain,
        color: 'text-orange-600 dark:text-orange-400'
      };
    default:
      return { 
        icon: Eye,
        color: 'text-foreground'
      };
  }
};

export function FilterPanel({
  selectedCategories,
  onCategoryChange,
  activeFilterCount,
}: FilterPanelProps) {
  const categories = [
    {
      id: 'visual',
      name: 'Visual',
      description: 'Colorblind modes, high contrast, screen readers',
    },
    {
      id: 'hearing',
      name: 'Hearing',
      description: 'Subtitles, visual cues, no audio required',
    },
    {
      id: 'dexterity',
      name: 'Dexterity',
      description: 'Voice control, one-hand mode, switch support',
    },
    {
      id: 'cognitive',
      name: 'Cognitive',
      description: 'Simple UI, tutorials, adjustable difficulty',
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-4 lg:p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3>Filter by Accessibility</h3>
        {activeFilterCount > 0 && (
          <Badge variant="secondary" aria-live="polite">
            {activeFilterCount} active
          </Badge>
        )}
      </div>
      
      <Separator />

      <div className="space-y-4" role="group" aria-label="Accessibility filter options">
        {categories.map((category) => {
          const style = getCategoryStyle(category.id);
          const Icon = style.icon;
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories[category.id as keyof typeof selectedCategories]}
                  onCheckedChange={(checked) =>
                    onCategoryChange(category.id, checked as boolean)
                  }
                  aria-describedby={`${category.id}-desc`}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={category.id}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <Icon className={`w-4 h-4 ${style.color}`} aria-hidden="true" />
                    {category.name}
                  </Label>
                  <p
                    id={`${category.id}-desc`}
                    className="text-muted-foreground mt-1"
                  >
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <p className="text-muted-foreground" aria-live="polite">
        Select multiple categories to find games suitable for your needs
      </p>
    </div>
  );
}