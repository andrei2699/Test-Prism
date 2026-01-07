import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TreeWidget } from './tree-widget';
import { FilterState } from './test-filter-input/test-filter-input.component';
import { Test } from '../../../types/TestReport';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTreeNodeHarness } from '@angular/material/tree/testing';

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
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
