
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUnit } from '../contexts/UnitContext';

interface WeightEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editWeight: string;
  setEditWeight: (weight: string) => void;
  editNote: string;
  setEditNote: (note: string) => void;
  editDate: string;
  setEditDate: (date: string) => void;
  onSave: () => void;
}

export const WeightEditDialog: React.FC<WeightEditDialogProps> = ({
  isOpen,
  onClose,
  editWeight,
  setEditWeight,
  editNote,
  setEditNote,
  editDate,
  setEditDate,
  onSave,
}) => {
  const { getWeightUnit } = useUnit();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Weight Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-weight">Weight ({getWeightUnit()})</Label>
            <Input
              id="edit-weight"
              type="number"
              step="0.1"
              value={editWeight}
              onChange={(e) => setEditWeight(e.target.value)}
              placeholder={`Enter weight in ${getWeightUnit()}`}
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
          <div>
            <Label htmlFor="edit-note">Note (optional)</Label>
            <Textarea
              id="edit-note"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Add a note about this weight entry..."
              rows={3}
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
              disabled={!editWeight || !editDate}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
