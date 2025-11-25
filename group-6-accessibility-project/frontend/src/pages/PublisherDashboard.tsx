import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Building, Plus, Edit, Trash2, Tag, Check, X, Eye, Ear, Hand, Brain, BarChart3, LogOut, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

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

export function PublisherDashboard() {
    const [user, setUser] = useState<any>(null);
    const [publisher, setPublisher] = useState<Publisher | null>(null);
    const [games, setGames] = useState<Game[]>([]);
    const [accessibilityTags, setAccessibilityTags] = useState<AccessibilityTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuthentication();
        loadPublisherData();
        loadAccessibilityTags();
    }, []);

    const checkAuthentication = () => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!storedUser || !token) {
            window.location.href = '/login';
            return;
        }

        const userData = JSON.parse(storedUser);

        // Handle missing role for existing users
        if (!userData.role) {
            userData.role = 'USER';
            localStorage.setItem('user', JSON.stringify(userData));
        }

        if (userData.role !== 'PUBLISHER') {
            setError('Access denied. Publisher account required.');
            return;
        }

        setUser(userData);
    };

    const loadPublisherData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');

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

    const handleLogout = () => {
        window.location.href = '/logout';
    };

    const handleAddGame = async (gameData: any) => {
        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch('http://localhost:3000/games', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...gameData,
                    publisherId: publisher?.id,
                    accessibilityTagIds: gameData.selectedTags || []
                })
            });

            if (response.ok) {
                await loadPublisherData(); // Reload games
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add game');
            }
        } catch (error) {
            setError('Network error while adding game');
        }
    };

    const handleUpdateGame = async (gameId: number, gameData: any) => {
        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch(`http://localhost:3000/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...gameData,
                    accessibilityTagIds: gameData.selectedTags || []
                })
            });

            if (response.ok) {
                await loadPublisherData(); // Reload games
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update game');
            }
        } catch (error) {
            setError('Network error while updating game');
        }
    };

    const handleDeleteGame = async (gameId: number) => {
        try {
            const token = localStorage.getItem('access_token');

            const response = await fetch(`http://localhost:3000/games/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await loadPublisherData(); // Reload games
            } else {
                setError('Failed to delete game');
            }
        } catch (error) {
            setError('Error deleting game');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error && !publisher) {
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
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building className="w-8 h-8 text-primary" aria-hidden="true" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {publisher?.displayName || 'Publisher Dashboard'}
                            </h1>
                            <p className="text-muted-foreground text-left">
                                Welcome back, {user?.username}
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleLogout} variant="outline" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>

            <Separator />

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Platform Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-950 p-3 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <p className="text-muted-foreground">Your Games</p>
                            <p className="text-3xl text-left">{games.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-950 p-3 rounded-lg">
                            <Check className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <p className="text-muted-foreground">Verified Games</p>
                            <p className="text-3xl text-left">{games.filter(g => g.hasBeenVerified).length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-purple-100 dark:bg-purple-950 p-3 rounded-lg">
                            <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                        </div>
                        <div className="text-left">
                            <p className="text-muted-foreground">Views</p>
                            <p className="text-3xl text-left">0</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Games Management */}
            <GamesManagement
                games={games}
                accessibilityTags={accessibilityTags}
                onAddGame={handleAddGame}
                onUpdateGame={handleUpdateGame}
                onDeleteGame={handleDeleteGame}
            />
        </div>
    );
}

