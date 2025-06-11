import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  getCategories,
  getContas,
  getDashboardData,
  getLancamentos,
  getOrcamentos,
  getUserPreferences,
} from "@/utils/localApi";
import { useAppStore } from "@/utils/useAppStore";
import { useModalStore } from "@/utils/useModalStore";
import { useLoadingStore } from "@/utils/useLoadingStore";

export const useAppStateManager = () => {
  const { user } = useUser();
  const { setLoading } = useLoadingStore();
  const {
    lancamentos,
    setLancamentos,
    setPreferences,
    setContas,
    setCategories,
    setOrcamentos,
    setDashboardData,
    resetAppState,
  } = useAppStore();
  const { isModalOpen } = useModalStore();

  const [hasFetchedData, setHasFetchedData] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || hasFetchedData) return;

    setLoading(true);
    try {
      const [
        lancamentosData,
        preferencesData,
        contasData,
        categoriesData,
        orcamentosData,
        dashboardData,
      ] = await Promise.all([
        getLancamentos(user),
        getUserPreferences(user),
        getContas(user),
        getCategories(user),
        getOrcamentos(user),
        getDashboardData(user),
      ]);

      setLancamentos(lancamentosData);
      setPreferences(preferencesData);
      setContas(contasData);
      setCategories(categoriesData);
      setOrcamentos(orcamentosData);
      setDashboardData(dashboardData);

      setHasFetchedData(true);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    setLoading,
    setLancamentos,
    setPreferences,
    setContas,
    setCategories,
    setOrcamentos,
    setDashboardData,
    hasFetchedData,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refreshAppState = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [
        lancamentosData,
        preferencesData,
        contasData,
        categoriesData,
        orcamentosData,
        dashboardData,
      ] = await Promise.all([
        getLancamentos(user),
        getUserPreferences(user),
        getContas(user),
        getCategories(user),
        getOrcamentos(user),
        getDashboardData(user),
      ]);

      setLancamentos(lancamentosData);
      setPreferences(preferencesData);
      setContas(contasData);
      setCategories(categoriesData);
      setOrcamentos(orcamentosData);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error("Erro ao atualizar estado da aplicação:", error);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    setLoading,
    setLancamentos,
    setPreferences,
    setContas,
    setCategories,
    setOrcamentos,
    setDashboardData,
  ]);

  return {
    lancamentos,
    isModalOpen,
    refreshAppState,
    resetAppState,
  };
};
