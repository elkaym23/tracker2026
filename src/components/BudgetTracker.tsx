import { useState, useEffect } from 'react';
import { DollarSign, Plus, TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { expenseDb } from '@/lib/db';

const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Mortgage',
    'Health & Fitness',
    'Savings',
    'Income',
    'Additional Income',
    'BTS Merch 💜',
    'Other',
];

export function BudgetTracker() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0];

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await expenseDb.getByDateRange(firstDayOfMonth, today);
            setExpenses(data || []);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (amount && category) {
            try {
                const newExpense = await expenseDb.create({
                    date: today,
                    category,
                    amount: parseFloat(amount),
                    description: description || undefined,
                    type,
                });
                setExpenses([newExpense, ...expenses]);
                setAmount('');
                setCategory('');
                setDescription('');
                setIsAdding(false);
            } catch (error) {
                console.error('Error adding expense:', error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await expenseDb.delete(id);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const totalIncome = expenses
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const totalExpenses = expenses
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const balance = totalIncome - totalExpenses;

    const expensesByCategory = expenses
        .filter(e => e.type === 'expense')
        .reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount);
            return acc;
        }, {} as Record<string, number>);

    if (loading) {
        return (
            <Card variant="budget" className="animate-fade-in">
                <CardContent className="py-8 text-center text-muted-foreground">
                    Loading...
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="budget" className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="flex items-center gap-2 text-budget">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-budget/20">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        Monthly Budget
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Button
                    variant="budget"
                    size="icon-sm"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-success/10 p-3 border border-success/20">
                        <div className="flex items-center gap-1 text-xs text-success mb-1">
                            <TrendingUp className="h-3 w-3" />
                            Income
                        </div>
                        <p className="text-lg font-bold text-success">
                            ${totalIncome.toFixed(2)}
                        </p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20">
                        <div className="flex items-center gap-1 text-xs text-destructive mb-1">
                            <TrendingDown className="h-3 w-3" />
                            Expenses
                        </div>
                        <p className="text-lg font-bold text-destructive">
                            ${totalExpenses.toFixed(2)}
                        </p>
                    </div>
                    <div className={`rounded-lg p-3 border ${balance >= 0 ? 'bg-primary/10 border-primary/20' : 'bg-destructive/10 border-destructive/20'}`}>
                        <div className="text-xs text-muted-foreground mb-1">
                            Balance
                        </div>
                        <p className={`text-lg font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${balance.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-budget/30 animate-fade-in">
                        <div className="flex gap-2">
                            <Button
                                variant={type === 'expense' ? 'budget' : 'outline'}
                                size="sm"
                                onClick={() => setType('expense')}
                                className="flex-1"
                            >
                                Expense
                            </Button>
                            <Button
                                variant={type === 'income' ? 'budget' : 'outline'}
                                size="sm"
                                onClick={() => setType('income')}
                                className="flex-1"
                            >
                                Income
                            </Button>
                        </div>
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-background/50 border-budget/30"
                            step="0.01"
                        />
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background/50 border-budget/30">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Description (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background/50 border-budget/30"
                        />
                        <Button variant="budget" size="sm" onClick={handleAdd} className="w-full">
                            Add {type === 'expense' ? 'Expense' : 'Income'}
                        </Button>
                    </div>
                )}

                {/* Category Breakdown */}
                {Object.keys(expensesByCategory).length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">By Category</h4>
                        {Object.entries(expensesByCategory)
                            .sort(([, a], [, b]) => (b as number) - (a as number))
                            .map(([cat, amount]) => (
                                <div key={cat} className="flex items-center justify-between text-sm">
                                    <span>{cat}</span>
                                    <span className="font-medium">${(amount as number).toFixed(2)}</span>
                                </div>
                            ))}
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Recent Transactions</h4>
                    {expenses.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">
                            No transactions yet this month
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {expenses.slice(0, 10).map((expense) => (
                                <div
                                    key={expense.id}
                                    className={`group flex items-center justify-between p-2 rounded-lg border ${expense.type === 'income'
                                        ? 'bg-success/5 border-success/20'
                                        : 'bg-background/30 border-border/50'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {expense.category}
                                            </span>
                                            {expense.type === 'income' ? (
                                                <TrendingUp className="h-3 w-3 text-success" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 text-destructive" />
                                            )}
                                        </div>
                                        {expense.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {expense.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${expense.type === 'income' ? 'text-success' : 'text-foreground'
                                            }`}>
                                            {expense.type === 'income' ? '+' : '-'}${parseFloat(expense.amount).toFixed(2)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="opacity-0 group-hover:opacity-100"
                                            onClick={() => handleDelete(expense.id)}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}