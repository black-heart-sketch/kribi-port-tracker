import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Clock, MapPin, Package, Ship as ShipIcon, X, Flag, 
  Building2, Ruler, CalendarDays, Hash
} from 'lucide-react';
import shipService from '@/services/ships.service';
import type { Ship } from '@/types';
import { format } from 'date-fns';

const ShipStatus = () => {
  const [ships, setShips] = useState<Ship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);

  const getStatusColor = (status: Ship['status']) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-warning text-warning-foreground';
      case 'maintenance': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const data = await shipService.getShips();
        setShips(data);
      } catch (error) {
        console.error('Error fetching ships:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShips();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Live Ship Status</h3>
        <Badge variant="outline" className="animate-pulse">
          <div className="w-2 h-2 bg-success rounded-full mr-2" />
          Live Updates
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ships.map((ship, index) => (
          <Card
            key={index}
            onClick={() => setSelectedShip(ship)}
            className="cursor-pointer bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-colors"
          >
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <ShipIcon className="w-4 h-4" />
                  <span>{ship.name}</span>
                </div>
              </CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(ship.status)}>
                  {ship.status}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span>IMO: {ship.imoNumber || 'N/A'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <span>{ship.status}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Type</span>
                  </div>
                  <span>{ship.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Dimensions</span>
                  </div>
                  <span>{ship.length ? `${ship.length}m × ${ship.beam}m × ${ship.draft}m` : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ship Details Modal */}
      <Dialog open={!!selectedShip} onOpenChange={(open) => !open && setSelectedShip(null)}>
        <DialogContent className="max-w-3xl">
          {selectedShip && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedShip.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      <Package className="w-4 h-4" />
                      <span>{selectedShip.type || 'N/A'}</span>
                      <span>•</span>
                      <span>IMO: {selectedShip.imoNumber || 'N/A'}</span>
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className={getStatusColor(selectedShip.status)}>
                    {selectedShip.status.toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Identification */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Identification
                    </h3>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">IMO Number</span>
                        <span className="text-sm font-medium">{selectedShip.imoNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">MMSI Number</span>
                        <span className="text-sm font-medium">{selectedShip.mmsiNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Flag</span>
                        <span className="text-sm font-medium">{selectedShip.flag || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Year Built</span>
                        <span className="text-sm font-medium">{selectedShip.yearBuilt || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Company & Owner */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Company & Owner
                    </h3>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Company</span>
                        <span className="text-sm font-medium">{selectedShip.company || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Owner</span>
                        <span className="text-sm font-medium">{selectedShip.owner || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Dimensions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Dimensions
                    </h3>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Length</span>
                        <span className="text-sm font-medium">
                          {selectedShip.length ? `${selectedShip.length.toLocaleString()} m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Beam</span>
                        <span className="text-sm font-medium">
                          {selectedShip.beam ? `${selectedShip.beam.toLocaleString()} m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Draft</span>
                        <span className="text-sm font-medium">
                          {selectedShip.draft ? `${selectedShip.draft.toLocaleString()} m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gross Tonnage</span>
                        <span className="text-sm font-medium">
                          {selectedShip.grossTonnage ? selectedShip.grossTonnage.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Net Tonnage</span>
                        <span className="text-sm font-medium">
                          {selectedShip.netTonnage ? selectedShip.netTonnage.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Dates
                    </h3>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created</span>
                        <span className="text-sm font-medium">
                          {selectedShip.createdAt ? format(new Date(selectedShip.createdAt), 'PPpp') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm font-medium">
                          {selectedShip.updatedAt ? format(new Date(selectedShip.updatedAt), 'PPpp') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShipStatus;
