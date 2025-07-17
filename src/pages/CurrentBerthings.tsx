import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Ship, Anchor, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Berthing {
  id: string;
  shipName: string;
  imoNumber: string;
  status: 'docked' | 'departed' | 'scheduled' | 'delayed';
  arrivalDate: string;
  departureDate: string;
  dock: string;
  cargoType?: string;
  cargoWeight?: number;
}

export default function CurrentBerthings() {
  const [berthings, setBerthings] = useState<Berthing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mock data - replace with API call
  useEffect(() => {
    const fetchBerthings = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await api.get('/berthings/current');
        // setBerthings(response.data);
        
        // Mock data
        const mockData: Berthing[] = [
          {
            id: '1',
            shipName: 'MV Kribi Express',
            imoNumber: 'IMO1234567',
            status: 'docked',
            arrivalDate: '2025-07-14T08:30:00',
            departureDate: '2025-07-16T18:00:00',
            dock: 'Dock A',
            cargoType: 'Containers',
            cargoWeight: 12000,
          },
          {
            id: '2',
            shipName: 'MV Douala Star',
            imoNumber: 'IMO7654321',
            status: 'scheduled',
            arrivalDate: '2025-07-15T10:00:00',
            departureDate: '2025-07-17T20:00:00',
            dock: 'Dock C',
            cargoType: 'Bulk Cargo',
            cargoWeight: 25000,
          },
          {
            id: '3',
            shipName: 'MV Yaounde Trader',
            imoNumber: 'IMO9876543',
            status: 'delayed',
            arrivalDate: '2025-07-13T14:00:00',
            departureDate: '2025-07-15T22:00:00',
            dock: 'Dock B',
            cargoType: 'Vehicles',
            cargoWeight: 500,
          },
        ];
        
        setBerthings(mockData);
      } catch (error) {
        console.error('Error fetching berthings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerthings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'docked':
        return <Badge className="bg-green-500 hover:bg-green-600">Docked</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Scheduled</Badge>;
      case 'departed':
        return <Badge variant="outline">Departed</Badge>;
      case 'delayed':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Delayed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Current Berthings</h1>
          <p className="text-muted-foreground">View all current and upcoming vessel berthings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Berthing Schedule</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel</TableHead>
                  <TableHead>IMO Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Dock</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {berthings.length > 0 ? (
                  berthings.map((berthing) => (
                    <TableRow key={berthing.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Ship className="h-4 w-4 mr-2 text-muted-foreground" />
                          {berthing.shipName}
                        </div>
                      </TableCell>
                      <TableCell>{berthing.imoNumber}</TableCell>
                      <TableCell>{getStatusBadge(berthing.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(berthing.arrivalDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {formatDate(berthing.departureDate)}
                        </div>
                      </TableCell>
                      <TableCell>{berthing.dock}</TableCell>
                      <TableCell>
                        {berthing.cargoType && (
                          <div className="space-y-1">
                            <div>{berthing.cargoType}</div>
                            {berthing.cargoWeight && (
                              <div className="text-xs text-muted-foreground">
                                {berthing.cargoWeight.toLocaleString()} kg
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/berthing/${berthing.id}`)}>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No berthings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
