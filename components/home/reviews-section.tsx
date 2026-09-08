"use client";

import { useState } from "react";
import { ReviewItem } from "@/lib/types";
import { submitCustomerReview } from "@/lib/actions/reviews";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  CheckCircle2,
  PenLine,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewsSectionProps {
  initialReviews: ReviewItem[];
}

export default function ReviewsSection({ initialReviews }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Form States
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const verifiedReviews = reviews.filter((r) => r.is_verified);
  const activeReviews = verifiedReviews.length > 0 ? verifiedReviews : initialReviews;

  const totalReviews = activeReviews.length;
  const avgRating =
    totalReviews > 0
      ? (activeReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

  const ratingDescriptions: Record<number, string> = {
    5: "5 Stars - Flawless Hardware & Outstanding Service!",
    4: "4 Stars - Very Good Quality & Swift Delivery",
    3: "3 Stars - Good & As Described",
    2: "2 Stars - Met Expectations with Minor Issues",
    1: "1 Star - Unsatisfied",
  };

  const handleRatingClick = (selected: number) => {
    setRating(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      toast.error("Please write a review comment of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitCustomerReview({
        customer_name: name.trim(),
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        role_or_college: role.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        // Reset form
        setName("");
        setRole("");
        setTitle("");
        setComment("");
        setRating(5);
        setIsDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to submit review. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error submitting review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Recently";
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <section id="reviews" className="w-full py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-border/60">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-500 mb-3.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Verified Maker Community</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Customer Reviews & Ratings
            </h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Genuine feedback from robotics engineers, embedded IoT researchers, and student makers
              who prototype with Z-Electronics verified silicon.
            </p>
          </div>

          {/* Rating Summary & Write Button */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-border/80 px-4 py-2.5 shadow-sm">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-foreground">{avgRating}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Out of 5.0
                </span>
              </div>
              <div className="h-8 w-[1px] bg-border" />
              <div className="flex flex-col">
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                  {totalReviews} Verified Review{totalReviews === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            {/* Write a Review Button */}
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="h-12 px-6 rounded-xl font-bold gap-2 text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <PenLine className="h-4 w-4" />
              <span>Write a Review</span>
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-card border-border">
                <DialogHeader>
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Quality Verified Feedback</span>
                  </div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    Share Your Experience
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Your rating and review help fellow makers and engineering teams choose the right components.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                  {/* Star Rating Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Overall Rating <span className="text-destructive">*</span>
                    </label>
                    <div className="flex items-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((starIndex) => {
                        const isFilled =
                          hoverRating > 0 ? starIndex <= hoverRating : starIndex <= rating;
                        return (
                          <button
                            key={starIndex}
                            type="button"
                            onClick={() => handleRatingClick(starIndex)}
                            onMouseEnter={() => setHoverRating(starIndex)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
                            aria-label={`Rate ${starIndex} stars`}
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                isFilled
                                  ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                                  : "text-muted-foreground/40 hover:text-amber-400"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-[11px] font-medium text-amber-500 block">
                      {ratingDescriptions[hoverRating || rating]}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Your Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Arun Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={60}
                      className="rounded-xl h-10 text-sm"
                    />
                  </div>

                  {/* Role / College */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      College / Institution / Role <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Robotics Club Lead, PSG Tech"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      maxLength={80}
                      className="rounded-xl h-10 text-sm"
                    />
                  </div>

                  {/* Review Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Review Title <span className="text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Flawless hardware quality and quick delivery"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={120}
                      className="rounded-xl h-10 text-sm"
                    />
                  </div>

                  {/* Comments */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">
                      Your Detailed Review <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      required
                      rows={3}
                      placeholder="Share details about component accuracy, build quality, campus delivery, or support..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={1000}
                      className="rounded-xl text-sm resize-none"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Minimum 5 characters</span>
                      <span>{comment.length}/1000 characters</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                      className="rounded-xl h-10 text-xs font-semibold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl h-10 px-5 text-xs font-bold gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {activeReviews.map((rev) => (
            <Card
              key={rev.id}
              className="rounded-2xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  {/* Top Row: Stars + Verified Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= rev.rating ? "fill-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Verified Maker</span>
                    </Badge>
                  </div>

                  {/* Title */}
                  {rev.title && (
                    <h3 className="text-sm font-bold text-foreground mt-3 tracking-tight line-clamp-1">
                      {rev.title}
                    </h3>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-primary/20">
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : "M"}
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-foreground truncate">
                        {rev.customer_name}
                      </span>
                      {rev.role_or_college && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {rev.role_or_college}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-muted-foreground/70 shrink-0">
                    {formatDate(rev.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
