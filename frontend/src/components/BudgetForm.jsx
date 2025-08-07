import React, { useState, useEffect } from 'react';
import './BudgetForm.css';

function BudgetForm({ onAddTransaction, onUpdateTransaction, editingTransaction }) {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    category: '',
    date: '',
    description: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        ...editingTransaction,
        date: new Date(editingTransaction.date).toISOString().split('T')[0]
      });
    }
  }, [editingTransaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date)
      };

      if (editingTransaction) {
        await onUpdateTransaction({ ...transaction, _id: editingTransaction._id });
      } else {
        await onAddTransaction(transaction);
      }

      // Reset form after successful submission
      setFormData({
        type: 'income',
        amount: '',
        category: '',
        date: '',
        description: ''
      });
    } catch (error) {
      alert(error.message || 'Failed to add transaction. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <h2>Add Transaction</h2>
      
      <div className="form-group">
        <label>Type</label>
        <select 
          name="type" 
          value={formData.type}
          onChange={handleChange}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Enter amount"
          min="0"
          step="0.01"
          required
        />
      </div>

    
      <div className="form-group">
        <label>Category</label>
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Enter category"
        />
      </div>

      <div className="form-group">
        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
        />
      </div>

      <button type="submit" className="submit-btn">
        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
      </button>
      {editingTransaction && (
        <button 
          type="button" 
          className="cancel-btn"
          onClick={() => {
            setFormData({
              type: 'income',
              amount: '',
              category: '',
              date: '',
              description: ''
            });
            onUpdateTransaction(null);
          }}
        >
          Cancel Edit
        </button>
      )}
    </form>
  );
}

export default BudgetForm;
