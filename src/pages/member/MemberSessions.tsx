import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UpcomingSessionCard } from '@/components/dashboard/UpcomingSessionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { SessionDto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { sessionsApi, classTypesApi, bookingsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
};


// Mock data removed


export default function MemberSessions() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: allSessions, isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useApi(
    () => sessionsApi.getAll()
  );

  const { data: rawClassTypes } = useApi(
    () => classTypesApi.getAll()
  );

  const classTypeNames = ['All', ...(rawClassTypes?.map(ct => ct.name) || [])];

  const filteredSessions = allSessions?.filter((session) => {
    const matchesSearch =
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.classTypeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || session.classTypeName === selectedType;
    const matchesDate = selectedDate
      ? isSameDay(safeParseDate(session.startTime), selectedDate)
      : true;
    return matchesSearch && matchesType && matchesDate;
  }) || [];

  const handleBook = async (sessionId: number) => {
    try {
      await bookingsApi.bookSession(sessionId);
      toast({
        title: 'Session Booked!',
        description: 'Your booking has been confirmed.',
      });
      refetchSessions();
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: (error as Error).message || 'Failed to book session.',
        variant: 'destructive',
      });
    }
  };

  if (sessionsLoading) {
    return (
      <DashboardLayout role="Member">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading sessions..." />
        </div>
      </DashboardLayout>
    );
  }

  if (sessionsError) {
    return (
      <DashboardLayout role="Member">
        <ErrorAlert error={sessionsError} title="Failed to load sessions" />
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout role="Member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Sessions</h1>
          <p className="text-muted-foreground mt-1">Find and book your next class</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions or coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {classTypeNames.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedType === type ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Week Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Select Date</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)).map((day) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const sessionsOnDay = allSessions?.filter((s) =>
                  isSameDay(safeParseDate(s.startTime), day)
                ).length || 0;


                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : isToday
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="text-xs font-medium opacity-70">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">{format(day, 'd')}</div>
                    {sessionsOnDay > 0 && (
                      <div className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {sessionsOnDay} sessions
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Available Sessions
              {selectedDate && (
                <span className="font-normal text-muted-foreground ml-2">
                  on {format(selectedDate, 'EEEE, MMMM d')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <UpcomingSessionCard
                  key={session.id}
                  session={session}
                  showBookButton
                  onBook={() => handleBook(session.id)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sessions found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
