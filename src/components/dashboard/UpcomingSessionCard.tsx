import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { SessionDto } from '@/types';

const safeParseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  if (!dateStr.includes('Z') && !dateStr.includes('+')) {
    return new Date(dateStr + 'Z');
  }
  return new Date(dateStr);
};

interface UpcomingSessionCardProps {
  session: SessionDto;
  showBookButton?: boolean;
  showCancelButton?: boolean;
  onBook?: () => void;
  onCancel?: () => void;
}

export function UpcomingSessionCard({
  session,
  showBookButton,
  showCancelButton,
  onBook,
  onCancel,
}: UpcomingSessionCardProps) {
  const startTime = safeParseDate(session.startTime);
  const endTime = safeParseDate(session.endTime);
  const spotsLeft = session.capacity - (session.bookingsCount || 0);
  const isFull = spotsLeft <= 0;

  const getStatus = () => {
    const now = new Date();
    if (now > endTime) return "Completed";
    if (now >= startTime && now <= endTime) return "Active";
    if (isFull) return "Full";
    return "Scheduled";
  };

  const status = getStatus();

  return (
    <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{session.sessionName || session.classTypeName}</h3>
            <Badge variant={status === 'Active' ? 'default' : status === 'Full' ? 'destructive' : 'secondary'}>
              {status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{format(startTime, 'EEE, MMM d')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>
                {format(startTime, 'hh:mm a')} - {format(endTime, 'hh:mm a')}
                {endTime.getDate() !== startTime.getDate() && ` (${format(endTime, 'MMM d')})`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{(session as any).bookingsCount || 0}/{session.capacity} enrolled</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Coach: <span className="text-foreground font-medium">{session.coachName}</span>
          </p>

        </div>

        <div className="flex flex-col gap-2">
          {showBookButton && !isFull && (
            <Button size="sm" onClick={onBook}>
              Book Now
            </Button>
          )}
          {showBookButton && isFull && (
            <Badge variant="destructive">Full</Badge>
          )}
          {showCancelButton && (
            <Button size="sm" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
