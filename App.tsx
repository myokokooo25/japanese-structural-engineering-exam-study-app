import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import AuthScreen from './components/Login';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full border-t-indigo-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {user ? <Dashboard /> : <AuthScreen />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
