import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MoreHorizontal, Eye, Edit, Trash2, Plus, Star, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { coachProfilesApi, usersApi, feedbackApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';


// Mock data removed


export default function AdminCoaches() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  // 1. Fetch Coach Profiles
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useApi(
    () => coachProfilesApi.getAll()
  );

  // 2. Fetch Users (to get email/phone/role)
  const { data: users, isLoading: usersLoading, error: usersError } = useApi(
    () => usersApi.getAll()
  );

  // 3. Fetch all feedbacks to calculate ratings
  const { data: allFeedbacks, isLoading: feedbackLoading } = useApi(
    () => feedbackApi.getAll()
  );

  const isLoading = profilesLoading || usersLoading || feedbackLoading;
  const error = profilesError || usersError;

  // 4. Join users (Filtered by Role) with optional profiles and calculate ratings
  const coachUsers = users?.filter(u => u.role === 'Coach') || [];

  const mergedCoaches = coachUsers.map(user => {
    const profile = profiles?.find(p => p.userName === user.userName);
    
    // Calculate rating for this specific coach
    const coachFeedbacks = allFeedbacks?.filter(f => f.coachId === profile?.id) || [];
    const avgRating = coachFeedbacks.length > 0
      ? Number((coachFeedbacks.reduce((sum, f) => sum + f.rating, 0) / coachFeedbacks.length).toFixed(1))
      : 0;

    return {
      id: profile?.id || user.id,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber || 'No phone',
      fullName: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : (profile?.userName || user.userName),
      specialization: profile?.specialization || 'New Coach',
      bio: profile?.bio || 'No biography yet',
      isActive: true, // Backend doesn't have active status yet
      averageRating: avgRating,
      totalReviews: coachFeedbacks.length,
      totalSessions: profile?.sessionsCount || 0
    };
  });


  const filteredCoaches = mergedCoaches.filter(
    (coach) =>
      coach.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardLayout role="Admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading coaches..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="Admin">
        <ErrorAlert error={error} title="Failed to load coaches" />
      </DashboardLayout>
    );
  }

  const handleAddCoach = () => {
    toast({
      title: 'Coach Added',
      description: 'New coach has been added successfully.',
    });
    setDialogOpen(false);
  };

  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Coaches</h1>
            <p className="text-muted-foreground mt-1">Manage your coaching staff</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Coach
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Coach</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input placeholder="e.g., HIIT & Strength" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea placeholder="Brief description..." rows={3} />
                </div>
                <Button onClick={handleAddCoach} className="w-full">
                  Add Coach
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coach</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map((coach) => (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {coach.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{coach.fullName}</p>
                            <p className="text-sm text-muted-foreground">{coach.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{coach.specialization}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{coach.averageRating}</span>
                          <span className="text-muted-foreground text-sm">({coach.totalReviews})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{coach.totalSessions}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coach.isActive ? 'default' : 'secondary'}>
                          {coach.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
