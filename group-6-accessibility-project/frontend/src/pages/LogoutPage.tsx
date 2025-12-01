import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LogOut, CheckCircle } from 'lucide-react';

export function LogoutPage() {
  
  useEffect(() => {
    // Clear all authentication data immediately when component loads
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Clear any other auth-related data you might have
    localStorage.removeItem('refresh_token'); // if you have one
    sessionStorage.clear(); // Clear session storage too
    
    console.log('User logged out - tokens cleared');
  }, []);

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleHomeRedirect = () => {
    window.location.href = '/games/1'; // or your home page
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Logged Out Successfully
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <LogOut className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              You have been successfully logged out.
            </p>
            <p className="text-sm text-muted-foreground">
              All authentication tokens have been cleared from your device.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleLoginRedirect}
              className="w-full"
            >
              Login Again
            </Button>
            
            <Button 
              onClick={handleHomeRedirect}
              variant="outline"
              className="w-full"
            >
              Browse Games
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Thank you for using our platform! 👋
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}