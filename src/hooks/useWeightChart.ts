
import { useState } from 'react';
import { WeightEntry } from '../types/weight';
import { useUnit } from '../contexts/UnitContext';

export const useWeightChart = (
  onDeleteWeight: (id: string) => void,
  onEditWeight: (id: string, updatedEntry: Partial<WeightEntry>) => void
) => {
  const { convertWeight } = useUnit();
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleEditClick = (entry: WeightEntry) => {
    console.log('Edit clicked for entry:', entry.id);
    const { unitSystem } = useUnit();
    const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
    
    setEditingEntry(entry);
    setEditWeight(convertWeight(entry.weight, entry.unit, currentUnit).toString());
    setEditNote(entry.note || '');
    setEditDate(entry.date);
    setIsEditDialogOpen(true);
    setIsPopoverOpen(false);
    setActiveEntry(null);
  };

  const handleDeleteClick = (id: string) => {
    console.log('Delete clicked for entry:', id);
    onDeleteWeight(id);
    setIsPopoverOpen(false);
    setActiveEntry(null);
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;

    const { unitSystem } = useUnit();
    const currentUnit = unitSystem === 'metric' ? 'kg' : 'lbs';
    const weightInOriginalUnit = convertWeight(parseFloat(editWeight), currentUnit, editingEntry.unit);
    
    onEditWeight(editingEntry.id, {
      weight: weightInOriginalUnit,
      note: editNote.trim() || undefined,
      date: editDate,
    });

    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDotClick = (data: any, event: any) => {
    console.log('Dot clicked:', data);
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
    editWeight,
    setEditWeight,
    editNote,
    setEditNote,
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
