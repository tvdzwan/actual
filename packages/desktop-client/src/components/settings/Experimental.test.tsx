import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { useFeatureFlag } from '#hooks/useFeatureFlag';
import { useSyncedPref } from '#hooks/useSyncedPref';
import { TestProviders } from '#mocks';

import { ExperimentalFeatures } from './Experimental';

vi.mock('#hooks/useFeatureFlag', () => ({
  useFeatureFlag: vi.fn(),
}));

vi.mock('#hooks/useSyncedPref', () => ({
  useSyncedPref: vi.fn(),
}));

vi.mock('#hooks/useSyncServerStatus', () => ({
  useSyncServerStatus: vi.fn(() => 'no-server'),
}));

const setPref = vi.fn();

function mockFeatureFlag(name: string, value: boolean) {
  vi.mocked(useFeatureFlag).mockImplementation(flag =>
    flag === name ? value : false,
  );
}

function mockSyncedPref(prefName: string, value: string) {
  vi.mocked(useSyncedPref).mockImplementation(pref => {
    if (pref === prefName) {
      return [value, setPref];
    }
    return ['false', setPref];
  });
}

describe('ExperimentalFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFeatureFlag('salaryDay', true);
    mockSyncedPref('flags.salaryDay', 'true');
    mockSyncedPref('salary-day', '25');
  });

  it('shows the salary-day experimental option and saved day value', () => {
    render(
      <TestProviders>
        <ExperimentalFeatures />
      </TestProviders>,
    );

    expect(screen.getByText('Salary-day budgeting')).toBeInTheDocument();
    expect(screen.getByLabelText('Exact salary day')).toHaveValue(25);
  });
});
