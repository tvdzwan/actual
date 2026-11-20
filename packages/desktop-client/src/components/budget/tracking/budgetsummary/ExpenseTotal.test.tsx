import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import { ExpenseTotal } from './ExpenseTotal';
import { HiddenExpenseTotal } from './HiddenExpenseTotal';
import { IncomeTotal } from './IncomeTotal';

const testAmounts = vi.hoisted(() => ({ spent: -100, hiddenSpent: -100 }));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (text: string) => text }),
  Trans: ({
    children,
    components,
  }: {
    children?: ReactNode;
    components?: Record<string, ReactNode>;
  }) =>
    components ? (
      <>
        {components.allocatedAmount} of {components.totalAmount}
      </>
    ) : (
      children
    ),
}));

vi.mock('#hooks/useSheetValue', () => ({
  useSheetValue: (binding: string) =>
    ({
      'total-spent': testAmounts.spent,
      'total-budgeted': 200,
      'total-income': 300,
      'total-budget-income': 400,
    })[binding],
}));

vi.mock('#hooks/useFormat', () => ({
  useFormat: () => (value: number) =>
    new Intl.NumberFormat('en-US').format(value),
}));
vi.mock('#components/PrivacyFilter', () => ({
  PrivacyFilter: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('#components/budget/useHiddenCategoryTotals', () => ({
  useHiddenExpenseCategories: () => [{ id: 'hidden', hidden: true }],
  useHiddenCategoryTotals: () => ({
    spent: testAmounts.hiddenSpent,
    budgeted: 200,
    balance: 0,
  }),
}));
vi.mock('./ExpenseProgress', () => ({ ExpenseProgress: () => null }));
vi.mock('./IncomeProgress', () => ({ IncomeProgress: () => null }));

describe('tracking budget summary totals', () => {
  beforeEach(() => {
    testAmounts.spent = -100;
    testAmounts.hiddenSpent = -100;
  });

  it('displays expenses as positive spending', () => {
    render(<ExpenseTotal />);
    expect(
      screen.getByText('Variable Expenses').parentElement?.parentElement,
    ).toHaveTextContent('100 of 200');
    expect(
      screen.getByText('Variable Expenses').parentElement?.parentElement,
    ).not.toHaveTextContent('-100');
  });

  it('displays hidden expenses as positive spending', () => {
    render(<HiddenExpenseTotal month="2026-10" />);
    expect(screen.getByText('Fixed Expenses').parentElement).toHaveTextContent(
      '100 of 200',
    );
    expect(
      screen.getByText('Fixed Expenses').parentElement,
    ).not.toHaveTextContent('-100');
  });

  it('keeps income amounts unchanged', () => {
    render(<IncomeTotal />);
    expect(
      screen.getByText('Income').parentElement?.parentElement,
    ).toHaveTextContent('300 of 400');
  });

  it('displays zero expenses without a negative sign', () => {
    testAmounts.spent = 0;
    testAmounts.hiddenSpent = 0;
    render(
      <>
        <ExpenseTotal />
        <HiddenExpenseTotal month="2026-10" />
      </>,
    );
    expect(
      screen.getByText('Variable Expenses').parentElement?.parentElement,
    ).toHaveTextContent('0 of 200');
    expect(screen.getByText('Fixed Expenses').parentElement).toHaveTextContent(
      '0 of 200',
    );
    expect(screen.queryByText('-0')).not.toBeInTheDocument();
  });
});
