import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import {
  Activity,
  TrendingUp,
  Database,
  Clock,
  Calendar,
  Trash2,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

export const DashboardPage = () => {
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConfigs: 0,
    totalDevices: 0,
    totalEPS: 0,
    avgStorageTB: 0,
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load configurations
      const configsResponse = await fetch(`${API_URL}/api/configurations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!configsResponse.ok) {
        throw new Error('Failed to load configurations');
      }

      const configs = await configsResponse.json();
      setConfigurations(configs);
      calculateStats(configs);

      // Load user's activity history
      const activityResponse = await fetch(`${API_URL}/api/auth/my-activity?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivities(activityData);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (configs) => {
    const totalConfigs = configs.length;
    const totalDevices = configs.reduce((sum, c) => sum + (c.results?.totalDevices || 0), 0);
    const totalEPS = configs.reduce((sum, c) => sum + (c.results?.totalEPS || 0), 0);
    const avgStorageTB = configs.length > 0
      ? configs.reduce((sum, c) => sum + (c.results?.totalStorageTB || 0), 0) / configs.length
      : 0;

    setStats({ totalConfigs, totalDevices, totalEPS, avgStorageTB });
  };

  const deleteConfiguration = async (configId) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/configurations/${configId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete configuration');
      }

      toast.success('Configuration deleted');
      loadConfigurations();
    } catch (error) {
      toast.error(error.message || 'Failed to delete configuration');
    }
  };

  const loadConfiguration = (config) => {
    navigate('/calculator', { state: { loadedConfig: config } });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-heading font-bold text-foreground mb-2">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your SIEM/XDR infrastructure configurations and analyze your deployment history
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.totalConfigs}
              </div>
              <div className="text-sm text-muted-foreground">Saved Configurations</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-accent" />
                <span className="text-xs text-muted-foreground">Across all configs</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.totalDevices.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">Events/Second</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.totalEPS.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total EPS</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-8 h-8 text-accent" />
                <span className="text-xs text-muted-foreground">Average</span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats.avgStorageTB.toFixed(1)} TB
              </div>
              <div className="text-sm text-muted-foreground">Avg Storage</div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => navigate('/calculator')}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Configuration
          </Button>
        </motion.div>

        {/* Configurations List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Your Configurations
            </h2>
          </div>

          {configurations.length === 0 ? (
            <Card className="glass-card p-12 text-center border-border/30">
              <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No configurations yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first infrastructure configuration to get started
              </p>
              <Button
                onClick={() => navigate('/calculator')}
                className="bg-gradient-primary hover:opacity-90"
              >
                Create Configuration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {configurations.map((config, index) => (
                <motion.div
                  key={config.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="glass-card p-6 border-border/30 hover:border-primary/30 transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          {config.name}
                        </h3>
                        {config.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {config.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="text-xs text-muted-foreground mb-1">Devices</div>
                            <div className="text-lg font-bold text-foreground">
                              {config.results?.totalDevices?.toLocaleString() || 0}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="text-xs text-muted-foreground mb-1">EPS</div>
                            <div className="text-lg font-bold text-foreground">
                              {config.results?.totalEPS?.toLocaleString() || 0}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="text-xs text-muted-foreground mb-1">Daily GB</div>
                            <div className="text-lg font-bold text-foreground">
                              {config.results?.dailyGB?.toFixed(1) || 0}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <div className="text-xs text-muted-foreground mb-1">Storage</div>
                            <div className="text-lg font-bold text-primary">
                              {config.results?.totalStorageTB?.toFixed(2) || 0} TB
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {formatDate(config.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated: {formatDate(config.updated_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => loadConfiguration(config)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteConfiguration(config.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 max-w-7xl border-t border-border/30">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 size.ai - Professional SIEM & XDR Infrastructure Sizing</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
