import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Building, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { TrendingUp, } from 'lucide-react';
import AdminDeleteAndVerifyTab from '../components/AdminDeleteAndVerifyTab';
import AccessibilityTagsAdminTab from '../components/AccessibilityTagsAdminTab';

export function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [admin, setAdmin] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('games');

    useEffect(() => {
        const init = async () => {
            await checkAuthentication();
            setLoading(false);
        };
        init();
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

        if (userData.role !== 'ADMIN') {
            setError('Access denied. Admin account required.');
            return;
        }

        setUser(userData);
        setAdmin(userData);
        return true;
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
                            {/* <h1 className="text-3xl font-bold text-gray-900">
                                {publisher?.displayName || 'Publisher Dashboard'}
                            </h1> */}
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
                <TabsList className="grid w-full grid-cols-3 gap-2">
                    <TabsTrigger value="games" className="flex items-center justify-center gap-2 w-full">
                        <Building className="w-4 h-4" />
                        <span>Games Management</span>
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center justify-center gap-2 w-full">
                        <TrendingUp className="w-4 h-4" />
                        <span>Reports</span>
                    </TabsTrigger>
                    <TabsTrigger value="accessibility-tags" className="flex items-center justify-center gap-2 w-full">
                        <TrendingUp className="w-4 h-4" />
                        <span>Accessibility Tags</span>
                    </TabsTrigger>
                </TabsList>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-6">
                    
                </TabsContent>

                {/* Accessibility Tags Tab */}
                <TabsContent value="accessibility-tags" className="space-y-6">
                    <AccessibilityTagsAdminTab />
                </TabsContent>

                {/* Games Management Tab */}
                <TabsContent value="games" className="space-y-6">
                    <AdminDeleteAndVerifyTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}