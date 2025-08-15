import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaryGroupingComponent } from './salary-grouping.component';
import { CommonModule } from '@angular/common';

describe('SalaryGroupingComponent', () => {
  let component: SalaryGroupingComponent;
  let fixture: ComponentFixture<SalaryGroupingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SalaryGroupingComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalaryGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.selectedFile).toBeNull();
    expect(component.isProcessing).toBeFalse();
    expect(component.processingMessage).toBe('');
    expect(component.fileName).toBe('');
  });

  describe('File Handling', () => {
    it('should handle file selection', () => {
      const mockFile = new File([''], 'test.csv', { type: 'text/csv' });
      const event = {
        target: {
          files: [mockFile]
        }
      } as unknown as Event;

      component.onFileSelected(event);
      expect(component.selectedFile).toBe(mockFile);
      expect(component.fileName).toBe('test.csv');
    });

    it('should handle empty file selection', () => {
      const event = {
        target: {
          files: []
        }
      } as unknown as Event;

      component.onFileSelected(event);
      expect(component.selectedFile).toBeNull();
      expect(component.fileName).toBe('');
    });
  });
});