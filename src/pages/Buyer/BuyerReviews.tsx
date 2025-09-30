import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { getReviews, saveReviews } from '@/utils/storage';
import { Review } from '@/types';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Layout/Navbar';

const BuyerReviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    if (user) {
      setReviews(getReviews().filter(r => r.buyerId === user.id));
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewComment(review.comment);
    setNewRating(review.rating);
  };

  const handleUpdateReview = () => {
    if (!editingReview) return;

    const allReviews = getReviews();
    const updatedReviews = allReviews.map(r => 
      r.id === editingReview.id 
        ? { ...r, comment: newComment, rating: newRating }
        : r
    );

    saveReviews(updatedReviews);
    setReviews(updatedReviews.filter(r => r.buyerId === user!.id));
    setEditingReview(null);
    setNewComment('');
    setNewRating(5);

    toast({
      title: 'Review Updated',
      description: 'Your review has been updated successfully',
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    const allReviews = getReviews();
    const updatedReviews = allReviews.filter(r => r.id !== reviewId);
    
    saveReviews(updatedReviews);
    setReviews(updatedReviews.filter(r => r.buyerId === user!.id));

    toast({
      title: 'Review Deleted',
      description: 'Your review has been deleted',
    });
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showCart={true} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Reviews</h2>
          <p className="text-muted-foreground">
            Your feedback and reviews for menu items
          </p>
        </div>

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{review.menuName}</CardTitle>
                      <div className="flex items-center space-x-4 mb-2">
                        {renderStars(review.rating)}
                        <Badge variant="secondary">
                          Order #{review.orderId.slice(0, 8)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reviewed on {formatDate(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Your Review:</h4>
                      <p className="text-sm bg-muted p-3 rounded-lg">
                        {review.comment}
                      </p>
                    </div>
                    
                    {review.sellerResponse && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Seller Response:
                        </h4>
                        <p className="text-sm bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg">
                          {review.sellerResponse}
                        </p>
                        {review.respondedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Responded on {formatDate(review.respondedAt)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground">
                  Complete your orders to leave reviews for the food items
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Review Dialog */}
        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
              <DialogDescription>
                Update your review for {editingReview?.menuName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                {renderStars(newRating, true, setNewRating)}
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Comment</label>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this menu item..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReview(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateReview}>
                Update Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BuyerReviews;