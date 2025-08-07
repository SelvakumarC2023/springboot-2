import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useTransactions } from './hooks/useTransactions';
import LandingPage from './components/LandingPage/LandingPage';
import BudgetForm from './components/BudgetForm';
import BudgetSummary from './components/BudgetSummary';
import UserID from './components/UserID/UserID';
import './App.css';

// Simple auth check using localStorage
const useSimpleAuth = () => {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const navigate = useNavigate();

  const login = (id) => {
    localStorage.setItem('userId', id);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
    navigate('/');
  };

  return { userId, login, logout };
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { userId } = useSimpleAuth();
  
  if (!userId) {
    return <Navigate to="/user-id" />;
  }
  
  return children;
};

function AppContent() {
  const { userId, logout } = useSimpleAuth();
  const { 
    transactions, 
    loading, 
    error,
    editingTransaction,
    setEditingTransaction,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();
  
  // Fetch transactions when userId is available
  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleTransactionSubmit = async (transaction) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, transaction);
    } else {
      return await addTransaction(transaction);
    }
  };

  if (userId && loading && !transactions.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Budget Tracker</h1>
        <nav>
          <Link to="/">Home</Link>
          {userId && (
            <>
              <Link to="/add-transaction">Add Transaction</Link>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main>
        {error && <div className="error-message">{error}</div>}
        <Routes>
          <Route path="/" element={
            userId ? (
              <BudgetSummary 
                transactions={transactions} 
                onEdit={handleEditTransaction}
                onDelete={deleteTransaction}
              />
            ) : (
              <LandingPage />
            )
          } />
          
          <Route path="/user-id" element={
            userId ? <Navigate to="/" /> : <UserID />
          } />
          
          <Route path="/add-transaction" element={
            <ProtectedRoute>
              <BudgetForm 
                onSubmit={handleTransactionSubmit} 
                onCancel={() => setEditingTransaction(null)}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/edit-transaction" element={
            <ProtectedRoute>
              {editingTransaction ? (
                <BudgetForm 
                  transaction={editingTransaction}
                  onSubmit={handleTransactionSubmit}
                  onCancel={() => setEditingTransaction(null)}
                />
              ) : (
                <Navigate to="/" />
              )}
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
