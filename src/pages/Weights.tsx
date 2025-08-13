import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWeightData } from "@/hooks/useWeightData";
import { UnitProvider, useUnit } from "@/contexts/UnitContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightEditDialog } from "@/components/WeightEditDialog";
import { toast } from "@/hooks/use-toast";
import { Trash2, Pencil, ArrowLeft } from "lucide-react";
import type { WeightEntry } from "@/types/weight";

function WeightsContentInner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weights, deleteWeight, editWeight, loadWeights } = useWeightData();
  const { getWeightUnit, convertWeight } = useUnit();

  // SEO basics
  useEffect(() => {
    document.title = "All Weight Data | Bodybuilding Tracker";
    // simple canonical tag
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", window.location.href);
    if (!link.parentNode) document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Local edit dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeightVal, setEditWeightVal] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNote, setEditNote] = useState("");

  // Optional quick search filter
  const [query, setQuery] = useState("");

  const sortedWeights = useMemo(() => {
    const list = [...weights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((w) =>
      w.date.includes(q) || String(w.weight).includes(q) || (w.note ?? "").toLowerCase().includes(q)
    );
  }, [weights, query]);

  const handleEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    const targetUnit = getWeightUnit() as "kg" | "lbs";
    const displayWeight = convertWeight(Number(entry.weight), entry.unit, targetUnit);
    setEditWeightVal(displayWeight.toFixed(1));
    setEditDate(entry.date);
    setEditNote(entry.note ?? "");
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingId) return;
    const original = weights.find((w) => w.id === editingId);
    if (!original) return;

    try {
      const currentUnit = getWeightUnit() as "kg" | "lbs";
      const weightNumber = parseFloat(editWeightVal);
      // Convert back to original unit for storage consistency
      const weightInOriginal = convertWeight(weightNumber, currentUnit, original.unit);
      await editWeight(editingId, {
        weight: Number(weightInOriginal.toFixed(2)),
        date: editDate,
        note: editNote,
      });
      toast({ title: "Entry updated" });
      setIsDialogOpen(false);
      setEditingId(null);
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWeight(id);
      toast({ title: "Entry deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    }
  };

  useEffect(() => {
    // ensure latest
    loadWeights();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}> 
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">All Weight Data</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-muted-foreground">Review, edit, or delete your logged weights.</p>
            </div>
            <div className="w-56">
              <Label htmlFor="search">Search</Label>
              <Input id="search" placeholder="Filter by date, value, or note" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Entries ({sortedWeights.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Weight ({getWeightUnit()})</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedWeights.map((w) => {
                      const display = convertWeight(Number(w.weight), w.unit, getWeightUnit() as "kg" | "lbs");
                      return (
                        <TableRow key={w.id}>
                          <TableCell>{w.date}</TableCell>
                          <TableCell>{display.toFixed(1)}</TableCell>
                          <TableCell className="max-w-[420px] truncate" title={w.note}>{w.note || "—"}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" aria-label="Edit" onClick={() => handleEdit(w)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" aria-label="Delete" onClick={() => handleDelete(w.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <WeightEditDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        editWeight={editWeightVal}
        setEditWeight={setEditWeightVal}
        editNote={editNote}
        setEditNote={setEditNote}
        editDate={editDate}
        setEditDate={setEditDate}
        onSave={handleSave}
      />
    </div>
  );
}

function WeightsContent() {
  return (
    <UnitProvider>
      <WeightsContentInner />
    </UnitProvider>
  );
}

export default WeightsContent;
