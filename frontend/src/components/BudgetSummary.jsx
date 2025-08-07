import React, { useMemo, useState, useEffect } from 'react';
import './BudgetSummary.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function BudgetSummary({ transactions, onEditTransaction, onDeleteTransaction }) {
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [yearlySummary, setYearlySummary] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showDateFilter, setShowDateFilter] = useState(false);

  useEffect(() => {
    // Calculate monthly and yearly summary from local transactions
    const calculateSummary = () => {
      if (!transactions || transactions.length === 0) {
        setMonthlySummary(null);
        setYearlySummary(null);
        return;
      }

      // Calculate monthly summary
      const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        if (date.getFullYear() === selectedYear && (date.getMonth() + 1) === selectedMonth) {
          if (transaction.type === 'income') {
            acc.income += transaction.amount;
          } else {
            acc.expenses += transaction.amount;
          }
        }
        return acc;
      }, { income: 0, expenses: 0 });

      // Calculate yearly summary
      const yearlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date);
        if (date.getFullYear() === selectedYear) {
          if (transaction.type === 'income') {
            acc.income += transaction.amount;
          } else {
            acc.expenses += transaction.amount;
          }
        }
        return acc;
      }, { income: 0, expenses: 0 });

      setMonthlySummary(monthlyData);
      setYearlySummary(yearlyData);
    };

    calculateSummary();
  }, [transactions, selectedYear, selectedMonth]);
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const matchesYearMonth = (
        transactionDate.getFullYear() === selectedYear &&
        transactionDate.getMonth() === selectedMonth - 1
      );
      
      // Only apply date filter if it's enabled
      if (showDateFilter) {
        return matchesYearMonth && transactionDate.getDate() === selectedDate;
      }
      return matchesYearMonth;
    });
  }, [transactions, selectedYear, selectedMonth, selectedDate, showDateFilter]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredTransactions]);

  const summary = useMemo(() => {
    return transactions.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }
      acc.balance = acc.totalIncome - acc.totalExpenses;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0, balance: 0 });
  }, [transactions]);

  const generatePDF = async () => {
    try {
      // Get the summary section
      const element = document.querySelector('.budget-summary');
      
      // Create filename
      const period = showDateFilter
        ? `${getMonthName(selectedMonth - 1)} ${selectedDate}, ${selectedYear}`
        : `${getMonthName(selectedMonth - 1)} ${selectedYear}`;
      
      // Capture the element as canva
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions
      const imgWidth = 210;
      const pageHeight = 297; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const doc = new jsPDF('p', 'mm', 'a4');
      let firstPage = true;

      // Add pages with content
      while (heightLeft >= 0) {
        if (!firstPage) {
          doc.addPage();
        } else {
          firstPage = false;
        }

        doc.addImage(
          canvas,
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST'
        );
        
        heightLeft -= pageHeight;
        position -= pageHeight;
      }

      // Save the PDF
      doc.save(`budget-summary-${period.toLowerCase().replace(/ /g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };

  return (
    <div className="budget-summary">
      <div className="summary-controls">
        <div className="year-selector">
          <label>Year: </label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[...Array(10)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <div className="month-selector">
          <label>Month: </label>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{getMonthName(i)}</option>
            ))}
          </select>
        </div>
        <div className="date-filter">
          <label>
            <input
              type="checkbox"
              checked={showDateFilter}
              onChange={(e) => setShowDateFilter(e.target.checked)}
            />
            Filter by Date
          </label>
          {showDateFilter && (
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(Number(e.target.value))}
            >
              {[...Array(31)].map((_, i) => {
                const date = i + 1;
                return <option key={date} value={date}>{date}</option>;
              })}
            </select>
          )}
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-header">
          <h2>Overall Summary</h2>
          <button className="download-pdf" onClick={generatePDF}>
            <i className="fas fa-download"></i> Download PDF
          </button>
        </div>
        <div className="summary-details">
          <p>Total Income: ₹{summary.totalIncome.toFixed(2)}</p>
          <p>Total Expenses: ₹{summary.totalExpenses.toFixed(2)}</p>
          <p className={`balance ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
            Balance: ₹{summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {monthlySummary && (
        <div className="summary-section">
          <h2>Monthly Summary ({getMonthName(selectedMonth - 1)} {selectedYear})</h2>
          <div>
            <p>Income: ₹{monthlySummary.totalIncome.toFixed(2)}</p>
            <p>Expenses: ₹{monthlySummary.totalExpense.toFixed(2)}</p>
            <p className={`balance ${monthlySummary.balance >= 0 ? 'positive' : 'negative'}`}>
              Balance: ₹{monthlySummary.balance.toFixed(2)}
            </p>
            <p>Transactions: {monthlySummary.transactionCount}</p>
          </div>
        </div>
      )}

      {yearlySummary && (
        <div className="summary-section">
          <h2>Yearly Summary ({selectedYear})</h2>
          <div className="summary-details">
            <p>Income: ₹{yearlySummary.totalIncome.toFixed(2)}</p>
            <p>Expenses: ₹{yearlySummary.totalExpense.toFixed(2)}</p>
            <p className={`balance ${yearlySummary.balance >= 0 ? 'positive' : 'negative'}`}>
              Balance: ₹{yearlySummary.balance.toFixed(2)}
            </p>
            <p>Transactions: {yearlySummary.transactionCount}</p>
          </div>
          <div className="monthly-breakdown">
            <h3>Monthly Breakdown</h3>
            <div className="monthly-list">
              {Object.entries(yearlySummary.monthlyData).map(([month, data]) => (
                <div key={month} className="monthly-item">
                  <strong>{getMonthName(Number(month))}</strong>
                  <div>Income: ₹{data.income.toFixed(2)}</div>
                  <div>Expenses: ₹{data.expense.toFixed(2)}</div>
                  <div className={data.income - data.expense >= 0 ? 'positive' : 'negative'}>
                    Balance: ₹{(data.income - data.expense).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="transactions-list">
        <h3>
          Transactions for {getMonthName(selectedMonth - 1)} {selectedYear}
          {showDateFilter && ` (${selectedDate})`}
        </h3>
        {sortedTransactions.length === 0 ? (
          <p className="no-transactions">
            No transactions found for {getMonthName(selectedMonth - 1)} {selectedYear}
            {showDateFilter && ` (${selectedDate})`}
          </p>
        ) : (
          <ul>
            {sortedTransactions.map(transaction => (
              <li key={transaction._id} className={`transaction ${transaction.type}`}>
                <div className="transaction-date">
                  {new Date(transaction.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </div>
                <div className="transaction-details">
                  <span className="category">{transaction.category}</span>
                  {transaction.description && (
                    <span className="description">{transaction.description}</span>
                  )}
                </div>
                <div className="transaction-amount">
                  ₹{transaction.amount.toFixed(2)}
                </div>
                <div className="transaction-actions">
                  <button
                    className="edit-btn"
                    onClick={() => onEditTransaction(transaction)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        onDeleteTransaction(transaction._id);
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BudgetSummary;
