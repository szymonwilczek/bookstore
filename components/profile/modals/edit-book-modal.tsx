"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Book {
  id: string;
  title: string;
  author?: string;
  image?: string;
  createdAt: string;
  status: "active" | "inactive";
  condition?: "new" | "used" | "damaged";
  ownerNote?: string;
}

interface EditBookModalProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (book: Book) => void;
}

export function EditBookModal({
  book,
  open,
  onOpenChange,
  onSave,
}: EditBookModalProps) {
  const [status, setStatus] = useState<"active" | "inactive">(
    book?.status || "active"
  );
  const [condition, setCondition] = useState<"new" | "used" | "damaged">(
    book?.condition || "used"
  );
  const [ownerNote, setOwnerNote] = useState(book?.ownerNote || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (book) {
      await fetch(`/api/user/offered-books/${book.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          condition,
          ownerNote,
        }),
      });

      onSave({ ...book, status, condition, ownerNote });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={book?.id || "empty"}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogDescription>
            Update details for &quot;{book?.title}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "active" | "inactive")
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition" className="text-right">
                Condition
              </Label>
              <Select
                value={condition}
                onValueChange={(value) =>
                  setCondition(value as "new" | "used" | "damaged")
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nowy</SelectItem>
                  <SelectItem value="used">Używany</SelectItem>
                  <SelectItem value="damaged">Uszkodzony</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerNote" className="text-right">
                Notatka
              </Label>
              <Textarea
                id="ownerNote"
                value={ownerNote}
                onChange={(e) => setOwnerNote(e.target.value)}
                placeholder="np. okładka uszkodzona..."
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
