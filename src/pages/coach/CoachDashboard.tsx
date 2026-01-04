import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingSessionCard } from '@/components/dashboard/UpcomingSessionCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Users, Star, TrendingUp, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SessionDto, ReviewDto } from '@/types';
import { format } from 'date-fns';

// Mock data
const mockStats = {
  totalSessions: 156,
  upcomingSessions: 12,
  totalStudents: 89,
  averageRating: 4.8,
};

const mockTodaySessions: SessionDto[] = [
  {
    id: 's1',
    classTypeId: 'ct1',
    classTypeName: 'HIIT Training',
    coachId: 'c1',
    coachName: 'Mike Johnson',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    capacity: 20,
    enrolledCount: 18,
    status: 'Scheduled',
    location: 'Studio A',
  },
  {
    id: 's2',
    classTypeId: 'ct1',
    classTypeName: 'Strength Training',
    coachId: 'c1',
    coachName: 'Mike Johnson',
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    capacity: 15,
    enrolledCount: 12,
    status: 'Scheduled',
    location: 'Weight Room',
  },
];

const mockRecentReviews: ReviewDto[] = [
  {
    id: '1',
    memberId: 'm1',
    memberName: 'Sarah Johnson',
    memberProfilePictureUrl: '',
    coachId: 'c1',
    rating: 5,
    comment: 'Amazing session! Mike really pushes you to your limits but in a supportive way.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    memberId: 'm2',
    memberName: 'David Chen',
    memberProfilePictureUrl: '',
    coachId: 'c1',
    rating: 5,
    comment: 'Best HIIT class I\'ve ever taken. Highly recommend!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    memberId: 'm3',
    memberName: 'Emily Brown',
    memberProfilePictureUrl: '',
    coachId: 'c1',
    rating: 4,
    comment: 'Great workout, learned a lot of new techniques.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
        }`}
      />
    ))}
  </div>
);

export default function CoachDashboard() {
  return (
    <DashboardLayout role="Coach">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your sessions and track performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Sessions"
            value={mockStats.totalSessions}
            icon={<Calendar className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Upcoming Sessions"
            value={mockStats.upcomingSessions}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Students"
            value={mockStats.totalStudents}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Average Rating"
            value={mockStats.averageRating}
            icon={<Star className="h-6 w-6" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/coach/sessions" className="flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTodaySessions.length > 0 ? (
                mockTodaySessions.map((session) => (
                  <UpcomingSessionCard
                    key={session.id}
                    session={session}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sessions scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/coach/reviews" className="flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.memberProfilePictureUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.memberName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{review.memberName}</span>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/coach/sessions">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">My Sessions</h3>
                  <p className="text-sm text-muted-foreground">View and manage your scheduled sessions</p>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/coach/attendance">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Take Attendance</h3>
                  <p className="text-sm text-muted-foreground">Mark attendance for your sessions</p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
