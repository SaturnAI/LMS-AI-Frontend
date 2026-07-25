"use client";

/** Read-only lead detail view + comment thread. Editing is delegated to LeadFormDialog via onEdit. */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Contact } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LeadPriorityBadge, LeadStatusBadge } from "@/components/dashboard/LeadStatusBadge";
import { useAddComment } from "@/hooks/use-leads";
import { commentSchema, type CommentValues } from "@/lib/validations/lead";
import type { LeadListItem } from "@/lib/api";

const COMMENT_MAX_LENGTH = 200;

interface LeadDetailDialogProps {
  lead: LeadListItem | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (lead: LeadListItem) => void;
  canEdit: boolean;
}

export function LeadDetailDialog({ lead, onOpenChange, onEdit, canEdit }: LeadDetailDialogProps) {
  const addCommentMutation = useAddComment();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommentValues>({ resolver: zodResolver(commentSchema), defaultValues: { comment: "" } });
  const comment = watch("comment");

  async function onSubmit(values: CommentValues) {
    if (!lead) return;
    try {
      await addCommentMutation.mutateAsync({ leadCode: lead.lead_code, comment: values.comment });
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add comment.");
    }
  }

  return (
    <Dialog open={!!lead} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        {lead && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Contact className="size-5 text-primary" />
              </div>
              <DialogTitle className="text-lg font-semibold">{lead.name}</DialogTitle>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <LeadStatusBadge status={lead.status} />
                <LeadPriorityBadge priority={lead.priority} />
                <span className="text-xs text-muted-foreground capitalize">{lead.source.replace("_", " ")}</span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Detail label="Company" value={lead.company_name} />
                <Detail label="Designation" value={lead.designation} />
                <Detail label="Email" value={lead.email} />
                <Detail label="Phone" value={lead.phone_number} />
                <Detail label="Created by" value={lead.created_by} />
                <Detail label="Created at" value={lead.created_at} />
              </dl>

              {lead.remarks && (
                <div>
                  <p className="text-xs text-muted-foreground">Remarks</p>
                  <p className="mt-0.5 text-sm text-foreground">{lead.remarks}</p>
                </div>
              )}

              {lead.sales_representatives && lead.sales_representatives.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground">Sales representatives</p>
                  <p className="mt-0.5 text-sm text-foreground">
                    {lead.sales_representatives.map((r) => r.name).join(", ")}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Comments {lead.comments?.length ? `(${lead.comments.length})` : ""}
                </p>
                {!lead.comments || lead.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  <ul className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                    {lead.comments.map((c) => (
                      <li key={c.comment_id} className="rounded-lg bg-muted/60 p-2 text-sm">
                        <p className="text-foreground">{c.comment}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.commented_user.name} · {c.created_at}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {canEdit && (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Add a comment</span>
                      <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                        {comment?.length ?? 0}/{COMMENT_MAX_LENGTH}
                      </span>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Share an update, next step, or note for the team…"
                      maxLength={COMMENT_MAX_LENGTH}
                      disabled={isSubmitting}
                      {...register("comment")}
                    />
                    {errors.comment && <p className="text-sm text-destructive">{errors.comment.message}</p>}
                    <Button type="submit" size="sm" className="self-end" disabled={isSubmitting}>
                      {isSubmitting ? "Posting…" : "Post comment"}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {canEdit && (
              <DialogFooter>
                <Button variant="outline" onClick={() => onEdit(lead)}>
                  Edit lead
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
