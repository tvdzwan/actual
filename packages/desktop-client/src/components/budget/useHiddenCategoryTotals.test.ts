import { getHiddenCategoryAdjustment } from './useHiddenCategoryTotals';

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