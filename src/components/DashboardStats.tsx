import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Anchor, Package, TrendingUp } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: "Ships Docked",
      value: "12",
      description: "Currently in port",
      icon: Ship,
      trend: "+2 from yesterday",
      color: "text-primary"
    },
    {
      title: "Active Berthings",
      value: "8",
      description: "Pending approval",
      icon: Anchor,
      trend: "+1 this week",
      color: "text-accent"
    },
    {
      title: "Cargo Processed",
      value: "2,847",
      description: "Tons this month",
      icon: Package,
      trend: "+12% from last month",
      color: "text-success"
    },
    {
      title: "Port Efficiency",
      value: "94%",
      description: "Dock utilization",
      icon: TrendingUp,
      trend: "+3% improvement",
      color: "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.description}
              </p>
              <p className={`text-xs ${stat.color} font-medium`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats;