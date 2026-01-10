import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeWidget, TreeWidgetParameters } from './tree-widget';
import { FilterState } from './test-filter-input/test-filter-input.component';
import { Test } from '../../../types/TestReport';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTreeNodeHarness } from '@angular/material/tree/testing';
import { TestColors } from '../../../types/Layout';

const tests: Test[] = [
  {
    name: 'should display a success message',
    lastExecutionType: 'SUCCESS',
    durationMs: 100,
    path: 'Login.UI',
  },
  {
    name: 'should display an error message on failed login',
    lastExecutionType: 'FAILURE',
    durationMs: 200,
    path: 'Login.UI',
  },
  {
    name: 'should fetch user data',
    lastExecutionType: 'SUCCESS',
    durationMs: 300,
    path: 'User.API',
  },
  {
    name: 'should timeout when fetching user data',
    lastExecutionType: 'SKIPPED',
    durationMs: 0,
    path: 'User.API',
  },
];
const parameters: TreeWidgetParameters = {
  strategy: 'folder',
  sortStrategies: ['name'],
};

describe('TreeWidget', () => {
  let component: TreeWidget;
  let fixture: ComponentFixture<TreeWidget>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeWidget],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeWidget);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tests', tests);
    fixture.componentRef.setInput('parameters', parameters);
    fixture.componentRef.setInput('colors', {
      SUCCESS: 'green',
      FAILURE: 'red',
      SKIPPED: 'yellow',
      ERROR: 'orange',
    } satisfies TestColors);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should not display a title when not provided', () => {
    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement).toBeNull();
  });

  it('should display a title when provided', () => {
    const newParameters: TreeWidgetParameters = {
      ...parameters,
      title: 'Test Title',
    };
    fixture.componentRef.setInput('parameters', newParameters);
    fixture.detectChanges();

    const titleElement = fixture.nativeElement.querySelector('h2');
    expect(titleElement).not.toBeNull();
    expect(titleElement.textContent).toBe('Test Title');
  });

  describe('onFilterChange', () => {
    it('should filter by name', async () => {
      const filterState: FilterState = {
        name: 'success',
        statuses: [],
      };
      component.onFilterChange(filterState);
      fixture.detectChanges();

      const nodes = await loader.getAllHarnesses(MatTreeNodeHarness);
      expect(nodes.length).toBe(1);
      expect(await nodes[0].getText()).toContain('should display a success message');
    });

    it('should filter by status', async () => {
      const filterState: FilterState = {
        name: '',
        statuses: ['FAILURE'],
      };
      component.onFilterChange(filterState);
      fixture.detectChanges();

      const nodes = await loader.getAllHarnesses(MatTreeNodeHarness);
      expect(nodes.length).toBe(1);
      expect(await nodes[0].getText()).toContain('should display an error message on failed login');
    });

    it('should filter by name and status', async () => {
      const filterState: FilterState = {
        name: 'user',
        statuses: ['SUCCESS'],
      };
      component.onFilterChange(filterState);
      fixture.detectChanges();

      const nodes = await loader.getAllHarnesses(MatTreeNodeHarness);
      expect(nodes.length).toBe(1);
      expect(await nodes[0].getText()).toContain('should fetch user data');
    });

    it('should return all tests when filter is empty', async () => {
      const filterState: FilterState = {
        name: '',
        statuses: [],
      };
      component.onFilterChange(filterState);
      fixture.detectChanges();

      const nodes = await loader.getAllHarnesses(MatTreeNodeHarness);
      expect(nodes.length).toBe(4);
    });
  });

  describe('Test Details Drawer', () => {
    it('should not show drawer initially', () => {
      const drawer = fixture.nativeElement.querySelector('app-test-details-drawer');
      expect(drawer).toBeNull();
    });

    it('should show drawer when test is selected', () => {
      component.onTestSelected(tests[0]);
      fixture.detectChanges();

      const drawer = fixture.nativeElement.querySelector('app-test-details-drawer');
      expect(drawer).toBeTruthy();
    });

    it('should close drawer when closeDrawer is called', () => {
      component.onTestSelected(tests[0]);
      fixture.detectChanges();

      component.closeDrawer();
      fixture.detectChanges();

      const drawer = fixture.nativeElement.querySelector('app-test-details-drawer');
      expect(drawer).toBeNull();
    });
  });
});
