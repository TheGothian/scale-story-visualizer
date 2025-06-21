
import { useState } from 'react';
import { BodyComposition } from '../types/bodybuilding';

export const useBodyFatChart = (
  onDeleteComposition: (id: string) => void,
  onEditComposition: (id: string, updatedComposition: Partial<BodyComposition>) => void
) => {
  const [editingEntry, setEditingEntry] = useState<BodyComposition | null>(null);
  const [editBodyFat, setEditBodyFat] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleEditClick = (entry: BodyComposition) => {
    console.log('Edit clicked for body fat entry:', entry.id);
    
    setEditingEntry(entry);
    setEditBodyFat(entry.bodyFatPercentage?.toString() || '');
    setEditDate(entry.date);
    setIsEditDialogOpen(true);
    setIsPopoverOpen(false);
    setActiveEntry(null);
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete clicked for body fat entry:', id);
    onDeleteComposition(id);
    setIsPopoverOpen(false);
    setActiveEntry(null);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    const bodyFatNum = parseFloat(editBodyFat);
    if (isNaN(bodyFatNum) || bodyFatNum < 1 || bodyFatNum > 50) {
      return;
    }
    
    onEditComposition(editingEntry.id, {
      bodyFatPercentage: bodyFatNum,
      date: editDate,
    });

    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDotClick = (data: any, event: any) => {
    console.log('Body fat dot clicked:', data);
    event.stopPropagation();
    
    if (activeEntry === data.id && isPopoverOpen) {
      setIsPopoverOpen(false);
      setActiveEntry(null);
    } else {
      setActiveEntry(data.id);
      setIsPopoverOpen(true);
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    if (!open) {
      setIsPopoverOpen(false);
      setActiveEntry(null);
    }
  };

  const handleChartClick = () => {
    setIsPopoverOpen(false);
    setActiveEntry(null);
  };

  return {
    editingEntry,
    editBodyFat,
    setEditBodyFat,
    editDate,
    setEditDate,
    isEditDialogOpen,
    setIsEditDialogOpen,
    activeEntry,
    isPopoverOpen,
    handleEditClick,
    handleDeleteClick,
    handleSaveEdit,
    handleDotClick,
    handlePopoverOpenChange,
    handleChartClick,
  };
};
