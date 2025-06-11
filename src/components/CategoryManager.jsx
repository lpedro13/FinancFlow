import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Palette, Smile } from 'lucide-react';
import { generateRandomColor, generateRandomIcon } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CategoryManager = ({ categories, onAddCategory, onDeleteCategory, onUpdateCategory }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '' }); // Removed color from form
  const { toast } = useToast();

  const resetAddForm = () => {
    setFormData({ name: '', icon: '' });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome da categoria é obrigatório.", variant: "destructive" });
      return;
    }
    onAddCategory({
      id: uuidv4(),
      name: formData.name.trim(),
      color: generateRandomColor(), // Always generate color automatically
      icon: formData.icon || generateRandomIcon()
    });
    resetAddForm();
    setIsAddOpen(false);
    toast({ title: "Sucesso!", description: "Categoria adicionada." });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon, color: category.color }); // Keep color for edit, but don't show input
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome da categoria é obrigatório.", variant: "destructive" });
      return;
    }
    onUpdateCategory(editingCategory.id, {
      name: formData.name.trim(),
      icon: formData.icon || editingCategory.icon,
      color: editingCategory.color, // Keep original color unless explicitly changed elsewhere
    });
    setIsEditOpen(false);
    setEditingCategory(null);
    toast({ title: "Sucesso!", description: "Categoria atualizada." });
  };

  const handleDeleteRequest = (category) => {
    setCategoryToDelete(category);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      toast({ title: "Sucesso!", description: `Categoria "${categoryToDelete.name}" removida.` });
    }
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-9" onClick={resetAddForm}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-effect">
          <DialogHeader><DialogTitle className="gradient-text">Adicionar Nova Categoria</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div><Label htmlFor="catNameAdd">Nome</Label><Input id="catNameAdd" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label htmlFor="catIconAdd">Ícone (Emoji)</Label><Input id="catIconAdd" value={formData.icon} onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))} placeholder="Ex: 🍽️ (opcional)" /></div>
            <Button type="submit" className="w-full">Adicionar</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass-effect">
          <DialogHeader><DialogTitle className="gradient-text">Editar Categoria</DialogTitle></DialogHeader>
          {editingCategory && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <div><Label htmlFor="catNameEdit">Nome</Label><Input id="catNameEdit" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
              <div><Label htmlFor="catIconEdit">Ícone (Emoji)</Label><Input id="catIconEdit" value={formData.icon} onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Atualizar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="glass-effect">
          <AlertDialogHeader><AlertDialogTitle className="gradient-text">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a categoria "{categoryToDelete?.name}"? As transações associadas a esta categoria serão marcadas como "Outros". Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {categories && categories.length > 0 && (
        <div className="mt-4 space-y-2">
          <Label className="text-sm text-muted-foreground">Gerenciar Categorias Existentes:</Label>
          <div className="max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            {categories.filter(c => c.id !== 'outros' && c.id !== 'investimentos' && c.id !== 'metas' && c.id !== 'contas').map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: cat.color }} className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEdit(cat)}><Edit className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleDeleteRequest(cat)}><Trash2 className="h-3 w-3 text-red-500" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryManager;