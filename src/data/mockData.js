import { v4 as uuidv4 } from 'uuid';

export const categories = [
  { id: 'alimentacao', name: 'Alimentação', color: '#ef4444', icon: '🍽️' },
  { id: 'transporte', name: 'Transporte', color: '#3b82f6', icon: '🚗' },
  { id: 'moradia', name: 'Moradia', color: '#8b5cf6', icon: '🏠' },
  { id: 'saude', name: 'Saúde', color: '#10b981', icon: '🏥' },
  { id: 'educacao', name: 'Educação', color: '#f59e0b', icon: '📚' },
  { id: 'lazer', name: 'Lazer', color: '#ec4899', icon: '🎮' },
  { id: 'vestuario', name: 'Vestuário', color: '#06b6d4', icon: '👕' },
  { id: 'investimentos', name: 'Investimentos', color: '#9333ea', icon: '📈' },
  { id: 'metas', name: 'Metas', color: '#d946ef', icon: '🎯' },
  { id: 'contas', name: 'Contas Fixas', color: '#f472b6', icon: '🧾'},
  { id: 'outros', name: 'Outros', color: '#6b7280', icon: '📦' }
];

export const investmentTypes = [
  { id: 'acoes', name: 'Ações', color: '#ef4444' },
  { id: 'fiis', name: 'FIIs', color: '#3b82f6' },
  { id: 'renda-fixa', name: 'Renda Fixa', color: '#10b981' },
  { id: 'criptomoedas', name: 'Criptomoedas', color: '#f59e0b' },
  { id: 'fundos', name: 'Fundos de Investimento', color: '#8b5cf6' },
  { id: 'exterior', name: 'Investimentos no Exterior', color: '#06b6d4'}
];

export const mockTransactions = [];
export const mockInvestments = [];
export const mockGoals = [];
export const mockAccountsPayable = [];
export const mockUserDefinedAlerts = [];


export const generateRandomColor = () => {
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#84cc16'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const generateRandomIcon = () => {
  const icons = ['📊', '💰', '🎯', '📈', '💳', '🏦', '💵', '🏷️', '📑', '📝', '💡', '🎁', '✈️', '🛍️'];
  return icons[Math.floor(Math.random() * icons.length)];
};