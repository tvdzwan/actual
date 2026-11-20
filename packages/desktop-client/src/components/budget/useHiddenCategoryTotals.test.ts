import type { CategoryGroupEntity } from '@actual-app/core/types/models';
import { act, renderHook } from '@testing-library/react';

import {
  getHiddenCategoryAdjustment,
  getTrackingSavingsAdjustment,
  getTrackingSavingsCategories,
  useHiddenExpenseTotals,
  useTrackingSavingsAdjustment,
} from './useHiddenCategoryTotals';

const testState = vi.hoisted(() => ({
  groups: new Array<CategoryGroupEntity>(),
  callbacks: new Map<string, (result: { value: number }) => void>(),
}));

vi.mock('#hooks/useCategories', () => ({
  useCategories: () => ({ data: { grouped: testState.groups } }),
}));

vi.mock('#hooks/useSpreadsheet', () => {
  const spreadsheet = {
    bind: (
      sheetName: string,
      field: string,
      callback: (result: { value: number }) => void,
    ) => {
      const key = `${sheetName}!${field}`;
      testState.callbacks.set(key, callback);
      return () => testState.callbacks.delete(key);
    },
  };
  return { useSpreadsheet: () => spreadsheet };
});

describe('useTrackingSavingsAdjustment', () => {
  it('updates when hidden category values and visibility change', () => {
    const category = {
      id: 'hidden',
      name: 'Hidden',
      group: 'expenses',
      hidden: true,
    };
    const group = { id: 'expenses', name: 'Expenses', categories: [category] };
    testState.groups = [group];
    const { result, rerender, unmount } = renderHook(() =>
      useTrackingSavingsAdjustment('2026-10'),
    );

    act(() => {
      testState.callbacks.get('budget202610!budget-hidden')?.({ value: 3000 });
      testState.callbacks.get('budget202610!sum-amount-hidden')?.({
        value: -4000,
      });
    });
    expect(result.current).toEqual({ projected: -3000, actual: -4000 });

    testState.groups = [
      { ...group, categories: [{ ...category, hidden: false }] },
    ];
    rerender();
    expect(result.current).toEqual({ projected: 0, actual: 0 });
    expect(testState.callbacks.size).toBe(0);
    unmount();
  });
});

describe('useHiddenExpenseTotals', () => {
  it('includes hidden categories and categories in hidden expense groups', () => {
    const hiddenCategory = {
      id: 'hidden',
      name: 'Hidden',
      group: 'expenses',
      hidden: true,
    };
    const hiddenGroupCategory = {
      id: 'hidden-group-category',
      name: 'Hidden group category',
      group: 'hidden-group',
    };
    testState.groups = [
      {
        id: 'expenses',
        name: 'Expenses',
        categories: [hiddenCategory],
      },
      {
        id: 'hidden-group',
        name: 'Hidden group',
        hidden: true,
        categories: [hiddenGroupCategory],
      },
    ];
    const { result, unmount } = renderHook(() =>
      useHiddenExpenseTotals('2026-10'),
    );

    act(() => {
      for (const [categoryId, budgeted, spent, balance] of [
        ['hidden', 10, -4, 6],
        ['hidden-group-category', 20, -8, 12],
      ] as const) {
        testState.callbacks
          .get(`budget202610!budget-${categoryId}`)
          ?.({ value: budgeted });
        testState.callbacks
          .get(`budget202610!sum-amount-${categoryId}`)
          ?.({ value: spent });
        testState.callbacks
          .get(`budget202610!leftover-${categoryId}`)
          ?.({ value: balance });
      }
    });

    expect(result.current).toEqual({ budgeted: 30, spent: -12, balance: 18 });
    unmount();
  });
});

describe('getTrackingSavingsCategories', () => {
  it('selects hidden income and expenses, including all categories in hidden expense groups', () => {
    const visibleIncome = { id: 'income', name: 'Income', group: 'income' };
    const hiddenIncome = {
      ...visibleIncome,
      id: 'hidden-income',
      hidden: true,
    };
    const visibleExpense = { id: 'expense', name: 'Expense', group: 'expense' };
    const hiddenExpense = {
      ...visibleExpense,
      id: 'hidden-expense',
      hidden: true,
    };
    const hiddenGroupExpense = {
      id: 'hidden-group-expense',
      name: 'Expense',
      group: 'hidden-group',
    };
    const hiddenInHiddenGroup = {
      ...hiddenGroupExpense,
      id: 'hidden-in-hidden-group',
      hidden: true,
    };
    const groups = [
      {
        id: 'income',
        name: 'Income',
        is_income: true,
        categories: [visibleIncome, hiddenIncome],
      },
      {
        id: 'expense',
        name: 'Expenses',
        categories: [visibleExpense, hiddenExpense],
      },
      {
        id: 'hidden-group',
        name: 'Hidden',
        hidden: true,
        categories: [hiddenGroupExpense, hiddenInHiddenGroup],
      },
    ];

    expect(getTrackingSavingsCategories(groups)).toEqual({
      income: [hiddenIncome],
      expenses: [hiddenExpense, hiddenGroupExpense, hiddenInHiddenGroup],
    });
    expect(
      getTrackingSavingsCategories(
        groups.map(group => ({
          ...group,
          hidden: false,
          categories: group.categories.map(category => ({
            ...category,
            hidden: false,
          })),
        })),
      ),
    ).toEqual({ income: [], expenses: [] });
  });
});

describe('getTrackingSavingsAdjustment', () => {
  it('includes hidden income and expenses in projected and actual savings', () => {
    expect(
      getTrackingSavingsAdjustment(
        { budgeted: 10000, spent: 12000, balance: 0 },
        { budgeted: 3000, spent: -4000, balance: 0 },
      ),
    ).toEqual({ projected: 7000, actual: 8000 });
  });
});

describe('getHiddenCategoryAdjustment', () => {
  it('includes hidden tracking categories only when they are shown', () => {
    expect(getHiddenCategoryAdjustment('tracking', false)).toBe(0);
    expect(getHiddenCategoryAdjustment('tracking', true)).toBe(1);
  });

  it('excludes hidden envelope categories only when they are not shown', () => {
    expect(getHiddenCategoryAdjustment('envelope', false)).toBe(-1);
    expect(getHiddenCategoryAdjustment('envelope', true)).toBe(0);
  });
});
