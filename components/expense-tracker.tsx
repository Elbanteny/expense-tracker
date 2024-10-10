"use client"; // Enables client-side rendering for this component

import React, { useState, useEffect, ChangeEvent } from "react"; // Import React hooks and types
import { Button } from "@/components/ui/button"; // Import custom Button component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // Import custom Dialog components
import { Label } from "@/components/ui/label"; // Import custom Label component
import { Input } from "@/components/ui/input"; // Import custom Input component
import { FilePenIcon, PlusIcon, TrashIcon } from "lucide-react"; // Import icons from lucide-react
import { format } from "date-fns"; // Import date formatting utility

// Define the Expense type
type Expense = {
  id: number;
  name: string;
  amount: number;
  date: Date;
};

// Initial expenses to populate the tracker
const initialExpenses: Expense[] = [];

export default function ExpenseTracker() {
  // State to manage the list of expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // State to manage the visibility of the modal
  const [showModal, setShowModal] = useState<boolean>(false);
  // State to track if an expense is being edited
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // State to track the current expense being edited
  const [currentExpenseId, setCurrentExpenseId] = useState<number | null>(null);
  // State to manage the new expense input form
  const [newExpense, setNewExpense] = useState<{
    name: string;
    amount: string;
    date: Date;
  }>({
    name: "",
    amount: "",
    date: new Date(),
  });


  function formatRupiah(number: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
  }

  // useEffect to load expenses from local storage or set initial expenses
  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");

    if (storedExpenses && storedExpenses !== "[]") {
      try {
        setExpenses(
          JSON.parse(storedExpenses).map((expense: Expense) => ({
            ...expense,
            date: new Date(expense.date),
          }))
        );
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
        setExpenses(initialExpenses);
      }
    } else {
      setExpenses(initialExpenses);
    }
  }, []);

  // useEffect to store expenses in local storage whenever they change
  useEffect(() => {
    if (expenses?.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  // Function to handle adding a new expense
  const handleAddExpense = (): void => {
    if (!newExpense.name || !newExpense.amount || !newExpense.date) {
      alert("Tolong isi terlebih dahulu.");
      return;
    }
    setExpenses([
      ...(expenses || []),
      {
        id: expenses?.length + 1,
        name: newExpense?.name,
        amount: parseFloat(newExpense?.amount),
        date: new Date(newExpense?.date),
      },
    ]);
    resetForm(); // Reset the input form
    setShowModal(false); // Close the modal
  };

  // Function to handle editing an existing expense
  const handleEditExpense = (id: number): void => {
    const expenseToEdit = expenses.find((expense) => expense.id === id);
    if (expenseToEdit) {
      setNewExpense({
        name: expenseToEdit.name,
        amount: expenseToEdit.amount.toString(),
        date: expenseToEdit.date,
      });
      setCurrentExpenseId(id);
      setIsEditing(true);
      setShowModal(true);
    }
  };

  // Function to handle saving the edited expense
  const handleSaveEditExpense = (): void => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === currentExpenseId
          ? { ...expense, ...newExpense, amount: parseFloat(newExpense.amount) }
          : expense
      )
    );
    resetForm(); // Reset the input form
    setShowModal(false); // Close the modal
  };

  // Function to reset the input form
  const resetForm = (): void => {
    setNewExpense({
      name: "",
      amount: "",
      date: new Date(),
    });
    setIsEditing(false);
    setCurrentExpenseId(null);
  };

  // Function to handle deleting an expense
  const handleDeleteExpense = (id: number): void => {
    const updatedExpenses: any = setExpenses(expenses.filter((expense) => expense.id !== id));
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  // Calculate the total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Function to handle input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    setNewExpense((prevExpense) => ({
      ...prevExpense,
      [id]:
        id === "amount"
          ? parseFloat(value)
          : id === "date"
            ? new Date(value)
            : value,
    }));
  };

  // JSX return statement rendering the Expense Tracker UI
  return (
    <div className="flex flex-col h-screen">
      {/* Header section */}
      <header className="bg-primary text-primary-foreground py-4 px-6 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-lg md:text-2xl font-bold">Pelacak Pengeluaran</h1>
          <div className="text-lg md:text-2xl font-bold">
            Total: {formatRupiah(totalExpenses)}
          </div>
        </div>
      </header>
      {/* Main section */}
      <main className="flex-1 overflow-y-auto p-6">
        <ul className="space-y-4">
          {expenses?.length > 0 ? (
            expenses.map((expense) => (
              <li
                key={expense.id}
                className="bg-card p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-medium">
                    {expense.name ? expense.name : "No Name"}
                  </h3>
                  <p className="text-muted-foreground">
                    {formatRupiah(expense.amount)} -{" "}
                    {expense.date ? format(expense.date, "dd/MM/yyyy") : "No Date"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditExpense(expense.id)}
                  >
                    <FilePenIcon className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </Button>
                </div>
              </li>
            ))
          ) : (
            <p>Anda belum membuat pengeluaran.</p>
          )}

        </ul>
      </main>
      {/* Floating add expense button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="icon"
          className="rounded-full shadow-lg"
          onClick={() => {
            setShowModal(true);
            setIsEditing(false);
            resetForm();
          }}
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
      </div>
      {/* Modal dialog for adding/editing expenses */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card p-6 rounded-lg shadow w-full max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Ubah Pengeluaran" : "Tambah Pengeluaran"}
            </DialogTitle>
          </DialogHeader>
          <div>
            <div className="grid gap-4">
              {/* Expense name input */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Pengeluaran</Label>
                <Input
                  id="name"
                  value={newExpense.name}
                  onChange={handleInputChange}
                />
              </div>
              {/* Expense amount input */}
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={handleInputChange}
                />
              </div>
              {/* Expense date input */}
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date.toISOString().slice(0, 10)}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          {/* Modal footer with action buttons */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Batalkan
            </Button>
            <Button
              onClick={isEditing ? handleSaveEditExpense : handleAddExpense}
            >
              {isEditing ? "Simpan Perubahan" : "Tambah Pengeluaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
