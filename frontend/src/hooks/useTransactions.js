import { useState, useEffect, useCallback } from 'react';
import { transactionsApi } from '../services/api';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionsApi.getAll();
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMonthlyTransactions = useCallback(async (year, month) => {
    try {
      setLoading(true);
      const response = await transactionsApi.getByMonth(year, month);
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly transactions:', err);
      setError('Failed to fetch monthly transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTransaction = async (transaction) => {
    try {
      setLoading(true);
      const response = await transactionsApi.create(transaction);
      setTransactions(prev => [response.data, ...prev]);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add transaction' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transaction) => {
    try {
      setLoading(true);
      const response = await transactionsApi.update(id, transaction);
      setTransactions(prev => 
        prev.map(t => t.id === id ? response.data : t)
      );
      setEditingTransaction(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update transaction' 
      };
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      await transactionsApi.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete transaction' 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    editingTransaction,
    setEditingTransaction,
    fetchTransactions,
    fetchMonthlyTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};
