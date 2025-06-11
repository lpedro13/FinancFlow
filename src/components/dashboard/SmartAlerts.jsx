import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Edit, Plus, Trash2, BellRing } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

const SmartAlerts = ({ alerts, onAddAlert, onUpdateAlert, onDeleteAlert }) => {
  const { toast } = useToast();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [alertFormData, setAlertFormData] = useState({ name: '', condition: '', threshold: '' });

  const handleAlertSubmit = (e) => {
    e.preventDefault();
    if (!alertFormData.name || !alertFormData.condition || !alertFormData.threshold) {
      toast({ title: "Erro", description: "Preencha todos os campos do alerta.", variant: "destructive" });
      return;
    }
    if (editingAlert) {
      onUpdateAlert({ ...editingAlert, ...alertFormData, description: `${alertFormData.name} ${alertFormData.condition} ${alertFormData.threshold}` });
      toast({ title: "Sucesso!", description: "Alerta atualizado." });
    } else {
      onAddAlert({ id: uuidv4(), ...alertFormData, description: `${alertFormData.name} ${alertFormData.condition} ${alertFormData.threshold}`, type: 'user' });
      toast({ title: "Sucesso!", description: "Alerta adicionado." });
    }
    setAlertFormData({ name: '', condition: '', threshold: '' });
    setEditingAlert(null);
    setIsAlertModalOpen(false);
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setAlertFormData({ name: alert.name, condition: alert.condition, threshold: alert.threshold });
    setIsAlertModalOpen(true);
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="glass-effect h-full">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5" />
              Alertas e Lembretes
            </div>
            <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => { setEditingAlert(null); setAlertFormData({ name: '', condition: '', threshold: '' }); setIsAlertModalOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Novo Alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-effect">
                <DialogHeader>
                  <DialogTitle className="gradient-text">{editingAlert ? 'Editar Alerta' : 'Novo Alerta Personalizado'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAlertSubmit} className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="alertName">Nome do Alerta</Label>
                    <Input id="alertName" value={alertFormData.name} onChange={(e) => setAlertFormData({...alertFormData, name: e.target.value})} placeholder="Ex: Gastos com Lazer" />
                  </div>
                  <div>
                    <Label htmlFor="alertCondition">Condição</Label>
                    <Input id="alertCondition" value={alertFormData.condition} onChange={(e) => setAlertFormData({...alertFormData, condition: e.target.value})} placeholder="Ex: gastou >, saldo <" />
                  </div>
                  <div>
                    <Label htmlFor="alertThreshold">Limite/Valor</Label>
                    <Input id="alertThreshold" value={alertFormData.threshold} onChange={(e) => setAlertFormData({...alertFormData, threshold: e.target.value})} placeholder="Ex: 70%, R$ 1000" />
                  </div>
                  <Button type="submit" className="w-full">{editingAlert ? 'Atualizar Alerta' : 'Adicionar Alerta'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 border rounded-lg flex justify-between items-center transition-all hover:shadow-md
                ${alert.type === 'system-bill' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${alert.type === 'system-bill' ? 'text-red-400' : 'text-yellow-400'}`} />
                  <span className={`text-sm font-medium ${alert.type === 'system-bill' ? 'text-red-400' : 'text-yellow-400'}`}>{alert.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {alert.description}
                </p>
              </div>
              {alert.type === 'user' && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditAlert(alert)} className="h-7 w-7 text-blue-400 hover:bg-blue-500/10">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteAlert(alert.id)} className="h-7 w-7 text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          {alerts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum alerta configurado.</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartAlerts;