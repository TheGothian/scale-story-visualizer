import React, { useEffect, useMemo, useState } from 'react';
import { useBodyCompositionData } from '@/hooks/useBodyCompositionData';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BodyFatEditDialog } from '@/components/BodyFatEditDialog';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const BodyFat: React.FC = () => {
  const navigate = useNavigate();
  const { bodyCompositions, deleteBodyComposition, editBodyComposition } = useBodyCompositionData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBodyFat, setEditBodyFat] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    document.title = 'Body Fat Progress | Bodybuilding Tracker';
    const descContent = 'View and manage body fat progress with dates and notes.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descContent);

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', `${window.location.origin}/body-fat`);
  }, []);

  const rows = useMemo(() => {
    return bodyCompositions
      .filter((c) => typeof c.bodyFatPercentage === 'number')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bodyCompositions]);

  const openEdit = (id: string) => {
    const comp = bodyCompositions.find((c) => c.id === id);
    if (!comp) return;
    setEditingId(id);
    setEditBodyFat(comp.bodyFatPercentage?.toString() ?? '');
    setEditDate(comp.date);
    setEditNote(comp.note ?? '');
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) return;
    await editBodyComposition(editingId, {
      bodyFatPercentage: editBodyFat ? parseFloat(editBodyFat) : undefined,
      date: editDate,
      note: editNote || undefined,
    });
    toast({ title: 'Entry updated', description: 'Body fat entry saved successfully.' });
    setIsEditOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteBodyComposition(id);
    toast({ title: 'Entry deleted', description: 'Body fat entry removed.' });
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Body Fat Progress</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>Home</Button>
        </div>
      </header>

      <section>
        <Table>
          <TableCaption>All recorded body fat entries.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Body Fat %</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{format(parseISO(r.date), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{r.bodyFatPercentage?.toFixed(1)}</TableCell>
                <TableCell className="max-w-[400px] truncate" title={r.note}>{r.note || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r.id)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <BodyFatEditDialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editBodyFat={editBodyFat}
        setEditBodyFat={setEditBodyFat}
        editDate={editDate}
        setEditDate={setEditDate}
        editNote={editNote}
        setEditNote={setEditNote}
        onSave={handleSave}
      />
    </main>
  );
};

export default BodyFat;
