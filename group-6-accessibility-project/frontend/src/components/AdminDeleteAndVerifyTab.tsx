import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, X, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';


interface Game {
    id: number;
    title: string;
    description: string;
    developer: string;
    genre: string[];
    rating: number;
    releaseDate: string;
    hasBeenVerified: boolean;
    images?: string[];
}

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

const AdminDeleteAndVerifyTab: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<{ [key: number]: 'verifying' | 'revoking' | 'deleting' | null }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
    const [toasts, setToasts] = useState<Toast[]>([]);

    const ITEMS_PER_PAGE = 20;

    const formatRating = (rating: number): string => {
        return Number(rating).toFixed(1);
    };

    // Toast functions
    const addToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { id, message, type };
        setToasts(prev => [...prev, newToast]);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const fetchGames = async (page: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:3000/games/getall?page=${page}&limit=${ITEMS_PER_PAGE}`);

            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }

            const result = await response.json();

            console.log('API Response:', result);
            console.log('First game sample:', result.data?.[0]);
            console.log('Games with verification status:', result.data?.map((g: Game) => ({
                id: g.id,
                title: g.title,
                hasBeenVerified: g.hasBeenVerified
            })));

            setGames(result.data || []);
            setTotalPages(result.pagination?.totalPages || 1);
            setCurrentPage(result.pagination?.page || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching games:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (gameId: number) => {
        setActionLoading(prev => ({ ...prev, [gameId]: 'verifying' }));

        try {
            const response = await fetch(`http://localhost:3000/games/${gameId}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to verify game');
            }

            const gameName = games.find(g => g.id === gameId)?.title || `Game ${gameId}`;

            setGames(prevGames =>
                prevGames.map(game =>
                    game.id === gameId
                        ? { ...game, hasBeenVerified: true }
                        : game
                )
            );

            addToast(`"${gameName}" has been verified successfully!`, 'success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to verify game');
            addToast('Failed to verify game. Please try again.', 'error');
            console.error('Error verifying game:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [gameId]: null }));
        }
    };

    // ✅ New function to revoke verification
    const handleRevokeVerification = async (gameId: number) => {

        setActionLoading(prev => ({ ...prev, [gameId]: 'revoking' }));

        try {
            const response = await fetch(`http://localhost:3000/games/${gameId}/revoke-verification`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to revoke verification');
            }

            const gameName = games.find(g => g.id === gameId)?.title || 'this game';


            setGames(prevGames =>
                prevGames.map(game =>
                    game.id === gameId
                        ? { ...game, hasBeenVerified: false }
                        : game
                )
            );

            addToast(`Verification revoked for "${gameName}"`, 'warning');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to revoke verification');
            addToast('Failed to revoke verification. Please try again.', 'error');
            console.error('Error revoking verification:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [gameId]: null }));
        }
    };

    const handleDelete = async (gameId: number, gameTitle: string) => {
        // Just utilises AlertDialog UI
        setActionLoading(prev => ({ ...prev, [gameId]: 'deleting' }));

        try {
            const response = await fetch(`http://localhost:3000/games/${gameId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete game');
            }

            setGames(prevGames => prevGames.filter(game => game.id !== gameId));
            addToast(`"${gameTitle}" has been deleted successfully!`, 'success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete game');
            addToast('Failed to delete game. Please try again.', 'error');
            console.error('Error deleting game:', err);
        } finally {
            setActionLoading(prev => ({ ...prev, [gameId]: null }));
        }
    };

    const filteredGames = games.filter(game => {
        if (filter === 'verified') return game.hasBeenVerified;
        if (filter === 'unverified') return !game.hasBeenVerified;
        return true;
    });

    useEffect(() => {
        fetchGames(currentPage);
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Toast Component
    const ToastContainer = () => (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center justify-between p-4 rounded-lg shadow-lg min-w-80 max-w-md transform transition-all duration-300 ease-in-out ${
                        toast.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                        : toast.type === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                        : toast.type === 'warning'
                            ? 'bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300'
                        : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
                        <span className="font-medium">{toast.message}</span>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-4 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="flex flex-col items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-500">Loading games...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Toast Container */}
            <ToastContainer />
            
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Game Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Verify, revoke verification, or delete games on the platform
                    </p>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {error && (
                    <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-600">Error: {error}</p>
                            </div>
                            <button
                                onClick={() => fetchGames(currentPage)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Controls */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <label htmlFor="verification-filter" className="font-medium text-gray-900 dark:text-gray-100">Filter by status:</label>
                        <select
                            id="verification-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as 'all' | 'verified' | 'unverified')}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">All Games</option>
                            <option value="verified">Verified Games</option>
                            <option value="unverified">Unverified Games</option>
                        </select>
                        <span className="text-gray-500 dark:text-gray-400">({filteredGames.length} games)</span>
                    </div>
                </div>

                {/* Games Grid */}
                {filteredGames.length === 0 ? (
                    <div className="p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        <p className="text-gray-500 dark:text-gray-400">No games found matching your filter criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredGames.map((game) => (
                            <div key={game.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                                {/* Game Image */}
                                <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    {game.images && game.images.length > 0 ? (
                                        <img
                                            src={game.images[0]}
                                            alt={game.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Game Info */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-lg leading-tight text-gray-900 dark:text-gray-100">{game.title}</h3>
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                            game.hasBeenVerified
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                            {game.hasBeenVerified ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3" />
                                                    Verified
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-3 h-3" />
                                                    Pending
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">by {game.developer}</p>

                                    <p 
                                        className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 overflow-hidden"
                                        style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {game.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-500 dark:text-gray-400">
                                            {Array.isArray(game.genre) ? game.genre.join(', ') : game.genre}
                                        </span>
                                        {/* ✅ Updated rating display with formatting */}
                                        <span className="text-yellow-600 font-medium">
                                            ★ {formatRating(game.rating)}/10
                                        </span>
                                    </div>
                                </div>

                                {/* ✅ Updated Actions with revoke verification */}
                                <div className="flex gap-2 p-4 pt-0">
                                    {!game.hasBeenVerified ? (
                                        // Show verify button for unverified games
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium mb-1"
                                                aria-label={`Verify ${game?.title ?? 'game'}`}
                                                >
                                                Verify
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Verify {game?.title ?? 'game'}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Confirm verifying "{game?.title ?? 'this game'}". This will mark it as verified.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleVerify(game.id)}
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                >
                                                    Verify
                                                </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        // Show revoke button for verified games
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors font-medium mb-1"
                                                    aria-label={`Revoke verification for ${game.title}`}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Revoke
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Revoke verification</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to revoke verification for "{game.title}"? This will mark it as pending.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleRevokeVerification(game.id)}
                                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                                        disabled={actionLoading[game.id] === 'revoking'}
                                                    >
                                                        {actionLoading[game.id] === 'revoking' ? 'Revoking...' : 'Revoke'}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium mb-1"
                                            aria-label={`Delete ${game?.title ?? 'game'}`}
                                            >
                                            Delete
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Delete {game?.title ?? 'game'}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete "{game?.title ?? 'this game'}"? This action cannot be undone.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(game.id, game.title)}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
                        >
                            ← Previous
                        </button>

                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors font-medium"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminDeleteAndVerifyTab;