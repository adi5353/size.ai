import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Shield,
  Users,
  Activity,
  TrendingUp,
  LogIn,
  UserPlus,
  Search,
  RefreshCw,
  Home,
  LogOut,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const AdminDashboardPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [signupData, setSignupData] = useState([]);
  const [loginData, setLoginData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Verify admin access and load stats
      const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!statsRes.ok) {
        toast.error('Admin access denied');
        navigate('/admin-login');
        return;
      }

      const statsData = await statsRes.json();
      setStats(statsData);

      // Load users
      const usersRes = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Load activities
      const activitiesRes = await fetch(`${API_URL}/api/admin/activity?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData);

      // Load chart data
      const signupRes = await fetch(`${API_URL}/api/admin/charts/signups?days=${dateFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const signupChartData = await signupRes.json();
      setSignupData(signupChartData);

      const loginRes = await fetch(`${API_URL}/api/admin/charts/logins?days=${dateFilter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const loginChartData = await loginRes.json();
      setLoginData(loginChartData);

    } catch (error) {
      toast.error('Failed to load dashboard data');
      navigate('/admin-login');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      activityFilter === 'all' || activity.activity_type === activityFilter;
    
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['User Name', 'Email', 'Activity', 'IP Address', 'User Agent', 'Timestamp'];
    const rows = filteredActivities.map(activity => [
      activity.user_name,
      activity.user_email,
      activity.activity_type,
      activity.ip_address || 'N/A',
      activity.user_agent || 'N/A',
      formatDate(activity.timestamp)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Activity log exported to CSV');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold gradient-text">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">size.ai • Administrative Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <Home className="w-4 h-4 mr-2" />
                User Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
            System Overview
          </h2>
          <p className="text-muted-foreground">
            Monitor user activity and system statistics in real-time
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card p-6 border-border/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.total_users || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card p-6 border-border/30 bg-gradient-to-br from-accent/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                +{stats?.recent_users_7d || 0}
              </div>
              <div className="text-sm text-muted-foreground">New (7 days)</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-card p-6 border-border/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <LogIn className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.total_logins || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Logins</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass-card p-6 border-border/30 bg-gradient-to-br from-accent/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <UserPlus className="w-8 h-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.total_registrations || 0}
              </div>
              <div className="text-sm text-muted-foreground">Registrations</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-card p-6 border-border/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stats?.recent_activity_24h || 0}
              </div>
              <div className="text-sm text-muted-foreground">Active (24h)</div>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signup Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-bold text-foreground">
                  Signup Trend
                </h3>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Login Frequency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="glass-card p-6 border-border/30">
              <h3 className="text-lg font-heading font-bold text-foreground mb-4">
                Login Frequency
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={loginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#9ca3af' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#06b6d4"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="glass-card p-6 border-border/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-heading font-bold text-foreground">
                Recent Activity
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border/50"
                  />
                </div>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="login">Logins Only</SelectItem>
                    <SelectItem value="register">Signups Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Activity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Device</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-muted-foreground">
                        No activity found
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map((activity, index) => (
                      <motion.tr
                        key={activity.id}
                        className="border-b border-border/20 hover:bg-secondary/30 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                      >
                        <td className="py-3 px-4 text-sm text-foreground">{activity.user_name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{activity.user_email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            activity.activity_type === 'login'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-accent/10 text-accent'
                          }`}>
                            {activity.activity_type === 'login' ? (
                              <><LogIn className="w-3 h-3 mr-1" /> Login</>
                            ) : (
                              <><UserPlus className="w-3 h-3 mr-1" /> Register</>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate" title={activity.user_agent}>
                          {activity.user_agent ? (
                            activity.user_agent.includes('Chrome') ? '🌐 Chrome' :
                            activity.user_agent.includes('Firefox') ? '🦊 Firefox' :
                            activity.user_agent.includes('Safari') ? '🧭 Safari' :
                            activity.user_agent.includes('Edge') ? '🌊 Edge' : '💻 Other'
                          ) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground font-mono">
                          {activity.ip_address || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-12 max-w-7xl border-t border-border/30">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 size.ai Admin Portal</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
