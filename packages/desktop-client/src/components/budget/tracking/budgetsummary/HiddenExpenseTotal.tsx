import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

import {
  useHiddenCategoryTotals,
  useHiddenExpenseCategories,
} from '#components/budget/useHiddenCategoryTotals';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';

import { fraction } from './fraction';
import { PieProgress } from './PieProgress';

type HiddenExpenseTotalProps = {
  month: string;
};

export function HiddenExpenseTotal({ month }: HiddenExpenseTotalProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const hiddenExpenseCategories = useHiddenExpenseCategories();
  const hiddenTotals = useHiddenCategoryTotals(
    month,
    hiddenExpenseCategories,
    true,
  );

  if (hiddenExpenseCategories.length === 0) {
    return null;
  }

  const totalSpent = Math.max(-hiddenTotals.spent, 0);
  const totalBudgeted = hiddenTotals.budgeted;
  const isOverBudget = totalSpent > totalBudgeted;
  const progress = isOverBudget
    ? fraction(totalSpent - totalBudgeted, totalBudgeted)
    : fraction(totalSpent, totalBudgeted);

  return (
    <View
      style={{
        lineHeight: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: 14,
      }}
    >
      <PieProgress
        progress={progress}
        color={isOverBudget ? theme.numberNegative : theme.numberPositive}
        backgroundColor={
          isOverBudget ? theme.errorBackground : theme.budgetCurrentMonth
        }
        style={{ width: 20, height: 20 }}
      />
      <View style={{ marginLeft: 10, ...styles.tnum }}>
        <Text style={{ color: theme.pageTextLight }}>
          {t('Fixed Expenses')}
        </Text>
        <Text>
          <PrivacyFilter>
            {format(-hiddenTotals.spent || 0, 'financial')}
          </PrivacyFilter>
          <Text style={{ color: theme.pageTextLight, fontStyle: 'italic' }}>
            {' '}
            <Trans>of</Trans>{' '}
            <PrivacyFilter>{format(totalBudgeted, 'financial')}</PrivacyFilter>
          </Text>
        </Text>
      </View>
    </View>
  );
}
