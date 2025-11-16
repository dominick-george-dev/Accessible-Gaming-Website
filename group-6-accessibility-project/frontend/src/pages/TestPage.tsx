import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function TestPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setToken(storedToken);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleGoBack = () => {
    window.location.href = '/login';
  };

  const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Date not available';
  
  try {
    // Handle the database format: "2025-11-16 14:44:10.951"
    // Convert it to a proper ISO format that JavaScript can parse
    const isoDate = dateString.replace(' ', 'T') + 'Z';
    const date = new Date(isoDate);
    
    if (isNaN(date.getTime())) {
      const directDate = new Date(dateString);
      if (isNaN(directDate.getTime())) {
        return 'Invalid date format';
      }
      return directDate.toLocaleString();
    }
    
    return date.toLocaleString();
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Date parsing failed';
  }
};

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No user logged in. Please log in first.
            </p>
            <Button 
              onClick={handleGoBack} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">🎉 Authentication Test Success!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ User Successfully Logged In
            </h3>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current User Session:</h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="font-medium">User ID:</span>
                  <span className="ml-2 font-mono text-sm bg-background px-2 py-1 rounded">
                    {user.id}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Username:</span>
                  <span className="ml-2 font-mono text-sm bg-background px-2 py-1 rounded">
                    {user.username}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 font-mono text-sm bg-background px-2 py-1 rounded">
                    {user.email}
                  </span>
                </div>
                <div>
                <span className="font-medium">Account Created:</span>
                <span className="ml-2 font-mono text-sm bg-background px-2 py-1 rounded">
                    {formatDate(user.createdAt)}
                </span>
                </div>
              </div>
            </div>
          </div>

          {/* Token Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">JWT Token Status:</h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Token Present:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {token ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Token Preview:</span>
                  <div className="ml-2 font-mono text-xs bg-background p-2 rounded mt-1 break-all">
                    {token ? `${token.substring(0, 50)}...` : 'No token found'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Actions:</h3>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
              >
                🚪 Logout & Clear Session
              </Button>
              <Button 
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="flex-1"
              >
                🔄 Back to Login
              </Button>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200">
              🎯 <strong>Authentication is working correctly!</strong><br />
              Both registration and login are successfully storing user sessions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}