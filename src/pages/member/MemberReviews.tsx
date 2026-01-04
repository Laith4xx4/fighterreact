import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useApi } from '@/hooks/useApi';
import { feedbackApi, memberProfilesApi, bookingsApi, sessionsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Initial mock data removed - now using real data from API




const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (rating: number) => void; interactive?: boolean }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hovered || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function MemberReviews() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: memberProfile, error: profileError, execute: fetchProfile } = useApi(
    () => memberProfilesApi.getMyProfile(),
    { autoFetch: true }
  );

  // 1.5 Auto-create profile if missing (404)
  useEffect(() => {
    if (profileError && profileError.message.includes('404')) {
      const createBasicProfile = async () => {
        try {
          await memberProfilesApi.create({
            userName: user?.userName || user?.email || "",
            firstName: user?.firstName,
            lastName: user?.lastName,
            joinDate: new Date().toISOString()
          });
          fetchProfile(); // Refetch after creation
        } catch (e) {
          console.error("Failed to auto-create member profile", e);
        }
      };
      createBasicProfile();
    }
  }, [profileError, user, fetchProfile]);

  // 2. Get All Reviews (Filter client-side for now)
  const { data: allReviews, refetch: refetchReviews } = useApi(
    () => feedbackApi.getAll(),
    { autoFetch: true }
  );

  // 3. Get My Bookings
  const { data: myBookings } = useApi(
    () => bookingsApi.getMyBookings(),
    { autoFetch: true }
  );

  // 4. Get All Sessions (to get CoachId and SessionName)
  const { data: allSessions } = useApi(
    () => sessionsApi.getAll(),
    { autoFetch: true }
  );

  // 5. Calculate Pending Reviews dynamically
  const pendingReviews = myBookings?.filter(booking => {
    // A booking is pending if it has no matching review yet
    const hasReview = allReviews?.some(r => r.sessionId === booking.sessionId && r.memberId === booking.memberId);
    return !hasReview;
  }).map(booking => {
    const session = allSessions?.find(s => s.id === booking.sessionId);
    return {
      id: booking.id.toString(),
      sessionId: booking.sessionId,
      coachId: session?.coachId || 0,
      name: booking.sessionName || session?.sessionName || 'Session',
      coachName: session?.coachName || 'Unknown Coach',
      date: new Date(booking.bookingTime)
    };
  }) || [];

  // Filter reviews for this member
  const myReviews = allReviews?.filter(r => r.memberId === memberProfile?.id) || [];

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<any | null>(null);
  const [editingReview, setEditingReview] = useState<any | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);


  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!memberProfile) {
      toast({
        title: 'Profile Error',
        description: 'You need a member profile to submit reviews. It should have been created automatically.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!selectedPending) return;

      await feedbackApi.create({
        memberId: memberProfile.id,
        coachId: selectedPending.coachId, // Real Coach ID from the session
        sessionId: selectedPending.sessionId, // Real Session ID from the booking
        rating: newRating,
        comments: newComment,
        senderType: "Member",
        timestamp: new Date().toISOString()
      });

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });

      setNewRating(0);
      setNewComment('');
      setDialogOpen(false);
      setSelectedPending(null);
      refetchReviews(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: 'destructive',
      });
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    
    try {
      await feedbackApi.update(editingReview.id, {
        rating: editingReview.rating,
        comments: editingReview.comments
      });

      toast({
        title: 'Review Updated',
        description: 'Your feedback has been updated.',
      });

      setEditDialogOpen(false);
      setEditingReview(null);
      refetchReviews();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : "Failed to update review",
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await feedbackApi.delete(id);
      toast({
        title: 'Review Deleted',
        description: 'Your review has been removed.',
      });
      refetchReviews();
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: 'destructive',
      });
    }
  };


  return (
    <DashboardLayout role="Member">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Reviews</h1>
          <p className="text-muted-foreground mt-1">Share your experience with coaches and sessions</p>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Pending Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingReviews.map((pending) => (
                  <div
                    key={pending.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{pending.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        with {pending.coachName} • {format(pending.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Dialog open={dialogOpen && selectedPending?.id === pending.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (!open) setSelectedPending(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setSelectedPending(pending)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Write Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Review: {pending.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Rating</label>
                            <StarRating rating={newRating} onRate={setNewRating} interactive />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Your Review</label>
                            <Textarea
                              placeholder="Share your experience..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button onClick={handleSubmitReview} className="w-full">
                            Submit Review
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>My Reviews ({myReviews.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <Badge variant="secondary">
                          {review.coachName ? `Coach: ${review.coachName}` : 'Session Review'}
                        </Badge>
                      </div>
                      <p className="text-foreground">{review.comments || "No comments"}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(review.timestamp), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingReview({ ...review });
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit Review Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            {editingReview && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  <StarRating 
                    rating={editingReview.rating} 
                    onRate={(r) => setEditingReview({ ...editingReview, rating: r })} 
                    interactive 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comments</label>
                  <Textarea
                    placeholder="Update your experience..."
                    value={editingReview.comments || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, comments: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button onClick={handleUpdateReview} className="w-full">
                  Update Review
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
