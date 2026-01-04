import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ReviewDto } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useApi } from '@/hooks/useApi';
import { feedbackApi, coachProfilesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useEffect } from 'react';

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

export default function CoachReviews() {
  const { user } = useAuth();

  // 1. Get Coach Profile
  const { data: coachProfile, error: profileError, execute: fetchProfile } = useApi(
    () => coachProfilesApi.getMyProfile(),
    { autoFetch: true }
  );

  // 1.5 Auto-create profile if missing (404)
  useEffect(() => {
    if (profileError && profileError.message.includes('404')) {
      const createBasicProfile = async () => {
        try {
          await coachProfilesApi.create({
            userName: user?.userName || user?.email || "",
            bio: "Certified fitness coach.",
            specialization: "General Fitness",
            certifications: "Standard Certificate"
          });
          fetchProfile(); // Refetch after creation
        } catch (e) {
          console.error("Failed to auto-create coach profile", e);
        }
      };
      createBasicProfile();
    }
  }, [profileError, user, fetchProfile]);

  // 2. Get All Reviews
  const { data: allReviews } = useApi(
    () => feedbackApi.getAll(),
    { autoFetch: true }
  );

  // 3. Filter and Calculate Stats
  const { myReviews, stats, distribution } = useMemo(() => {
    const reviews = allReviews?.filter(r => r.coachId === coachProfile?.id) || [];
    
    const total = reviews.length;
    const avg = total > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0;
    
    // Calculate distribution safely
    const distMap = new Map<number, number>();
    [5, 4, 3, 2, 1].forEach(r => distMap.set(r, 0));
    
    reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (distMap.has(rounded)) {
        distMap.set(rounded, (distMap.get(rounded) || 0) + 1);
      }
    });

    const distArray = Array.from(distMap.entries()).map(([rating, count]) => ({
      rating: `${rating} stars`,
      count
    }));

    const fiveStarCount = distMap.get(5) || 0;
    const fiveStarPercentage = total > 0 ? Math.round((fiveStarCount / total) * 100) : 0;

    return {
      myReviews: reviews,
      stats: {
        total,
        average: avg.toFixed(1),
        fiveStarPercentage
      },
      distribution: distArray
    };
  }, [allReviews, coachProfile]);
  return (
    <DashboardLayout role="Coach">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
          <p className="text-muted-foreground mt-1">See what members are saying about your sessions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                <Star className="h-7 w-7 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-3xl font-bold text-foreground">{stats.average}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <Award className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">5-Star Reviews</p>
                <p className="text-3xl font-bold text-foreground">{stats.fiveStarPercentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="rating" type="category" stroke="hsl(var(--muted-foreground))" width={70} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.memberName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{review.memberName}</span>
                          <StarRating rating={review.rating} />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(review.timestamp), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comments}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
