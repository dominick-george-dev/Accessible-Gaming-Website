import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Building, Eye, Ear, Hand, Brain, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TrendingUp, } from 'lucide-react';
import AdminDeleteAndVerifyTab from '../components/AdminDeleteAndVerifyTab';

interface Game {
    id: number;
    title: string;
    description: string;
    genre: string[];
    releaseDate: string;
    developer: string;
    rating: number;
    images: string[];
    trailer?: string;
    transcript?: string;
    hasBeenVerified: boolean;
    gameAccessibilityTags?: any[];
}

interface AccessibilityTag {
    id: number;
    tag: string;
    category: string;
}

interface Publisher {
    id: number;
    displayName: string;
    profilePicture?: string;
    Game: Game[];
}

const categoryIcons = {
    visual: Eye,
    hearing: Ear,
    dexterity: Hand,
    cognitive: Brain,
    Audio: Ear,
    Visual: Eye,
    Motor: Hand,
    Cognitive: Brain,
};

// Helper function to get category color
const getCategoryColor = (category: string) => {
    const lowerCategory = category.toLowerCase();
    switch (lowerCategory) {
        case 'visual':
            return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
        case 'hearing':
        case 'audio':
            return 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
        case 'dexterity':
        case 'motor':
            return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
        case 'cognitive':
            return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
        default:
            return 'bg-secondary text-secondary-foreground';
    }
};

export function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [publisher, setPublisher] = useState<Publisher | null>(null);
    const [admin, setAdmin] = useState<any>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [accessibilityTags, setAccessibilityTags] = useState<AccessibilityTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('games');

    useEffect(() => {
        checkAuthentication();
        loadPublisherData();
        loadAccessibilityTags();
    }, []);

    const checkAuthentication = () => {
        const storedUser = localStorage.getItem('userData');
        const token = localStorage.getItem('access_token');

        if (!storedUser || !token) {
            window.location.href = '/login';
            return;
        }

        const userData = JSON.parse(storedUser);

        // Handle missing role for existing users
        if (!userData.role) {
            userData.role = 'USER';
            localStorage.setItem('userData', JSON.stringify(userData));
        }

        if (userData.role !== 'PUBLISHER') {
            setError('Access denied. Publisher account required.');
            return;
        }

        if (userData.role !== 'ADMIN') {
            setError('Access denied. Admin account required.');
            return;
        }

        setUser(userData);
    };

    const loadPublisherData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const user = JSON.parse(localStorage.getItem('userData') || '{}');

            const response = await fetch(`http://localhost:3000/publishers/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const publisherData = await response.json();
                setPublisher(publisherData);
                setGames(publisherData.Game || []);
            } else {
                setError('Failed to load publisher data');
            }
        } catch (error) {
            setError('Error loading publisher data');
        } finally {
            setLoading(false);
        }
    };

    const loadAccessibilityTags = async () => {
        try {
            const response = await fetch('http://localhost:3000/accessibility-tags');
            if (response.ok) {
                const tags = await response.json();
                setAccessibilityTags(tags);
            }
        } catch (error) {
            console.error('Failed to load accessibility tags:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !admin) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => window.location.href = '/login'} className="w-full mt-4">
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 p-4">
            {/* Header - keep exactly the same */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building className="w-8 h-8 text-primary" aria-hidden="true" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {publisher?.displayName || 'Publisher Dashboard'}
                            </h1>
                            <p className="text-muted-foreground">
                                Welcome back, {user?.username}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Error Alert - keep exactly the same */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* NEW: Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="games" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Games Management
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Reports
                    </TabsTrigger>
                </TabsList>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    
                </TabsContent>

                {/* Games Management Tab */}
                <TabsContent value="games" className="space-y-6">
                    <AdminDeleteAndVerifyTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}