import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Dumbbell, Calendar, ClipboardList, TrendingUp, ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Mock data
const mockStats = {
  totalMembers: 245,
  totalCoaches: 12,
  totalSessions: 156,
  totalBookings: 1247,
  activeMembers: 189,
  upcomingSessions: 24,
  todaySessions: 8,
};

const memberGrowth = [
  { month: 'Jan', members: 180 },
  { month: 'Feb', members: 195 },
  { month: 'Mar', members: 210 },
  { month: 'Apr', members: 225 },
  { month: 'May', members: 238 },
  { month: 'Jun', members: 245 },
];

const bookingTrends = [
  { day: 'Mon', bookings: 45 },
  { day: 'Tue', bookings: 52 },
  { day: 'Wed', bookings: 48 },
  { day: 'Thu', bookings: 61 },
  { day: 'Fri', bookings: 55 },
  { day: 'Sat', bookings: 72 },
  { day: 'Sun', bookings: 38 },
];

const recentMembers = [
  { id: 'm1', name: 'Alex Rivera', email: 'alex@email.com', joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 'm2', name: 'Sarah Johnson', email: 'sarah@email.com', joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 'm3', name: 'David Chen', email: 'david@email.com', joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
];

const todaySessions = [
  { id: 's1', name: 'HIIT Training', coach: 'Mike Johnson', time: '09:00 AM', enrolled: 18, capacity: 20 },
  { id: 's2', name: 'Yoga Flow', coach: 'Sarah Williams', time: '10:30 AM', enrolled: 12, capacity: 15 },
  { id: 's3', name: 'Spin Class', coach: 'David Chen', time: '02:00 PM', enrolled: 20, capacity: 25 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="Admin">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your fitness center</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Members"
            value={mockStats.totalMembers}
            icon={<Users className="h-6 w-6" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Active Coaches"
            value={mockStats.totalCoaches}
            icon={<Dumbbell className="h-6 w-6" />}
          />
          <StatsCard
            title="Today's Sessions"
            value={mockStats.todaySessions}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Total Bookings"
            value={mockStats.totalBookings}
            icon={<ClipboardList className="h-6 w-6" />}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Growth */}
          <Card>
            <CardHeader>
              <CardTitle>Member Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memberGrowth}>
                    <defs>
                      <linearGradient id="memberGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="members"
                      stroke="hsl(var(--primary))"
                      fill="url(#memberGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Booking Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bookingTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Sessions & Recent Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Today's Sessions</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/sessions" className="flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{session.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.coach} • {session.time}
                      </p>
                    </div>
                    <Badge variant={session.enrolled >= session.capacity ? 'destructive' : 'secondary'}>
                      {session.enrolled}/{session.capacity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Members</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/members" className="flex items-center gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(member.joinedAt, 'MMM d')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/admin/members">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-foreground">Manage Members</h3>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/admin/coaches">
              <CardContent className="p-6 text-center">
                <Dumbbell className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-foreground">Manage Coaches</h3>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/admin/sessions">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-foreground">Manage Sessions</h3>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <Link to="/admin/bookings">
              <CardContent className="p-6 text-center">
                <ClipboardList className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="font-semibold text-foreground">View Bookings</h3>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
