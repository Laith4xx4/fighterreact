import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { sessionsApi, bookingsApi } from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorAlert } from "@/components/ErrorAlert";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDuration(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return `${minutes} دقيقة`;
}

export default function Sessions() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingSessionId, setBookingSessionId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const { data: sessions, isLoading, error, refetch } = useApi(
    () => sessionsApi.getAll()
  );

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleBookSession = async (sessionId: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setBookingSessionId(sessionId);
      await bookingsApi.bookSession(sessionId);
      toast.success("تم حجز الجلسة بنجاح!");
      await refetch();
    } catch (error) {
      toast.error("فشل حجز الجلسة: " + (error as Error).message);
    } finally {
      setBookingSessionId(null);
    }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <LoadingSpinner size="lg" text="جاري تحميل الجلسات..." />
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-background py-24">
          <div className="container mx-auto px-4">
            <ErrorAlert error={error} title="خطأ في تحميل الجلسات" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Filter sessions for selected date
  const filteredSessions = sessions?.filter(session => 
    isSameDay(new Date(session.startTime), selectedDate)
  ) || [];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="bg-gradient-primary py-16 pt-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-4">
              جدول الحصص
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              تصفح جدولنا الأسبوعي واعثر على الصف المثالي لأهداف اللياقة البدنية الخاصة بك
            </p>
          </div>
        </section>

        {/* Week Selector */}
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                <span className="rotate-180">→</span>
              </Button>
              <h2 className="text-lg font-semibold">
                {format(weekStart, "d MMMM")} - {format(addDays(weekStart, 6), "d MMMM، yyyy")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                →
              </Button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-colors ${
                    isSameDay(day, selectedDate)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="text-xs font-medium opacity-70">{format(day, "EEE")}</div>
                  <div className="text-lg font-bold">{format(day, "d")}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Sessions List */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-4">
              {filteredSessions.length > 0 ? (
                filteredSessions.map((session, index) => {
                  const spotsLeft = session.capacity - session.bookingsCount;
                  const isFull = spotsLeft <= 0;
                  const userHasBooked = user && session.bookings?.some(b => b.memberId.toString() === user.id); // Note: verify ID types
                  
                  return (
                    <div
                      key={session.id}
                      className="group p-5 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Time Block */}
                      <div className="flex-shrink-0 text-center p-4 rounded-xl bg-primary text-primary-foreground min-w-[100px]">
                        <div className="text-2xl font-bold">
                          {formatTime(session.startTime).split(" ")[0]}
                        </div>
                        <div className="text-xs opacity-70">
                          {formatTime(session.startTime).split(" ")[1]}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg mb-1">
                          {session.sessionName || session.classTypeName}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-2">
                          مع {session.coachName}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getDuration(session.startTime, session.endTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {session.bookingsCount}/{session.capacity} محجوز
                          </span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-3">
                        {isFull ? (
                          <Badge variant="secondary">ممتلئ</Badge>
                        ) : (
                          <Badge variant="outline" className="border-success text-success">
                            {spotsLeft} {spotsLeft === 1 ? 'مكان متبقي' : 'أماكن متبقية'}
                          </Badge>
                        )}
                        <Button 
                          onClick={() => handleBookSession(session.id)}
                          disabled={isFull || bookingSessionId === session.id}
                        >
                          {bookingSessionId === session.id ? 'جاري الحجز...' : 'احجز الآن'}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد جلسات في هذا اليوم</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
