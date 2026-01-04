import { Link } from "react-router-dom";
import { Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with API data
const sessions = [
  {
    id: "1",
    classTypeName: "Strength Training",
    coachName: "Alex Johnson",
    startTime: "2024-01-15T09:00:00",
    endTime: "2024-01-15T10:00:00",
    capacity: 20,
    enrolledCount: 15,
    location: "Main Gym",
    status: "Scheduled",
  },
  {
    id: "2",
    classTypeName: "Morning Yoga",
    coachName: "Sarah Williams",
    startTime: "2024-01-15T07:00:00",
    endTime: "2024-01-15T08:00:00",
    capacity: 15,
    enrolledCount: 12,
    location: "Studio A",
    status: "Scheduled",
  },
  {
    id: "3",
    classTypeName: "HIIT Blast",
    coachName: "Mike Chen",
    startTime: "2024-01-15T18:00:00",
    endTime: "2024-01-15T18:45:00",
    capacity: 25,
    enrolledCount: 23,
    location: "Training Zone",
    status: "Scheduled",
  },
  {
    id: "4",
    classTypeName: "Cardio Dance",
    coachName: "Lisa Martinez",
    startTime: "2024-01-15T17:00:00",
    endTime: "2024-01-15T18:00:00",
    capacity: 30,
    enrolledCount: 18,
    location: "Studio B",
    status: "Scheduled",
  },
];

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDuration(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  return `${minutes} min`;
}

export function SessionsPreviewSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Upcoming <span className="text-gradient">Sessions</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Book your spot in our diverse range of classes designed for all fitness levels.
            </p>
          </div>
          <Button variant="ghost" asChild className="mt-4 md:mt-0">
            <Link to="/sessions">
              View Full Schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className="group p-5 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Time Block */}
              <div className="flex-shrink-0 text-center p-4 rounded-xl bg-primary text-primary-foreground min-w-[80px]">
                <div className="text-2xl font-bold">{formatTime(session.startTime).split(" ")[0]}</div>
                <div className="text-xs opacity-70">{formatTime(session.startTime).split(" ")[1]}</div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg mb-1 truncate">
                  {session.classTypeName}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">with {session.coachName}</p>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {getDuration(session.startTime, session.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {session.enrolledCount}/{session.capacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {session.location}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {session.enrolledCount >= session.capacity ? (
                  <Badge variant="secondary">Full</Badge>
                ) : (
                  <Badge variant="outline" className="border-success text-success">
                    {session.capacity - session.enrolledCount} spots
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