// Games Management Component
function GamesManagement({
    games,
    accessibilityTags,
    onAddGame,
    onUpdateGame,
    onDeleteGame,
}: {
    games: Game[];
    accessibilityTags: AccessibilityTag[];
    onAddGame: (game: any) => void;
    onUpdateGame: (gameId: number, updates: any) => void;
    onDeleteGame: (gameId: number) => void;
}) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingGame, setEditingGame] = useState<Game | null>(null);

    return (
        <div className="space-y-6">
            {/* Add New Game Button */}
            <Card className="p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-semibold">Games Library</h2>
                        <p className="text-muted-foreground">
                            {games.length} game{games.length !== 1 ? 's' : ''} in your catalogue
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add New Game
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <GameForm
                                accessibilityTags={accessibilityTags}
                                onSubmit={(gameData) => {
                                    onAddGame(gameData);
                                    setIsAddDialogOpen(false);
                                }}
                                onCancel={() => setIsAddDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </Card>

            {/* Games List */}
            {games.length === 0 ? (
                <Card className="p-12 text-center">
                    <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No games published yet</h3>
                    <p className="text-gray-600 mb-6">Start by adding your first game to the platform</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Game
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {games.map((game) => (
                        <Card key={game.id} className="p-4">
                            <div className="flex gap-4">
                                {/* Thumbnail */}
                                <div className="w-32 h-32 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                                    <img
                                        src={game.images?.[0] || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Game Info */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold">{game.title}</h3>
                                                {game.hasBeenVerified && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground">{game.description}</p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                {game.genre.map((g) => (
                                                    <Badge key={g} variant="outline">
                                                        {g}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                <span>
                                                    {game.rating && game.rating > 0 ? `Rating: ${game.rating}/5 • ` : ''}
                                                    Developer: {game.developer}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-shrink-0">
                                            <Dialog
                                                open={editingGame?.id === game.id}
                                                onOpenChange={(open) => {
                                                    if (!open) setEditingGame(null);
                                                }}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setEditingGame(game)}
                                                        aria-label={`Edit ${game.title}`}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                                    <GameForm
                                                        initialData={game}
                                                        accessibilityTags={accessibilityTags}
                                                        onSubmit={(gameData) => {
                                                            onUpdateGame(game.id, gameData);
                                                            setEditingGame(null);
                                                        }}
                                                        onCancel={() => setEditingGame(null)}
                                                    />
                                                </DialogContent>
                                            </Dialog>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        aria-label={`Delete ${game.title}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Game</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete "{game.title}"? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => onDeleteGame(game.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    {/* Accessibility Tags */}
                                    <div>
                                        <p className="text-sm mb-2 font-medium">
                                            Accessibility Features ({game.gameAccessibilityTags?.length || 0}):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {game.gameAccessibilityTags && game.gameAccessibilityTags.length > 0 ? (
                                                game.gameAccessibilityTags.map((tagRelation: any) => {
                                                    const tag = tagRelation.accessibilityTags;
                                                    const IconComponent = categoryIcons[tag.category as keyof typeof categoryIcons] || Tag;
                                                    const colorClass = getCategoryColor(tag.category);
                                                    return (
                                                        <Badge key={tag.id} variant="outline" className={`gap-1.5 ${colorClass}`}>
                                                            <IconComponent className="w-3 h-3" />
                                                            {tag.tag}
                                                        </Badge>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-muted-foreground">No accessibility tags</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// Game Form Component
function GameForm({
    initialData,
    accessibilityTags,
    onSubmit,
    onCancel,
}: {
    initialData?: Game;
    accessibilityTags: AccessibilityTag[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        developer: initialData?.developer || '',
        genre: initialData?.genre?.join(', ') || '',
        releaseDate: initialData?.releaseDate ? new Date(initialData.releaseDate).toISOString().split('T')[0] : '',
        images: initialData?.images?.join(', ') || '',
        trailer: initialData?.trailer || '',
        transcript: initialData?.transcript || '',
        selectedTags: initialData?.gameAccessibilityTags?.map((rel: any) => rel.accessibilityTagsId) || [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('Game title is required');
            return;
        }

        const gameData = {
            title: formData.title,
            description: formData.description,
            developer: formData.developer,
            genre: formData.genre.split(',').map(g => g.trim()).filter(g => g),
            rating: 0,
            releaseDate: new Date(formData.releaseDate).toISOString(),
            images: formData.images
                ? formData.images.split(',').map(img => img.trim()).filter(img => img)
                : [], // Make sure this is always an array
            trailer: formData.trailer || null,
            transcript: formData.transcript || null,
            selectedTags: formData.selectedTags, // This will be handled in the service
        };

        onSubmit(gameData);
    };

    const handleTagChange = (tagId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            selectedTags: checked
                ? [...prev.selectedTags, tagId]
                : prev.selectedTags.filter(id => id !== tagId)
        }));
    };

    // Group accessibility tags by category
    const tagsByCategory = accessibilityTags.reduce((acc, tag) => {
        const category = tag.category.toLowerCase();
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tag);
        return acc;
    }, {} as Record<string, AccessibilityTag[]>);

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>{initialData ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                <DialogDescription>
                    {initialData ? 'Update game information and accessibility features' : 'Add a new game to your catalogue with accessibility information'}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="game-title">
                                Game Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="game-title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter game title"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game-developer">Developer</Label>
                            <Input
                                id="game-developer"
                                value={formData.developer}
                                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                                placeholder="Developer name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game-genre">Genres (comma-separated)</Label>
                            <Input
                                id="game-genre"
                                value={formData.genre}
                                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                                placeholder="Action, Adventure, RPG"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game-release-date">Release Date</Label>
                            <Input
                                id="game-release-date"
                                type="date"
                                value={formData.releaseDate}
                                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game-images">Images (comma-separated URLs)</Label>
                            <Input
                                id="game-images"
                                value={formData.images}
                                onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="game-trailer">Trailer URL</Label>
                            <Input
                                id="game-trailer"
                                value={formData.trailer}
                                onChange={(e) => setFormData({ ...formData, trailer: e.target.value })}
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="game-transcript">Transcript</Label>
                        <Textarea
                            id="game-transcript"
                            value={formData.transcript}
                            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
                            placeholder="Enter game transcript or audio description here..."
                            rows={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="game-description">Description</Label>
                        <Textarea
                            id="game-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Game description"
                            rows={4}
                        />
                    </div>
                </div>

                {/* Accessibility Tags */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Accessibility Features</h3>
                    <Separator />
                    <p className="text-muted-foreground">
                        Select all applicable accessibility features for this game
                    </p>

                    {Object.entries(tagsByCategory).map(([category, tags]) => {
                        const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Tag;
                        return (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <IconComponent className="w-5 h-5 text-primary" aria-hidden="true" />
                                    <h4 className="font-medium capitalize">{category}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-7">
                                    {tags.map((tag) => (
                                        <div key={tag.id} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`tag-${tag.id}`}
                                                checked={formData.selectedTags.includes(tag.id)}
                                                onCheckedChange={(checked) => handleTagChange(tag.id, checked as boolean)}
                                            />
                                            <Label htmlFor={`tag-${tag.id}`} className="cursor-pointer flex-1">
                                                {tag.tag}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <p className="text-muted-foreground mt-4">
                        {formData.selectedTags.length} accessibility feature
                        {formData.selectedTags.length !== 1 ? 's' : ''} selected
                    </p>
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">{initialData ? 'Update Game' : 'Add Game'}</Button>
            </DialogFooter>
        </form>
    );
}