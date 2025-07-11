import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ship, Anchor, Users, BarChart3, Shield, Globe, Clock, TrendingUp } from 'lucide-react';
import portHero from '@/assets/port-hero.jpg';

const Index = () => {
  const features = [
    {
      icon: Ship,
      title: "Ship Management",
      description: "Track vessel arrivals, departures, and real-time port operations",
      color: "text-primary"
    },
    {
      icon: Anchor,
      title: "Berthing Control",
      description: "Manage dock allocations and berthing schedules efficiently", 
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Dedicated interfaces for agents, administrators, and cargo owners",
      color: "text-success"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and real-time port performance metrics",
      color: "text-warning"
    }
  ];

  const stats = [
    { label: "Ships Processed", value: "2,847", icon: Ship },
    { label: "Cargo Handled", value: "1.2M tons", icon: Anchor },
    { label: "Active Users", value: "456", icon: Users },
    { label: "Uptime", value: "99.9%", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-ocean">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${portHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background/90"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            <Globe className="w-4 h-4 mr-2" />
            Port Authority of Kribi
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Maritime Operations
            <span className="block text-primary">Management System</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline port operations with our comprehensive berth tracking platform. 
            Manage ships, cargo, and logistics with real-time visibility and collaborative workflows.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-wave text-lg px-8 py-6 shadow-glow">
                <BarChart3 className="w-5 h-5 mr-2" />
                Access Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
              <Shield className="w-5 h-5 mr-2" />
              View Public Data
            </Button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-card/40 backdrop-blur border-border/50">
                  <CardContent className="p-4 text-center">
                    <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Floating Animation Elements */}
        <div className="absolute top-20 left-10 opacity-30">
          <Ship className="w-8 h-8 text-primary animate-float" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-30">
          <Anchor className="w-6 h-6 text-accent animate-wave" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Port Management Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for efficient maritime operations and cargo management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-all duration-300 hover:shadow-glow group">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-wave rounded-2xl group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/30 backdrop-blur">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the Port Authority of Kribi digital transformation and streamline your maritime operations today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-wave text-lg px-8 py-6">
              <Users className="w-5 h-5 mr-2" />
              Register Account
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary/30">
              <Clock className="w-5 h-5 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
