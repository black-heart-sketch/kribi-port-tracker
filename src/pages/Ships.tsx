import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Ship, Search, Plus, MapPin, Calendar, Package, Building } from 'lucide-react';

const Ships = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const ships = [
    {
      id: 1,
      name: "MSC Marianna",
      imo: "IMO 9456123",
      type: "Container Ship",
      company: "Mediterranean Shipping Company",
      flag: "Liberia",
      status: "Docked",
      dock: "Dock A-1",
      arrival: "2024-01-15",
      departure: "2024-01-16",
      cargo: "2,400 TEU",
      length: "366m",
      beam: "51m",
      photo: "🚢"
    },
    {
      id: 2,
      name: "Atlantic Pioneer",
      imo: "IMO 9567234",
      type: "Bulk Carrier",
      company: "Atlantic Shipping Lines",
      flag: "Panama",
      status: "Arriving",
      dock: "Dock B-2",
      arrival: "2024-01-15",
      departure: "2024-01-17",
      cargo: "45,000 tons grain",
      length: "225m",
      beam: "32m",
      photo: "⛴️"
    },
    {
      id: 3,
      name: "Kribi Express",
      imo: "IMO 9234567",
      type: "General Cargo",
      company: "Cameroon Maritime Services",
      flag: "Cameroon",
      status: "Loading",
      dock: "Dock C-1",
      arrival: "2024-01-14",
      departure: "2024-01-15",
      cargo: "Mixed cargo",
      length: "180m",
      beam: "28m",
      photo: "🛳️"
    },
    {
      id: 4,
      name: "Douala Star",
      imo: "IMO 9345678",
      type: "Tanker",
      company: "West African Tankers",
      flag: "Nigeria",
      status: "Scheduled",
      dock: "Dock D-1",
      arrival: "2024-01-16",
      departure: "2024-01-18",
      cargo: "30,000 tons petroleum",
      length: "200m",
      beam: "30m",
      photo: "🛢️"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Docked': return 'bg-success text-success-foreground';
      case 'Arriving': return 'bg-primary text-primary-foreground';
      case 'Loading': return 'bg-warning text-warning-foreground';
      case 'Scheduled': return 'bg-accent text-accent-foreground';
      case 'Departing': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredShips = ships.filter(ship =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Ship Registry</h1>
            <p className="text-muted-foreground">Manage vessels and track port operations</p>
          </div>
          <Button className="bg-gradient-wave mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Register New Ship
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search ships by name, company, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/60 backdrop-blur border-border/50"
          />
        </div>

        {/* Ships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShips.map((ship) => (
            <Card key={ship.id} className="bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-all duration-300 hover:shadow-glow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{ship.photo}</div>
                    <div>
                      <CardTitle className="text-lg text-foreground">{ship.name}</CardTitle>
                      <CardDescription className="text-sm">{ship.imo}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(ship.status)}>
                    {ship.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Ship Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Ship className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="text-foreground font-medium">{ship.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Flag:</span>
                    <span className="text-foreground font-medium">{ship.flag}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dock:</span>
                    <span className="text-foreground font-medium">{ship.dock}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cargo:</span>
                    <span className="text-foreground font-medium">{ship.cargo}</span>
                  </div>
                </div>

                {/* Company */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="text-foreground font-medium">{ship.company}</p>
                </div>

                {/* Schedule */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Arrival:</span>
                    <span className="text-foreground font-medium">{ship.arrival}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">Departure:</span>
                    <span className="text-foreground font-medium">{ship.departure}</span>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="flex items-center justify-between text-sm pt-3 border-t border-border/30">
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="text-foreground font-medium">{ship.length} × {ship.beam}</span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredShips.length === 0 && (
          <div className="text-center py-12">
            <Ship className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No ships found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ships;