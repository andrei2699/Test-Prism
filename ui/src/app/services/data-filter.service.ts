import { Injectable } from '@angular/core';
import { Test } from '../types/TestReport';
import { Condition, DataFilter, FieldValue } from '../types/Widget';

@Injectable({
  providedIn: 'root',
})
export class DataFilterService {
  applyFilter(tests: Test[], filter: DataFilter | null | undefined): Test[] {
    if (this.isFilterEmpty(filter)) {
      return tests;
    }

    return tests.filter(test => this.evaluateFilter(test, filter));
  }

  private isFilterEmpty(filter: DataFilter | null | undefined): filter is null | undefined {
    return !filter || !filter.conditions || filter.conditions.length === 0;
  }

  private evaluateFilter(test: Test, filter: DataFilter): boolean {
    if (filter.operator === 'AND') {
      return filter.conditions.every(condition => this.evaluateCondition(test, condition));
    }

    return filter.conditions.some(condition => this.evaluateCondition(test, condition));
  }

  private evaluateCondition(test: Test, condition: DataFilter | Condition): boolean {
    if ('conditions' in condition) {
      return this.evaluateFilter(test, condition);
    }

    const { field, operator, value } = condition;
    const testValue = this.getTestField(test, field);

    switch (operator) {
      case '==':
      case 'equals':
        return this.isEqual(testValue, value);
      case '!=':
      case 'not equals':
        return !this.isEqual(testValue, value);
      case 'in':
        if (!Array.isArray(value)) {
          return false;
        }
        return value.some(v => this.isEqual(testValue, v));
      case 'not in':
        if (!Array.isArray(value)) {
          return true;
        }
        return !value.some(v => this.isEqual(testValue, v));
      case 'contains':
        if (typeof testValue === 'string' && typeof value === 'string') {
          return testValue.includes(value);
        }
        if (Array.isArray(testValue)) {
          return testValue.some(v => this.isEqual(v, value));
        }
        return false;
      default:
        return false;
    }
  }

  private getTestField(obj: object, field: string): FieldValue | undefined {
    return field.split('.').reduce((acc: FieldValue | undefined, part: string) => {
      if (acc === null || acc === undefined) {
        return undefined;
      }
      if (typeof acc === 'object' && !Array.isArray(acc)) {
        return (acc as { [key: string]: FieldValue })[part];
      }
      return undefined;
    }, obj);
  }

  private isEqual(a: FieldValue | undefined, b: FieldValue): boolean {
    if (a === b) {
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((val, index) => this.isEqual(val, b[index]));
    }

    return a === null && b === null;
  }
}
