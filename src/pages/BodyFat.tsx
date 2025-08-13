import React, { useEffect, useMemo, useState } from 'react';
import { useBodyCompositionData } from '@/hooks/useBodyCompositionData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BodyFatEditDialog } from '@/components/BodyFatEditDialog';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Trash2, Pencil, ArrowLeft } from 'lucide-react';
const BodyFat: React.FC = () => {
  const navigate = useNavigate();
  const { bodyCompositions, deleteBodyComposition, editBodyComposition } = useBodyCompositionData();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBodyFat, setEditBodyFat] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    document.title = 'All Body Fat Data | Bodybuilding Tracker';
    const descContent = 'Review, edit, or delete your logged body fat entries.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', descContent);

    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);
  const rows = useMemo(() => {
    const list = bodyCompositions
      .filter((c) => typeof c.bodyFatPercentage === 'number')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((c) =>
      c.date.includes(q) ||
      String(c.bodyFatPercentage ?? '').includes(q) ||
      (c.note ?? '').toLowerCase().includes(q)
    );
  }, [bodyCompositions, query]);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}> 
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">All Body Fat Data</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground">Review, edit, or delete your logged body fat entries.</p>
            </div>
            <div className="w-56">
              <Label htmlFor="bf-search">Search</Label>
              <Input
                id="bf-search"
                placeholder="Filter by date, value, or note"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Entries ({rows.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Body Fat %</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.bodyFatPercentage?.toFixed(1)}</TableCell>
                        <TableCell className="max-w-[420px] truncate" title={r.note}>{r.note || "—"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="outline" aria-label="Edit" onClick={() => openEdit(r.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => handleDelete(r.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

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
    </div>
  );
};

export default BodyFat;
