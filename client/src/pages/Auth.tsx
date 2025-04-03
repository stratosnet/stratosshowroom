import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import { AuthContextType } from '@/lib/authContext';
import { withOptionalAuth } from '@/lib/withAuth';

// The core component that will receive auth as a prop from withOptionalAuth
function AuthPageComponent({ auth }: { auth?: AuthContextType | null }) {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [, navigate] = useLocation();
  
  // Check authentication on mount and when auth changes
  useEffect(() => {
    if (auth?.isAuthenticated) {
      navigate('/');
    }
  }, [auth?.isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleRegisterSuccess = () => {
    navigate('/');
  };

  return (
    <div className="container max-w-md py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Welcome to Stratos Video</h1>
        <p className="text-muted-foreground mt-2">
          Decentralized streaming powered by IPFS
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Create Account</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => setActiveTab('register')}
          />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm 
            onSuccess={handleRegisterSuccess}
            onLoginClick={() => setActiveTab('login')}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export the wrapped component
export default withOptionalAuth(AuthPageComponent);