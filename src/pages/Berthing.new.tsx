import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import * as Toast from '@radix-ui/react-toast';
import { X, Search, Plus, Clock, CheckCircle, XCircle, AlertCircle, Upload, Calendar as CalendarIcon } from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Services
import berthingService from '@/services/berthing.service';
import shipService from '@/services/ships.service';
import dockService from '@/services/dock.service';

// Types
interface Berthing {
  _id: string;
  ship: {
    _id: string;
    name: string;
    imoNumber: string;
  };
  dock: {
    _id: string;
    name: string;
  };
  arrivalDate: string;
  departureDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  cargoDetails: Array<{
    description: string;
    type: string;
    weight: string;
    quantity: number;
    unit: string;
    notes: string;
  }>;
  documents: Array<{
    filename: string;
    path: string;
    originalname: string;
    mimetype: string;
    size: number;
  }>;
  specialRequirements: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const Berthing = () => {
  const { user } = useAuth();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [berthings, setBerthings] = useState<Berthing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    ship: '',
    dock: '',
    arrivalDate: { date: undefined as Date | undefined, time: '08:00' },
    departureDate: { date: undefined as Date | undefined, time: '17:00' },
    cargoDetails: [{
      description: '',
      type: '',
      weight: '',
      quantity: 1,
      unit: 'TEU',
      notes: ''
    }],
    documents: [] as File[],
    specialRequirements: ''
  });
  
  // Data for dropdowns
  const [ships, setShips] = useState<Array<{_id: string, name: string, imoNumber: string}>>([]);
  const [docks, setDocks] = useState<Array<{_id: string, name: string, status: string}>>([]);
  
  // Toast state
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ 
    title: '', 
    description: '' 
  });

  // Fetch berthings on component mount
  useEffect(() => {
    const fetchBerthings = async () => {
      try {
        setIsLoading(true);
        const response = await berthingService.getBerthings();
        console.log('here',response)
        setBerthings(response || []);
      } catch (err) {
        console.error('Error fetching berthings:', err);
        showToast('Error', 'Failed to load berthing data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerthings();
  }, []);

  // Fetch ships and docks when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isDialogOpen) {
          const [shipsRes, docksRes] = await Promise.all([
            shipService.getAvailableShips(),
            dockService.getAvailableDocks()
          ]);
          setShips(shipsRes);
          setDocks(docksRes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        showToast('Error', 'Failed to load required data');
      }
    };

    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);

  // Helper functions
  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setOpen(true);
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        options.push({ label: time, value: time });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return format(date, 'PPP');
  };

  const addCargoItem = () => {
    setFormData(prev => ({
      ...prev,
      cargoDetails: [
        ...prev.cargoDetails,
        { description: '', type: '', weight: '', quantity: 1, unit: 'TEU', notes: '' }
      ]
    }));
  };
  
  const removeCargoItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargoDetails: prev.cargoDetails.filter((_, i) => i !== index)
    }));
  };
  
  const handleCargoChange = (index: number, field: string, value: any) => {
    const updatedCargo = [...formData.cargoDetails];
    updatedCargo[index] = { ...updatedCargo[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      cargoDetails: updatedCargo
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.arrivalDate.date || !formData.departureDate.date) {
      showToast('Error', 'Please select both arrival and departure dates.');
      return;
    }
    
    if (formData.departureDate.date <= formData.arrivalDate.date) {
      showToast('Error', 'Departure date must be after arrival date.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const formatForBackend = (date: Date) => format(date, 'yyyy-MM-dd');
      const arrivalDateStr = formatForBackend(formData.arrivalDate.date);
      const departureDateStr = formatForBackend(formData.departureDate.date);
      
      const arrivalDateTime = `${arrivalDateStr}T${formData.arrivalDate.time}:00.000Z`;
      const departureDateTime = `${departureDateStr}T${formData.departureDate.time}:00.000Z`;
      
      const formDataToSend = new FormData();
      const berthingData = {
        ship: formData.ship,
        dock: formData.dock,
        arrivalDate: arrivalDateTime,
        departureDate: departureDateTime,
        specialRequirements: formData.specialRequirements || '',
        cargoDetails: formData.cargoDetails,
        createdBy: user?.id || ''
      };

      // Add all fields to formData
      Object.entries(berthingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });
      
      // Add files
      formData.documents.forEach(file => {
        formDataToSend.append('documents', file);
      });
      
      await berthingService.createBerthing(formDataToSend);
      
      // Refresh the list
      const response = await berthingService.getBerthings();
      setBerthings(response.data || []);
      
      // Reset form and close dialog
      setFormData({
        ship: '',
        dock: '',
        arrivalDate: { date: undefined, time: '08:00' },
        departureDate: { date: undefined, time: '17:00' },
        cargoDetails: [{
          description: '',
          type: '',
          weight: '',
          quantity: 1,
          unit: 'TEU',
          notes: ''
        }],
        documents: [],
        specialRequirements: ''
      });
      
      setIsDialogOpen(false);
      showToast('Success', 'Berthing request submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting berthing request:', error);
      showToast('Error', 'Failed to submit berthing request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of your component JSX ...
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Berthing Management</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Berthing
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search berthings..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div>Loading berthings...</div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid gap-4">
              {berthings.map(berthing => (
                <BerthingCard key={berthing._id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>
          
          {/* Other tabs content */}
          
        </Tabs>
      )}
      
      {/* Add Berthing Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Berthing Request</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields here */}
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Toast */}
      <Toast.Provider>
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className="bg-background border rounded-md shadow-lg p-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="flex flex-col space-y-2">
            <Toast.Title className="text-sm font-semibold">
              {toastMessage.title}
            </Toast.Title>
            <Toast.Description className="text-sm text-muted-foreground">
              {toastMessage.description}
            </Toast.Description>
          </div>
          <Toast.Close className="absolute right-2 top-2">
            <X className="h-4 w-4" />
          </Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-4 gap-2 w-full max-w-sm m-0 list-none z-[2147483647] outline-none" />
      </Toast.Provider>
    </div>
  );
};

export default Berthing;
