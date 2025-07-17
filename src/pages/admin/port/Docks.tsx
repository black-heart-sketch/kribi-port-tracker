import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/config/axios.config';
import { Dock } from '@/types';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dockService from '@/services/dock.service';
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
type DockFormValues = {
  name: string;
  location: string;
  status: 'available' | 'occupied' | 'maintenance';
  maxVessels?: number;
  maxDraft: number;
  length: number;
  description?: string;
};

const dockFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['available', 'occupied', 'maintenance'] as const),
  maxVessels: z.coerce.number().int().positive().optional(),
  maxDraft: z.coerce.number().positive('Maximum draft must be a positive number'),
  length: z.coerce.number().positive('Length must be a positive number'),
  description: z.string().optional(),
});

// This ensures the form schema matches our Dock type
const dockFormSchemaWithDefaults = dockFormSchema.default({
  status: 'available',
});

export default function Docks() {
  const [docks, setDocks] = useState<Dock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentDock, setCurrentDock] = useState<Dock | null>(null);
  const { toast } = useToast();

  const form = useForm<DockFormValues>({
    resolver: zodResolver(dockFormSchemaWithDefaults),
    defaultValues: {
      name: '',
      location: '',
      status: 'available',
      maxVessels: undefined,
      maxDraft: 0,
      length: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (currentDock) {
      form.reset({
        name: currentDock.name,
        location: currentDock.location || '',
        status: currentDock.status,
        maxVessels: currentDock.maxVessels,
        maxDraft: currentDock.maxDraft || 0,
        length: currentDock.length || 0,
        description: currentDock.description || '',
      });
    } else {
      form.reset({
        name: '',
        location: '',
        status: 'available',
        maxVessels: undefined,
        maxDraft: 0,
        length: 0,
        description: '',
      });
    }
  }, [currentDock, form]);

  useEffect(() => {
    fetchDocks();
  }, []);

  const fetchDocks = async () => {
    try {
      setLoading(true);
      const response = await dockService.getDocks();
      setDocks(response);
    } catch (error) {
      console.error('Error fetching docks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch docks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dock?')) {
      try {
        await dockService.deleteDock(id);
        toast({
          title: 'Success',
          description: 'Dock deleted successfully',
        });
        fetchDocks();
      } catch (error) {
        console.error('Error deleting dock:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete dock. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (dock: Dock) => {
    setCurrentDock(dock);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentDock(null);
    setIsDialogOpen(true);
  };

  const onSubmit = async (formData: DockFormValues) => {
    try {
      // Create the dock data with correct types
      const dockData = {
        name: formData.name,
        location: formData.location,
        status: formData.status,
        maxVessels: formData.maxVessels,
        maxDraft: formData.maxDraft,
        length: formData.length,
        description: formData.description,
      };

      if (currentDock) {
        // Update existing dock
        await dockService.updateDock(currentDock._id, dockData);
        toast({
          title: 'Success',
          description: 'Dock updated successfully',
        });
      } else {
        // Create new dock
        await dockService.createDock(dockData);
        toast({
          title: 'Success',
          description: 'Dock created successfully',
        });
      }
      setIsDialogOpen(false);
      fetchDocks();
    } catch (error) {
      console.error('Error saving dock:', error);
      toast({
        title: 'Error',
        description: `Failed to ${currentDock ? 'update' : 'create'} dock. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const filteredDocks = docks.filter(dock =>
    dock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dock.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Docks</h1>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Dock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Docks List</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search docks..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Max Vessels</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocks.length > 0 ? (
                  filteredDocks.map((dock) => (
                    <TableRow key={dock._id}>
                      <TableCell className="font-medium">{dock.name}</TableCell>
                      <TableCell>{dock.location || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          dock.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dock.status}
                        </span>
                      </TableCell>
                      <TableCell>{dock.maxVessels || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(dock)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(dock._id)}
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No matching docks found' : 'No docks available'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dock Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentDock ? 'Edit Dock' : 'Add New Dock'}</DialogTitle>
            <DialogDescription>
              {currentDock ? 'Update the dock details below.' : 'Fill in the details to add a new dock.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dock Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter dock name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxVessels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Vessels</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="Enter maximum number of vessels" 
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
                name="maxDraft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Draft (meters)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        placeholder="Enter maximum draft in meters" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (meters)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0.1"
                        placeholder="Enter length in meters" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter description (optional)" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {currentDock ? 'Update Dock' : 'Add Dock'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
