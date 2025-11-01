import { motion } from 'framer-motion';
import { Activity, LogIn, LogOut, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

export const Header = ({ onSaveConfig, onLoadConfigs }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold gradient-text">size.ai</h1>
                <p className="text-xs text-muted-foreground">AI-Powered SIEM & XDR Infrastructure Sizing</p>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onSaveConfig}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save to Account
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                        <User className="w-4 h-4 mr-2" />
                        {user?.name || user?.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onLoadConfigs}>
                        <Save className="mr-2 h-4 w-4" />
                        <span>My Configurations</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login / Register
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default Header;