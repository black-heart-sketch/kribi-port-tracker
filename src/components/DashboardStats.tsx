import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Ship, Anchor, Package, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import shipService from '@/services/ships.service';
import dockService from '@/services/dock.service';

const DashboardStats = () => {
  const [stats, setStats] = useState([
    {
      title: "Active Ships",
      value: "0",
      description: "Currently active",
      icon: Ship,
      trend: "",
      color: "text-primary",
      type: 'ships'
    },
    {
      title: "Available Docks",
      value: "0",
      description: "Ready for berthing",
      icon: Anchor,
      trend: "",
      color: "text-accent",
      type: 'docks'
    },
    {
      title: "Cargo Processed",
      value: "0",
      description: "Tons this month",
      icon: Package,
      trend: "",
      color: "text-success",
      type: 'cargo'
    },
    {
      title: "Port Efficiency",
      value: "0%",
      description: "Dock utilization",
      icon: TrendingUp,
      trend: "",
      color: "text-warning",
      type: 'efficiency'
    }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch ships
        const ships = await shipService.getShips();
        const shipsActive = ships.filter(ship => ship.status === 'active').length;
        
        // Fetch docks
        const docks = await dockService.getDocks();
        const availableDocks = docks.filter(dock => dock.status === 'available').length;
        const totalDocks = docks.length;
        
        // Calculate efficiency
        const occupiedDocks = totalDocks - availableDocks;
        const efficiency = ((occupiedDocks / totalDocks) * 100).toFixed(1);
        const efficiencyNumber = parseFloat(efficiency);
        
        // Update stats
        setStats(prev => prev.map(stat => {
          switch(stat.type) {
            case 'ships':
              return {
                ...stat,
                value: shipsActive.toString(),
                trend: shipsActive > 0 ? `${shipsActive} ships active` : "No active ships"
              };
            case 'docks':
              return {
                ...stat,
                value: availableDocks.toString(),
                trend: availableDocks > 0 ? `${availableDocks} docks available` : "All docks occupied"
              };
            case 'efficiency':
              return {
                ...stat,
                value: `${efficiency}%`,
                trend: efficiencyNumber >= 80 ? "High utilization" : efficiencyNumber >= 60 ? "Moderate utilization" : "Low utilization"
              };
            default:
              return stat;
          }
        }));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

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