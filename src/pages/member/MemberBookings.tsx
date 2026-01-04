import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { BookingResponseDto, BookingStatus } from '@/types';
import { bookingsApi, sessionsApi } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useToast } from '@/hooks/use-toast';


const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.Confirmed:
      return <Clock className="h-4 w-4" />;
    case BookingStatus.Cancelled:
      return <XCircle className="h-4 w-4" />;
    default:
      return <Calendar className="h-4 w-4" />;
  }
};

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.Confirmed:
      return 'default';
    case BookingStatus.Cancelled:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function MemberBookings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: rawBookings, isLoading: bookingsLoading, error: bookingsError, refetch } = useApi(
    () => bookingsApi.getMyBookings()
  );

  const { data: sessions, isLoading: sessionsLoading } = useApi(
    () => sessionsApi.getAll()
  );

  const isLoading = bookingsLoading || sessionsLoading;
  const error = bookingsError;

  const bookings = rawBookings?.map(booking => {
    const session = sessions?.find(s => s.id === booking.sessionId);
    return {
      ...booking,
      coachName: session?.coachName || 'Unknown Coach',
      sessionName: session?.sessionName || booking.sessionName || 'Session'
    };
  }) || [];

  const [cancellingId, setCancellingId] = useState<number | null>(null);


  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancellingId(bookingId);
      await bookingsApi.cancelBooking(bookingId);
      await bookingsApi.cancelBooking(bookingId);
      toast({
        title: 'تم الإلغاء',
        description: 'تم إلغاء الحجز بنجاح',
      });
      await refetch();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إلغاء الحجز: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {

      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="Member">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="جاري تحميل الحجوزات..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="Member">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">حجوزاتي</h1>
            <p className="text-muted-foreground mt-1">إدارة حجوزات الجلسات</p>
          </div>
          <ErrorAlert error={error} />
        </div>
      </DashboardLayout>
    );
  }

  const upcomingBookings = bookings?.filter(
    (b) => b.status === BookingStatus.Confirmed
  ) || [];
  
  const pastBookings = bookings?.filter(
    (b) => b.status === BookingStatus.Cancelled
  ) || [];

  return (
    <DashboardLayout role="Member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">حجوزاتي</h1>
          <p className="text-muted-foreground mt-1">إدارة حجوزات الجلسات</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              القادمة ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              السابقة ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الجلسات القادمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-lg">
                            {booking.sessionName || `جلسة #${booking.sessionId}`}
                          </h3>
                          <Badge variant={getStatusColor(booking.status) as any}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          رقم الحجز: {booking.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          المدرب: {booking.coachName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تاريخ الحجز: {format(new Date(booking.bookingTime), 'PPP')}
                        </p>

                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? 'جاري الإلغاء...' : 'إلغاء الحجز'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد حجوزات قادمة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>الجلسات السابقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pastBookings.length > 0 ? (
                    pastBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {booking.sessionName || `جلسة #${booking.sessionId}`}
                            </h3>
                            <Badge variant={getStatusColor(booking.status) as any}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(booking.status)}
                                {booking.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            المدرب: {booking.coachName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            تاريخ الحجز: {format(new Date(booking.bookingTime), 'PPP')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            رقم الحجز: {booking.id}
                          </p>

                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لا توجد حجوزات سابقة</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
