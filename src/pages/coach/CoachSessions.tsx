import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { SessionResponseDto } from '@/types';
import { sessionsApi, coachProfilesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
};

const getSessionStatus = (session: SessionResponseDto) => {
  const now = new Date();
  const start = safeParseDate(session.startTime);
  const end = safeParseDate(session.endTime);

  if (now < start) return 'Scheduled';
  if (now >= start && now <= end) return 'InProgress';
  return 'Completed';
};

export default function CoachSessions() {
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSession, setSelectedSession] = useState<SessionResponseDto | null>(null);

  // Fetch coach profile
  const { data: coachProfile, isLoading: profileLoading, error: profileError } = useApi(
    () => coachProfilesApi.getMyProfile()
  );

  // Fetch all sessions
  const { data: allSessions, isLoading: sessionsLoading, error: sessionsError } = useApi(
    () => sessionsApi.getAll()
  );

  const isLoading = profileLoading || sessionsLoading;
  const error = profileError || sessionsError;

  // Filter sessions for this coach
  const sessions = useMemo(() => {
    if (!allSessions || !coachProfile) return [];
    return allSessions.filter(s => s.coachId === coachProfile.id);
  }, [allSessions, coachProfile]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const upcomingSessions = sessions.filter(
    (s) => safeParseDate(s.endTime) >= new Date()
  ).sort((a, b) => safeParseDate(a.startTime).getTime() - safeParseDate(b.startTime).getTime());

  const pastSessions = sessions.filter(
    (s) => safeParseDate(s.endTime) < new Date()
  ).sort((a, b) => safeParseDate(b.startTime).getTime() - safeParseDate(a.startTime).getTime());

  if (isLoading && !coachProfile) {
    return (
      <DashboardLayout role="Coach">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="جاري تحميل الجلسات..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="Coach">
        <ErrorAlert 
          title="خطأ في تحميل البيانات"
          error={error}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Coach">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Sessions</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your scheduled sessions {coachProfile ? `(${coachProfile.userName})` : ''}
          </p>
        </div>

        {/* Week Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[160px] text-center">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const sessionsOnDay = sessions.filter((s) =>
                  isSameDay(new Date(s.startTime), day)
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={`p-3 rounded-xl text-center ${
                      isToday ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/30'
                    }`}
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg font-bold text-foreground">{format(day, 'd')}</div>
                    {sessionsOnDay.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {sessionsOnDay.map((session) => (
                          <div
                            key={session.id}
                            className="text-xs p-1.5 rounded bg-primary/20 text-primary truncate"
                            title={session.sessionName || session.classTypeName}
                          >
                            {format(safeParseDate(session.startTime), 'hh:mm a')}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingSessions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastSessions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {upcomingSessions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No upcoming sessions scheduled.
                    </div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{session.sessionName || session.classTypeName}</h3>
                              <Badge>{getSessionStatus(session)}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{format(safeParseDate(session.startTime), 'EEE, MMM d')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(safeParseDate(session.startTime), 'hh:mm a')} -{' '}
                                  {format(safeParseDate(session.endTime), 'hh:mm a')}
                                  {safeParseDate(session.endTime).getDate() !== safeParseDate(session.startTime).getDate() && 
                                    ` (${format(safeParseDate(session.endTime), 'MMM d')})`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{session.bookingsCount}/{session.capacity} enrolled</span>
                              </div>
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedSession(session)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Attendees
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enrolled Members - {session.sessionName || session.classTypeName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3 mt-4">
                                {session.bookings && session.bookings.length > 0 ? (
                                  session.bookings.map((booking) => (
                                    <div
                                      key={booking.id}
                                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                                    >
                                      <div>
                                        <p className="font-medium text-foreground">{booking.memberName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Booked at: {format(new Date(booking.bookingTime), 'MMM d, h:mm a')}
                                        </p>
                                      </div>
                                      <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                                        {booking.status}
                                      </Badge>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-center text-muted-foreground py-4">No members enrolled yet.</p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {pastSessions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No past sessions found.
                    </div>
                  ) : (
                    pastSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 hover:bg-muted/30 transition-colors opacity-70"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{session.sessionName || session.classTypeName}</h3>
                              <Badge variant="secondary">{getSessionStatus(session)}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(session.startTime), 'EEE, MMM d')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(new Date(session.startTime), 'h:mm a')} -{' '}
                                  {format(new Date(session.endTime), 'h:mm a')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{session.bookingsCount}/{session.capacity} attended</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
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
