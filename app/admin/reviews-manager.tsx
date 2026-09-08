"use client";

import { useState } from "react";
import { ReviewItem } from "@/lib/types";
import { verifyReview, deleteReview, createAdminReview } from "@/lib/actions/reviews";
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
  XCircle,
  Trash2,
  ShieldCheck,
  Plus,
  Search,
  Clock,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewsManagerProps {
  initialReviews: ReviewItem[];
}

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | "pending" | "verified">("all");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Add Review Dialog Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState<number>(5);
  const [newTitle, setNewTitle] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newComment, setNewComment] = useState("");

  const totalReviews = reviews.length;
  const verifiedCount = reviews.filter((r) => r.is_verified).length;
  const pendingCount = reviews.filter((r) => !r.is_verified).length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
      : "5.0";

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filter === "pending" && r.is_verified) return false;
    if (filter === "verified" && !r.is_verified) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = r.customer_name?.toLowerCase().includes(q);
      const matchComment = r.comment?.toLowerCase().includes(q);
      const matchRole = r.role_or_college?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      return matchName || matchComment || matchRole || matchTitle;
    }

    return true;
  });

  const handleToggleVerify = async (review: ReviewItem) => {
    const newStatus = !review.is_verified;
    setActionLoadingId(review.id);

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, is_verified: newStatus } : r))
    );

    try {
      const res = await verifyReview(review.id, newStatus);
      if (res.success) {
        toast.success(
          newStatus
            ? `Review by ${review.customer_name} is now VERIFIED and published to visitors!`
            : `Review by ${review.customer_name} unverified (hidden from storefront).`
        );
      } else {
        // Revert on error
        setReviews((prev) =>
          prev.map((r) => (r.id === review.id ? { ...r, is_verified: !newStatus } : r))
        );
        toast.error(res.error || "Failed to update review status.");
      }
    } catch (err: any) {
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, is_verified: !newStatus } : r))
      );
      toast.error(err.message || "Error updating status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review from ${name}?`)) {
      return;
    }

    setActionLoadingId(id);

    // Optimistic UI update
    const previous = [...reviews];
    setReviews((prev) => prev.filter((r) => r.id !== id));

    try {
      const res = await deleteReview(id);
      if (res.success) {
        toast.success(`Review from ${name} deleted successfully.`);
      } else {
        setReviews(previous);
        toast.error(res.error || "Failed to delete review.");
      }
    } catch (err: any) {
      setReviews(previous);
      toast.error(err.message || "Error deleting review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("Reviewer name is required.");
      return;
    }
    if (!newComment.trim() || newComment.trim().length < 5) {
      toast.error("Review comment must be at least 5 characters.");
      return;
    }

    setIsAdding(true);

    try {
      const res = await createAdminReview({
        customer_name: newName.trim(),
        rating: newRating,
        title: newTitle.trim() || undefined,
        role_or_college: newRole.trim() || undefined,
        comment: newComment.trim(),
        is_verified: true, // Auto-verified when posted by admin
      });

      if (res.success) {
        toast.success("Verified review published successfully!");
        setReviews((prev) => [
          {
            id: `rev-${Date.now()}`,
            customer_name: newName.trim(),
            rating: newRating,
            title: newTitle.trim() || undefined,
            role_or_college: newRole.trim() || undefined,
            comment: newComment.trim(),
            is_verified: true,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        setNewName("");
        setNewTitle("");
        setNewRole("");
        setNewComment("");
        setNewRating(5);
        setIsAddOpen(false);
      } else {
        toast.error(res.error || "Failed to add review.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error creating review.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
            Customer Reviews & Verification
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Moderate visitor 5-star ratings, verify genuine maker feedback, or remove spam reviews.
          </p>
        </div>

        {/* Add Official Testimonial */}
        <Button
          onClick={() => setIsAddOpen(true)}
          className="h-10 px-4 rounded-xl font-bold text-xs gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add Verified Review</span>
        </Button>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-lg rounded-2xl p-6 bg-card border-border">
            <DialogHeader>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Testimonial Entry</span>
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Add Official Customer Review
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Directly add customer testimonials received via WhatsApp or phone. It will be published as verified immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddReview} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          s <= newRating
                            ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-amber-500 ml-2">
                    {newRating} Star{newRating === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Customer / Maker Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Divya M."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Role / College / Company
                </label>
                <Input
                  placeholder="e.g. ECE Final Year, Anna University"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">Review Title</label>
                <Input
                  placeholder="e.g. Outstanding WhatsApp tech guidance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Review Details <span className="text-destructive">*</span>
                </label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Paste the genuine feedback from the customer..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="rounded-xl text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={isAdding}
                  className="rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-xl h-10 px-5 text-xs font-bold gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Publish Verified Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metric Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-muted-foreground">Total Reviews</div>
          <div className="text-xl font-black text-foreground mt-1">{totalReviews}</div>
        </Card>

        <Card className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-muted-foreground">Average Rating</div>
          <div className="text-xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>{avgRating} / 5.0</span>
          </div>
        </Card>

        <Card className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-muted-foreground">Verified & Active</div>
          <div className="text-xl font-black text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            <span>{verifiedCount}</span>
          </div>
        </Card>

        <Card className="rounded-xl border bg-card p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-muted-foreground">Pending Verification</div>
          <div className="text-xl font-black text-amber-600 mt-1 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{pendingCount}</span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/40 p-2.5 rounded-2xl border border-border/60">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className="rounded-xl h-8 px-3 text-xs font-bold"
          >
            All ({totalReviews})
          </Button>
          <Button
            size="sm"
            variant={filter === "pending" ? "default" : "ghost"}
            onClick={() => setFilter("pending")}
            className="rounded-xl h-8 px-3 text-xs font-bold relative"
          >
            Pending ({pendingCount})
            {pendingCount > 0 && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </Button>
          <Button
            size="sm"
            variant={filter === "verified" ? "default" : "ghost"}
            onClick={() => setFilter("verified")}
            className="rounded-xl h-8 px-3 text-xs font-bold"
          >
            Verified ({verifiedCount})
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs rounded-xl bg-background border-border/80"
          />
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="rounded-2xl border border-dashed p-10 text-center bg-card/50">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-foreground">No reviews found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "pending"
              ? "All customer reviews have been moderated and verified!"
              : "No reviews match your current filter."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const isLoading = actionLoadingId === rev.id;

            return (
              <Card
                key={rev.id}
                className={`rounded-2xl border transition-all ${
                  rev.is_verified
                    ? "border-border/80 bg-card"
                    : "border-amber-500/50 bg-amber-500/5 shadow-xs"
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Star rating + Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Stars */}
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

                      {/* Status Badge */}
                      {rev.is_verified ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Verified & Public</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse"
                        >
                          <Clock className="h-3 w-3" />
                          <span>Pending Verification</span>
                        </Badge>
                      )}

                      {/* Date */}
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(rev.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Review Title & Text */}
                    <div>
                      {rev.title && (
                        <h4 className="text-sm font-bold text-foreground tracking-tight">
                          {rev.title}
                        </h4>
                      )}
                      <p className="text-xs text-foreground/90 leading-relaxed mt-1">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>

                    {/* Author Signature */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-1">
                      <span className="text-foreground font-bold">{rev.customer_name}</span>
                      {rev.role_or_college && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">{rev.role_or_college}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Moderation Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/50 justify-end">
                    {/* Verify / Unverify Toggle */}
                    <Button
                      size="sm"
                      variant={rev.is_verified ? "outline" : "default"}
                      disabled={isLoading}
                      onClick={() => handleToggleVerify(rev)}
                      className={`rounded-xl h-9 px-3.5 text-xs font-bold gap-1.5 transition-all ${
                        rev.is_verified
                          ? "hover:bg-muted text-muted-foreground"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : rev.is_verified ? (
                        <>
                          <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Unverify</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          <span>Verify & Publish</span>
                        </>
                      )}
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isLoading}
                      onClick={() => handleDelete(rev.id, rev.customer_name)}
                      className="rounded-xl h-9 px-3 text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                      title="Delete Review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
