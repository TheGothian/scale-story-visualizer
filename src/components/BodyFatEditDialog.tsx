
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface BodyFatEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editBodyFat: string;
  setEditBodyFat: (bodyFat: string) => void;
  editDate: string;
  setEditDate: (date: string) => void;
  onSave: () => void;
}

export const BodyFatEditDialog: React.FC<BodyFatEditDialogProps> = ({
  isOpen,
  onClose,
  editBodyFat,
  setEditBodyFat,
  editDate,
  setEditDate,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Body Fat Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-body-fat">Body Fat Percentage (%)</Label>
            <Input
              id="edit-body-fat"
              type="number"
              step="0.1"
              min="1"
              max="50"
              value={editBodyFat}
              onChange={(e) => setEditBodyFat(e.target.value)}
              placeholder="Enter body fat percentage"
            />
          </div>
          <div>
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={onSave}
              disabled={!editBodyFat || !editDate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
