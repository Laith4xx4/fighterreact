import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Target, TrendingUp, Calendar, Award, Zap } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Mock data
const mockProgress = {
  totalSessions: 45,
  attendedSessions: 42,
  currentStreak: 5,
  longestStreak: 12,
  memberSince: '2024-01-15',
  lastActivityDate: new Date().toISOString(),
};

const mockAttendanceStats = {
  totalBookings: 48,
  attendedCount: 42,
  cancelledCount: 4,
  noShowCount: 2,
  attendanceRate: 87.5,
};

const monthlyActivity = [
  { month: 'Jan', sessions: 8 },
  { month: 'Feb', sessions: 10 },
  { month: 'Mar', sessions: 7 },
  { month: 'Apr', sessions: 12 },
  { month: 'May', sessions: 9 },
  { month: 'Jun', sessions: 11 },
];

const weeklyProgress = [
  { week: 'Week 1', sessions: 3, goal: 4 },
  { week: 'Week 2', sessions: 4, goal: 4 },
  { week: 'Week 3', sessions: 2, goal: 4 },
  { week: 'Week 4', sessions: 5, goal: 4 },
];

const classBreakdown = [
  { name: 'HIIT Training', count: 15, color: 'hsl(var(--primary))' },
  { name: 'Yoga Flow', count: 12, color: 'hsl(var(--secondary))' },
  { name: 'Strength Training', count: 10, color: 'hsl(var(--accent))' },
  { name: 'Spin Class', count: 5, color: 'hsl(var(--muted))' },
];

const achievements = [
  { id: 1, title: 'First Session', description: 'Complete your first session', completed: true, icon: <Zap className="h-5 w-5" /> },
  { id: 2, title: '10 Sessions', description: 'Complete 10 sessions', completed: true, icon: <Award className="h-5 w-5" /> },
  { id: 3, title: 'Week Warrior', description: '7-day streak', completed: true, icon: <Flame className="h-5 w-5" /> },
  { id: 4, title: 'Month Master', description: '30-day streak', completed: false, icon: <Target className="h-5 w-5" /> },
  { id: 5, title: 'Century Club', description: 'Complete 100 sessions', completed: false, icon: <TrendingUp className="h-5 w-5" /> },
];

export default function MemberProgress() {
  const attendancePercentage = (mockProgress.attendedSessions / mockProgress.totalSessions) * 100;

  return (
    <DashboardLayout role="Member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Progress</h1>
          <p className="text-muted-foreground mt-1">Track your fitness journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Sessions Attended"
            value={mockProgress.attendedSessions}
            subtitle={`out of ${mockProgress.totalSessions} booked`}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Current Streak"
            value={`${mockProgress.currentStreak} days`}
            subtitle="Keep it going!"
            icon={<Flame className="h-6 w-6" />}
          />
          <StatsCard
            title="Longest Streak"
            value={`${mockProgress.longestStreak} days`}
            subtitle="Personal best"
            icon={<Award className="h-6 w-6" />}
          />
          <StatsCard
            title="Attendance Rate"
            value={`${mockAttendanceStats.attendanceRate}%`}
            icon={<Target className="h-6 w-6" />}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivity}>
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
                    <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
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
                      dataKey="sessions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="goal"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Breakdown & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Class Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Class Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {classBreakdown.map((cls) => {
                const percentage = (cls.count / mockProgress.attendedSessions) * 100;
                return (
                  <div key={cls.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{cls.name}</span>
                      <span className="text-sm text-muted-foreground">{cls.count} sessions</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-4 p-3 rounded-xl border ${
                      achievement.completed
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-border opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.completed
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.completed && (
                      <Badge variant="default">Unlocked</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
