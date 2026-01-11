import { Injectable } from '@angular/core';
import { Test } from '../types/TestReport';
import { Condition, DataFilter, FieldValue } from '../types/Widget';

@Injectable({
  providedIn: 'root',
})
export class DataFilterService {
  applyFilter(tests: Test[], filter: DataFilter | null | undefined): Test[] {
    if (!filter || !filter.conditions || filter.conditions.length === 0) {
      return tests;
    }

    return tests.filter(test => this.evaluateFilter(test, filter));
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
    const testValue = this.getTestFieldValue(test, field);

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
      case '>=':
      case '>':
      case '<':
      case '<=':
        return this.compare(testValue, operator, value);
      default:
        return false;
    }
  }

  private getTestFieldValue(obj: object, field: string): FieldValue | undefined {
    if (field.startsWith('executions.')) {
      const executionField = field.split('.')[1];
      const test = obj as Test;
      const lastExecution = test.executions[test.executions.length - 1];
      if (!lastExecution) {
        return undefined;
      }
      return (lastExecution as any)[executionField];
    }

    let current: any = obj;
    for (const part of field.split('.')) {
      if (current == null) {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  private isEqual(a: FieldValue | undefined, b: FieldValue | undefined): boolean {
    if (a === b) {
      return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) {
        return false;
      }
      return a.every((val, index) => this.isEqual(val, b[index]));
    }

    return a == null && b == null;
  }

  private compare(
    a: FieldValue | undefined,
    operator: '>=' | '>' | '<' | '<=',
    b: FieldValue,
  ): boolean {
    if (typeof a !== 'number' || typeof b !== 'number') {
      return false;
    }

    switch (operator) {
      case '>=':
        return a >= b;
      case '>':
        return a > b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
    }
  }
}
