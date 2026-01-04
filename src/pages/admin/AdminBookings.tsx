import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { BookingDto, SessionDto, BookingStatus } from '@/types';
import { useApi } from '@/hooks/useApi';
import { bookingsApi, sessionsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';


// Mock data removed


const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.Confirmed:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'Cancelled':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'default';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function AdminBookings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: rawBookings, isLoading: bookingsLoading, error: bookingsError } = useApi(
    () => bookingsApi.getAll()
  );

  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useApi(
    () => sessionsApi.getAll()
  );

  const isLoading = bookingsLoading || sessionsLoading;
  const error = bookingsError || sessionsError;

  const mergedBookings = rawBookings?.map(booking => {
    const session = sessions?.find(s => s.id === booking.sessionId);
    return {
      ...booking,
      session: session ? {
        classTypeName: session.classTypeName,
        coachName: session.coachName,
        startTime: session.startTime,
        endTime: session.endTime
      } : {
        classTypeName: booking.sessionName || 'Unknown Session',
        coachName: 'Unknown Coach',
        startTime: booking.bookingTime,
        endTime: booking.bookingTime
      }
    };
  }) || [];

  const filteredBookings = mergedBookings.filter((booking) => {
    const matchesSearch =
      booking.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.session.classTypeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mergedBookings.length,
    confirmed: mergedBookings.filter((b) => b.status === BookingStatus.Confirmed).length,
    cancelled: mergedBookings.filter((b) => b.status === BookingStatus.Cancelled).length,
  };

  if (isLoading) {
    return (
      <DashboardLayout role="Admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading bookings..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="Admin">
        <ErrorAlert error={error} title="Failed to load bookings" />
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout role="Admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-1">View and manage all session bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Cancelled</p>
              <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by member or class..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Booked At</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{booking.memberName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{booking.session.classTypeName}</p>
                          <p className="text-sm text-muted-foreground">with {booking.session.coachName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{format(new Date(booking.session.startTime), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{format(new Date(booking.session.startTime), 'h:mm a')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {format(new Date(booking.bookingTime), 'MMM d, h:mm a')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.status) as any} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </Badge>
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
