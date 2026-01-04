import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Users, CheckCircle, XCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { SessionDto, AttendanceStatus, BookingStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useApi } from '@/hooks/useApi';
import { coachProfilesApi, sessionsApi, bookingsApi, attendanceApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
};


// Mock data removed


const getSessionStatus = (session: SessionDto) => {
  const now = new Date();
  const start = safeParseDate(session.startTime);
  const end = safeParseDate(session.endTime);

  if (now < start) return 'Scheduled';
  if (now >= start && now <= end) return 'InProgress';
  return 'Completed';
};

export default function CoachAttendance() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [attendanceList, setAttendanceList] = useState<Record<number, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch coach profile
  const { data: coachProfile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useApi(
    () => coachProfilesApi.getMyProfile()
  );

  // Auto-create coach profile if missing
  useEffect(() => {
    const autoCreateProfile = async () => {
      if (profileError && profileError.message.includes('404')) {
        try {
          await coachProfilesApi.create({
            userName: user?.userName || 'coach',
            bio: 'New Coach Profile',
            specialization: 'General Training'
          });
          refetchProfile();
        } catch (err) {
          console.error('Failed to auto-create coach profile:', err);
        }
      }
    };
    autoCreateProfile();
  }, [profileError, user, refetchProfile]);

  // Fetch all sessions
  const { data: allSessions, isLoading: sessionsLoading } = useApi(
    () => sessionsApi.getAll()
  );

  // Fetch all bookings and attendances
  const { data: allBookings, isLoading: bookingsLoading, refetch: refetchBookings } = useApi(
    () => bookingsApi.getAll()
  );
  const { data: allAttendances, isLoading: attendanceLoading, refetch: refetchAttendances } = useApi(
    () => attendanceApi.getAll()
  );

  const isLoading = profileLoading || sessionsLoading || bookingsLoading || attendanceLoading;

  // Filter coach sessions
  const coachSessions = allSessions?.filter(s => s.coachId === coachProfile?.id) || [];

  // Set initial selected session if not set
  useEffect(() => {
    if (coachSessions.length > 0 && !selectedSession) {
      setSelectedSession(coachSessions[0].id.toString());
    }
  }, [coachSessions, selectedSession]);

  const selectedSessionData = coachSessions.find((s) => s.id.toString() === selectedSession);

  // Get attendees for selected session
  const sessionAttendees = allBookings?.filter(b => 
    b.sessionId.toString() === selectedSession && b.status === BookingStatus.Confirmed
  ) || [];

  // Initialize attendance list when session attendees or attendances change
  useEffect(() => {
    if (selectedSession && sessionAttendees.length > 0) {
      const initialAttendance: Record<number, boolean> = {};
      sessionAttendees.forEach(attendee => {
        const isPresent = allAttendances?.some(a => 
          a.sessionId.toString() === selectedSession && a.memberId === attendee.memberId
        );
        initialAttendance[attendee.memberId] = !!isPresent;
      });
      setAttendanceList(initialAttendance);
    }
  }, [selectedSession, sessionAttendees.length, allAttendances]);

  const handleAttendanceChange = (memberId: number, attended: boolean) => {
    setAttendanceList((prev) => ({ ...prev, [memberId]: attended }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceList };
    sessionAttendees.forEach(a => updated[a.memberId] = true);
    setAttendanceList(updated);
  };

  const handleMarkAllAbsent = () => {
    const updated = { ...attendanceList };
    sessionAttendees.forEach(a => updated[a.memberId] = false);
    setAttendanceList(updated);
  };

  const handleSaveAttendance = async () => {
    try {
      setIsSaving(true);
      const sessionId = Number(selectedSession);
      
      const promises = sessionAttendees.map(async (attendee) => {
        const isMarkedPresent = attendanceList[attendee.memberId];
        const existingRecord = allAttendances?.find(a => 
          a.sessionId === sessionId && a.memberId === attendee.memberId
        );

        if (isMarkedPresent && !existingRecord) {
          // Create new record
          return attendanceApi.create({
            sessionId,
            memberId: attendee.memberId,
            status: AttendanceStatus.Present
          });
        } else if (!isMarkedPresent && existingRecord) {
          // Delete existing record
          return attendanceApi.delete(existingRecord.id);
        }
      });

      await Promise.all(promises);
      toast({
        title: 'تم حفظ التحضير',
        description: 'تم تسجيل الحضور والغياب بنجاح.',
      });
      refetchAttendances();
    } catch (error) {
      toast({
        title: 'خطأ في الحفظ',
        description: (error as Error).message || 'فشل في حفظ التحضير.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendanceList).filter(Boolean).length;
  const totalCount = sessionAttendees.length;

  if (isLoading && !coachProfile) {
    return (
      <DashboardLayout role="Coach">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="جاري تحميل البيانات..." />
        </div>
      </DashboardLayout>
    );
  }


  return (
    <DashboardLayout role="Coach">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Take Attendance</h1>
          <p className="text-muted-foreground mt-1">Mark attendance for your sessions</p>
        </div>

        {/* Session Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر جلسة" />
              </SelectTrigger>
              <SelectContent>
                {coachSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.sessionName || session.classTypeName}</span>
                      <span className="text-muted-foreground">
                        - {format(safeParseDate(session.startTime), 'hh:mm a')}
                      </span>
                      <Badge variant={getSessionStatus(session) === 'InProgress' ? 'default' : 'secondary'}>
                        {getSessionStatus(session)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            {selectedSessionData && (
              <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(selectedSessionData.startTime), 'EEEE, MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(selectedSessionData.startTime), 'h:mm a')} -{' '}
                      {format(new Date(selectedSessionData.endTime), 'h:mm a')}
                    </span>
                  </div>
 
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance List */}
        {selectedSessionData && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Attendance List</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {presentCount} of {totalCount} present
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark All Present
                </Button>
                <Button variant="outline" size="sm" onClick={handleMarkAllAbsent}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Mark All Absent
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessionAttendees.map((attendee) => (
                  <div
                    key={attendee.memberId}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                      attendanceList[attendee.memberId]
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        id={attendee.memberId.toString()}
                        checked={attendanceList[attendee.memberId]}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(attendee.memberId, checked as boolean)
                        }
                      />
                      <div>
                        <label
                          htmlFor={attendee.memberId.toString()}
                          className="font-medium text-foreground cursor-pointer"
                        >
                          {attendee.memberName}
                        </label>
                        <p className="text-sm text-muted-foreground">رقم العضوية: {attendee.memberId}</p>
                      </div>
                    </div>
                    <Badge variant={attendanceList[attendee.memberId] ? 'default' : 'secondary'}>
                      {attendanceList[attendee.memberId] ? 'حاضر' : 'غائب'}
                    </Badge>
                  </div>
                ))}

                {sessionAttendees.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد أعضاء مسجلين في هذه الجلسة
                  </div>
                )}
              </div>


              <div className="mt-6 flex justify-end">
                <Button onClick={handleSaveAttendance} disabled={isSaving || sessionAttendees.length === 0}>
                  {isSaving ? (
                    'جاري الحفظ...'
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      حفظ التحضير
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
