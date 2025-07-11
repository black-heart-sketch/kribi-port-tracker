import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Clock, MapPin, Package } from 'lucide-react';

const ShipStatus = () => {
  const ships = [
    {
      name: "MSC Marianna",
      type: "Container Ship",
      status: "Docked",
      dock: "Dock A-1",
      arrival: "2024-01-15 08:30",
      departure: "2024-01-16 14:00",
      cargo: "2,400 TEU",
      company: "Mediterranean Shipping Company"
    },
    {
      name: "Atlantic Pioneer",
      type: "Bulk Carrier",
      status: "Arriving",
      dock: "Dock B-2",
      arrival: "2024-01-15 16:45",
      departure: "2024-01-17 09:30",
      cargo: "45,000 tons grain",
      company: "Atlantic Shipping Lines"
    },
    {
      name: "Kribi Express",
      type: "General Cargo",
      status: "Loading",
      dock: "Dock C-1",
      arrival: "2024-01-14 11:20",
      departure: "2024-01-15 18:00",
      cargo: "Mixed cargo",
      company: "Cameroon Maritime Services"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Docked': return 'bg-success text-success-foreground';
      case 'Arriving': return 'bg-primary text-primary-foreground';
      case 'Loading': return 'bg-warning text-warning-foreground';
      case 'Departing': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Live Ship Status</h3>
        <Badge variant="outline" className="animate-pulse">
          <div className="w-2 h-2 bg-success rounded-full mr-2"></div>
          Live Updates
        </Badge>
      </div>
      
      <div className="space-y-4">
        {ships.map((ship, index) => (
          <Card key={index} className="bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-all duration-300 hover:shadow-glow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-wave rounded-lg">
                    <Ship className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{ship.name}</CardTitle>
                    <CardDescription>{ship.company}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(ship.status)}>
                  {ship.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Ship className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="text-foreground font-medium">{ship.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Dock:</span>
                  <span className="text-foreground font-medium">{ship.dock}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Arrival:</span>
                  <span className="text-foreground font-medium">{ship.arrival}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cargo:</span>
                  <span className="text-foreground font-medium">{ship.cargo}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShipStatus;