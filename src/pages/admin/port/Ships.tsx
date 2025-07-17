import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, Anchor, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/config/axios.config';
import { Ship } from '@/types';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import shipService from '@/services/ships.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the form values type
const SHIP_TYPES = {
  container: 'Container Ship',
  tanker: 'Tanker',
  bulk_carrier: 'Bulk Carrier',
  general_cargo: 'General Cargo',
  roro: 'Ro-Ro Vessel',
  passenger: 'Passenger Ship',
  other: 'Other',
} as const;

type ShipType = keyof typeof SHIP_TYPES;

type ShipFormValues = {
  name: string;
  imoNumber: string;
  mmsiNumber?: string;
  flag?: string;
  type: ShipType;
  shippingCompany?: string;
  length?: number;
  beam?: number;
  draft?: number;
  grossTonnage?: number;
  netTonnage?: number;
  yearBuilt?: number;
  owner?: string;
  status: 'active' | 'inactive' | 'maintenance';
  userId?: string;
  company?: string;
};

const shipFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  imoNumber: z.string().min(1, 'IMO number is required'),
  mmsiNumber: z.string().optional(),
  flag: z.string().optional(),
  type: z.enum(Object.keys(SHIP_TYPES) as [ShipType, ...ShipType[]]).default('other'),
  shippingCompany: z.string().optional(),
  length: z.coerce.number().optional(),
  beam: z.coerce.number().optional(),
  draft: z.coerce.number().optional(),
  grossTonnage: z.coerce.number().optional(),
  netTonnage: z.coerce.number().optional(),
  yearBuilt: z.coerce.number().optional(),
  owner: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance'] as const).default('active'),
  userId: z.string().optional(),
  company: z.string().optional(),
});

export default function Ships() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentShip, setCurrentShip] = useState<Ship | null>(null);
  const { toast } = useToast();
  const { getUserId } = useAuth();
  
  // Generate years from 1900 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );


  const form = useForm<ShipFormValues>({
    resolver: zodResolver(shipFormSchema),
    defaultValues: {
      name: '',
      imoNumber: '',
      mmsiNumber: '',
      flag: '',
      type: 'other', // Set default type to 'other'
      length: undefined,
      beam: undefined,
      draft: undefined,
      grossTonnage: undefined,
      netTonnage: undefined,
      yearBuilt: currentYear,
      owner: '',
      status: 'active',
      userId: getUserId(),
      company: '',
    },
  });

  useEffect(() => {
    if (currentShip) {
      form.reset({
        name: currentShip.name,
        imoNumber: currentShip.imoNumber || '',
        mmsiNumber: currentShip.mmsiNumber || '',
        flag: currentShip.flag || '',
        type: currentShip.type || '',
        length: currentShip.length,
        beam: currentShip.beam,
        draft: currentShip.draft,
        grossTonnage: currentShip.grossTonnage,
        netTonnage: currentShip.netTonnage,
        yearBuilt: currentShip.yearBuilt,
        owner: currentShip.owner || '',
        status: currentShip.status || 'active',
        userId: getUserId(),
        company: currentShip.company || '',
      });
    } else {
      form.reset({
        name: '',
        imoNumber: '',
        mmsiNumber: '',
        flag: '',
        type: 'other', // Set default type to 'other'
        length: undefined,
        beam: undefined,
        draft: undefined,
        grossTonnage: undefined,
        netTonnage: undefined,
        yearBuilt: currentYear,
        owner: '',
        status: 'active',
        userId: getUserId(),
        company: '',
      });
    }
  }, [currentShip, form]);

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    try {
      setLoading(true);
      const response = await shipService.getShips();
      console.log(response);
      setShips(response);
    } catch (error) {
      console.error('Error fetching ships:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ships. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ship?')) {
      try {
        await shipService.deleteShip(id);
        toast({
          title: 'Success',
          description: 'Ship deleted successfully',
        });
        fetchShips();
      } catch (error) {
        console.error('Error deleting ship:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete ship. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (ship: Ship) => {
    setCurrentShip(ship);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentShip(null);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ShipFormValues) => {
    try {
      // Prepare the ship data with required fields
      const shipData = {
        name: data.name,
        imoNumber: data.imoNumber,
        mmsiNumber: data.mmsiNumber,
        flag: data.flag,
        type: data.type,
        length: data.length,
        beam: data.beam,
        draft: data.draft,
        grossTonnage: data.grossTonnage,
        netTonnage: data.netTonnage,
        yearBuilt: data.yearBuilt,
        owner: data.owner,
        status: data.status,
        createdBy: getUserId(),
        company: data.company,
      };

      if (currentShip) {
        // Update existing ship
        await shipService.updateShip(currentShip._id, shipData);
        toast({
          title: 'Success',
          description: 'Ship updated successfully',
        });
      } else {
        // Create new ship
        await shipService.createShip(shipData);
        toast({
          title: 'Success',
          description: 'Ship created successfully',
        });
      }
      setIsDialogOpen(false);
      fetchShips();
    } catch (error) {
      console.error('Error saving ship:', error);
      toast({
        title: 'Error',
        description: `Failed to ${currentShip ? 'update' : 'create'} ship. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const filteredShips = ships.filter(ship =>
    ship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.imoNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.flag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Ships</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Ship
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ships List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ships..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ship Name</TableHead>
                  <TableHead>IMO Number</TableHead>
                  <TableHead>Flag</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShips.length > 0 ? (
                  filteredShips.map((ship) => (
                    <TableRow key={ship._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Anchor className="mr-2 h-4 w-4 text-muted-foreground" />
                          {ship.name}
                        </div>
                      </TableCell>
                      <TableCell>{ship.imoNumber || 'N/A'}</TableCell>
                      <TableCell>{ship.flag || 'N/A'}</TableCell>
                      <TableCell>{ship.type || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          ship.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {ship.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(ship)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ship._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No matching ships found' : 'No ships available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Ship Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentShip ? 'Edit Ship' : 'Add New Ship'}</DialogTitle>
            <DialogDescription>
              {currentShip ? 'Update the ship details below.' : 'Fill in the details to add a new ship.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ship Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ship name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imoNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMO Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter IMO number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mmsiNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MMSI Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter MMSI number" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="flag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flag</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter flag country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ship Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ship type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(SHIP_TYPES).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Company</FormLabel>
                        <FormControl>
                          <Input placeholder="Shipping company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Enter length" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beam (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Enter beam" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="draft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Draft (m)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Enter draft" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grossTonnage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Tonnage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Enter gross tonnage" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netTonnage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Tonnage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Enter net tonnage" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="yearBuilt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Built</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                        value={field.value ? String(field.value) : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {years.map((year) => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter owner name" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            

              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {currentShip ? 'Update Ship' : 'Add Ship'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
