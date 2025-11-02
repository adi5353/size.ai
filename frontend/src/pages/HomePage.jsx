import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Activity,
  TrendingUp,
  Shield,
  Database,
  Cpu,
  Cloud,
  CheckCircle,
  ArrowRight,
  Users,
  Zap,
  Lock,
} from 'lucide-react';
import Header from '@/components/layout/Header';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    {
      icon: <Database className="w-6 h-6 text-primary" />,
      title: 'Infrastructure Sizing',
      description: 'Calculate precise hardware, storage, and network requirements for your SIEM/XDR deployment',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-accent" />,
      title: 'Growth Projections',
      description: '3-year infrastructure forecasting with customizable annual growth rates',
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: 'Compliance Templates',
      description: 'Pre-configured settings for PCI-DSS, HIPAA, GDPR, and SOC 2 compliance',
    },
    {
      icon: <Cpu className="w-6 h-6 text-accent" />,
      title: 'Real-time Calculations',
      description: 'Instant EPS, data volume, and storage calculations as you configure devices',
    },
    {
      icon: <Cloud className="w-6 h-6 text-primary" />,
      title: 'Save Configurations',
      description: 'Store multiple scenarios and compare different sizing approaches',
    },
    {
      icon: <Activity className="w-6 h-6 text-accent" />,
      title: 'AI Assistant',
      description: 'Get intelligent recommendations and insights for optimal infrastructure sizing',
    },
  ];

  const benefits = [
    'Professional PDF reports for stakeholder presentations',
    'Cost estimation with hardware, storage, and network breakdown',
    'High availability recommendations with RTO/RPO metrics',
    'Hot/cold storage optimization for cost efficiency',
    'Architecture recommendations based on deployment size',
    'Multiple saved configurations for easy comparison',
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32 max-w-7xl">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Professional Security Infrastructure Planning
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
            <span className="gradient-text">AI-Powered</span>
            <br />
            <span className="text-foreground">SIEM & XDR Sizing</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plan your security infrastructure with confidence. Calculate hardware, storage, 
            and costs for your SIEM/XDR deployment with professional accuracy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow"
              onClick={() => setAuthModalOpen(true)}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10"
              onClick={() => window.scrollTo({ top: document.getElementById('features').offsetTop, behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Instant Access</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Image/Preview */}
        <motion.div
          className="mt-16 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="glass-card p-2 shadow-2xl border-border/30">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Professional Calculator Interface</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 max-w-7xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features for accurate SIEM/XDR infrastructure planning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 h-full hover:shadow-glow transition-all duration-300 border-border/30 hover:border-primary/30">
                <div className="mb-4 w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-heading font-bold text-foreground mb-6">
              Why Security Teams Choose size.ai
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Make informed decisions with accurate calculations and professional reports. 
              Save time and reduce costs with intelligent infrastructure planning.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">For Security Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Built by security professionals for security operations teams
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time calculations update instantly as you configure devices
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6 border-border/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your configurations are encrypted and only accessible to you
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <motion.div
          className="glass-card p-12 rounded-2xl text-center border-border/30"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-heading font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join security professionals who trust size.ai for their infrastructure planning. 
            Create your free account in seconds.
          </p>
          <Button
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow"
            onClick={() => setAuthModalOpen(true)}
          >
            Start Planning Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 max-w-7xl border-t border-border/30">
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 size.ai - Professional SIEM & XDR Infrastructure Sizing</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default HomePage;
