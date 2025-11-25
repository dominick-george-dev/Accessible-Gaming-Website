import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle, CheckCircle, User, Building } from 'lucide-react';

export function MakeAccountPublisherPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Pre-fill display name with username
      setDisplayName(userData.username);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!user) {
      setError('You must be logged in to create a publisher account');
      setIsSubmitting(false);
      return;
    }

    if (!displayName.trim()) {
      setError('Publisher display name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('http://localhost:3000/publishers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          displayName: displayName.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Update user role in localStorage
        const updatedUser = { ...user, role: 'PUBLISHER' };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Redirect to publisher dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = '/publisher-dashboard';
        }, 3000);
      } else {
        setError(data.message || 'Failed to create publisher account');
      }
    } catch (error) {
      console.error('Publisher account creation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/games/1';
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to create a publisher account.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Publisher Account Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Congratulations!</strong> Your publisher account has been created successfully.
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Publisher Name:</span>
                <span className="text-sm">{displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Role:</span>
                <span className="text-sm font-mono bg-background px-2 py-1 rounded">PUBLISHER</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Redirecting to your publisher dashboard in 3 seconds...
            </p>

            <Button 
              onClick={() => window.location.href = '/publisher-dashboard'}
              className="w-full"
            >
              Go to Publisher Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Building className="h-5 w-5" />
            Create Publisher Account
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Join our publisher program and start sharing your games with the community
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Current User Info */}
            <div className="bg-muted p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Creating publisher account for:</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs font-mono bg-background px-2 py-1 rounded inline-block">
                  Current Role: {user.role}
                </p>
              </div>
            </div>

            {/* Display Name Field */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-base font-medium">
                Publisher Display Name *
              </Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Enter your publisher display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear to users when they view your games
              </p>
            </div>

            {/* Role Upgrade Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                What happens when you create a publisher account:
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Your role will be upgraded to PUBLISHER</li>
                <li>• You'll get access to the publisher dashboard</li>
                <li>• You can start uploading and managing games</li>
                <li>• Your games will show your publisher name</li>
              </ul>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !displayName.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Publisher Account...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4 mr-2" />
                    Create Publisher Account
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}