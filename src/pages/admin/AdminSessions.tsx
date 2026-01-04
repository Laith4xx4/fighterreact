import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, MoreHorizontal, Eye, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { 
  SessionResponseDto, 
  ClassTypeResponseDto, 
  CoachProfileResponseDto,
  CreateSessionDto 
} from "@/types";
import { sessionsApi, classTypesApi, coachProfilesApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  // If no timezone info, assume UTC from server
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
};

export default function AdminSessions() {
  const [sessions, setSessions] = useState<SessionResponseDto[]>([]);
  const [classTypes, setClassTypes] = useState<ClassTypeResponseDto[]>([]);
  const [coaches, setCoaches] = useState<CoachProfileResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Note: Backend requires CoachId, ClassTypeId, StartTime, EndTime, Capacity, SessionName
  const [formData, setFormData] = useState<Partial<CreateSessionDto>>({
    capacity: 20,
    sessionName: ""
  });
  
  // Auxiliary state for date/time strings to handle form inputs easier
  const [dateStr, setDateStr] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, classTypesData, coachesData] = await Promise.all([
        sessionsApi.getAll(),
        classTypesApi.getAll(),
        coachProfilesApi.getAll()
      ]);
      setSessions(sessionsData);
      setClassTypes(classTypesData);
      setCoaches(coachesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (session: SessionResponseDto) => {
    const now = new Date();
    const start = safeParseDate(session.startTime);
    const end = safeParseDate(session.endTime);

    if (now > end) return "secondary"; // Completed
    if (now >= start && now <= end) return "success"; // Active
    if (session.bookingsCount >= session.capacity) return "destructive"; // Full
    return "default"; // Scheduled
  };

  const getStatusText = (session: SessionResponseDto) => {
    const now = new Date();
    const start = safeParseDate(session.startTime);
    const end = safeParseDate(session.endTime);

    if (now > end) return "Completed";
    if (now >= start && now <= end) return "In Progress";
    if (session.bookingsCount >= session.capacity) return "Full";
    return "Scheduled";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSession = async () => {
    if (!formData.sessionName || !formData.classTypeId || !formData.coachId || !formData.capacity || !dateStr || !startTimeStr || !endTimeStr) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Construct Date objects
      let startDateTime = new Date(`${dateStr}T${startTimeStr}`);
      let endDateTime = new Date(`${dateStr}T${endTimeStr}`);

      // Handle midnight crossing
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      const createDto: CreateSessionDto = {
        sessionName: formData.sessionName,
        classTypeId: formData.classTypeId,
        coachId: formData.coachId,
        capacity: Number(formData.capacity),
        description: formData.description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      await sessionsApi.create(createDto);
      
      toast({
        title: "Success",
        description: "Session created successfully",
      });
      
      setIsAddDialogOpen(false);
      fetchData();
      
      // Reset form
      setFormData({ capacity: 20, sessionName: "" });
      setDateStr("");
      setStartTimeStr("");
      setEndTimeStr("");
      
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create session.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await sessionsApi.delete(id);
      toast({ title: "Session deleted" });
      fetchData();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete session", 
        variant: "destructive" 
      });
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = 
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.coachName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    // Simple status filter logic mapping
    const status = getStatusText(session);
    if (statusFilter === "active") return matchesSearch && status === "In Progress";
    if (statusFilter === "upcoming") return matchesSearch && status === "Scheduled";
    if (statusFilter === "completed") return matchesSearch && status === "Completed";
    
    return matchesSearch;
  });

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sessions Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage training sessions</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
                <DialogDescription>
                  Schedule a new training session.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    name="sessionName"
                    placeholder="e.g. Morning HIIT"
                    value={formData.sessionName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Class Type</Label>
                    <Select 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, classTypeId: Number(val) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {classTypes.map(type => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Coach</Label>
                    <Select
                      onValueChange={(val) => setFormData(prev => ({ ...prev, coachId: Number(val) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select coach" />
                      </SelectTrigger>
                      <SelectContent>
                        {coaches.map(coach => (
                          <SelectItem key={coach.id} value={coach.id.toString()}>
                            {coach.userName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input 
                      type="time" 
                      value={startTimeStr}
                      onChange={(e) => setStartTimeStr(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input 
                      type="time" 
                      value={endTimeStr}
                      onChange={(e) => setEndTimeStr(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input // Or Textarea if available
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSession} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>View and manage all scheduled sessions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    className="pl-8 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
               <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Name</TableHead>
                    <TableHead>Coach</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.sessionName}</TableCell>
                        <TableCell>{session.coachName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{format(safeParseDate(session.startTime), 'MMM d, yyyy')}</span>
                            <span className="text-muted-foreground text-xs">
                              {format(safeParseDate(session.startTime), 'hh:mm a')} - {format(safeParseDate(session.endTime), 'hh:mm a')}
                              {safeParseDate(session.endTime).getDate() !== safeParseDate(session.startTime).getDate() && 
                                ` (${format(safeParseDate(session.endTime), 'MMM d')})`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.bookingsCount} / {session.capacity}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(session) as any}>
                            {getStatusText(session)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
