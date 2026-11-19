import { useEffect, useState } from 'react';

import * as monthUtils from '@actual-app/core/shared/months';
import type { CategoryEntity } from '@actual-app/core/types/models';

import { useSpreadsheet } from '#hooks/useSpreadsheet';

export type HiddenCategoryTotals = {
  budgeted: number;
  spent: number;
  balance: number;
};

export function getHiddenCategoryAdjustment(
  budgetType: 'envelope' | 'tracking',
  showHiddenCategories: boolean,
) {
  if (budgetType === 'tracking') {
    return showHiddenCategories ? 1 : 0;
  }

  return showHiddenCategories ? 0 : -1;
}

const EMPTY_TOTALS: HiddenCategoryTotals = {
  budgeted: 0,
  spent: 0,
  balance: 0,
};

const CATEGORY_TOTAL_FIELDS = [
  ['budget', 'budgeted'],
  ['sum-amount', 'spent'],
  ['leftover', 'balance'],
] as const;

export function useHiddenCategoryTotals(
  month: string,
  categories: CategoryEntity[],
) {
  const spreadsheet = useSpreadsheet();
  const sheetName = monthUtils.sheetForMonth(month);
  const hiddenCategoryIdsKey = JSON.stringify(
    categories.filter(category => category.hidden).map(category => category.id),
  );
  const [categoryTotals, setCategoryTotals] = useState<
    Record<string, HiddenCategoryTotals>
  >({});

  useEffect(() => {
    const categoryIds: string[] = JSON.parse(hiddenCategoryIdsKey);
    const unbinds: Array<() => void> = [];

    setCategoryTotals({});

    for (const categoryId of categoryIds) {
      for (const [field, totalName] of CATEGORY_TOTAL_FIELDS) {
        unbinds.push(
          spreadsheet.bind(sheetName, `${field}-${categoryId}`, ({ value }) => {
            const numericValue =
              typeof value === 'number' && Number.isFinite(value) ? value : 0;

            setCategoryTotals(previous => {
              const previousTotals = previous[categoryId] ?? EMPTY_TOTALS;
              if (previousTotals[totalName] === numericValue) {
                return previous;
              }

              return {
                ...previous,
                [categoryId]: {
                  ...previousTotals,
                  [totalName]: numericValue,
                },
              };
            });
          }),
        );
      }
    }

    return () => unbinds.forEach(unbind => unbind());
  }, [hiddenCategoryIdsKey, sheetName, spreadsheet]);

  return Object.values(categoryTotals).reduce(
    (totals, categoryTotals) => ({
      budgeted: totals.budgeted + categoryTotals.budgeted,
      spent: totals.spent + categoryTotals.spent,
      balance: totals.balance + categoryTotals.balance,
    }),
    EMPTY_TOTALS,
  );
}
