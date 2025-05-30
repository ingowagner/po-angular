import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PoThemeA11yEnum, PoThemeService } from '../../../services';
import { PoRadioComponent } from './po-radio.component';

describe('PoRadioComponent', () => {
  let component: PoRadioComponent;
  let fixture: ComponentFixture<PoRadioComponent>;
  let nativeElement: any;
  let labelField: any;
  let poThemeServiceMock: jasmine.SpyObj<PoThemeService>;

  beforeEach(() => {
    poThemeServiceMock = jasmine.createSpyObj('PoThemeService', ['getA11yLevel', 'getA11yDefaultSize']);

    TestBed.configureTestingModule({
      declarations: [PoRadioComponent],
      providers: [{ provide: PoThemeService, useValue: poThemeServiceMock }]
    });
    fixture = TestBed.createComponent(PoRadioComponent);
    component = fixture.componentInstance;

    nativeElement = fixture.debugElement.nativeElement;
    fixture.debugElement.injector.get(NG_VALUE_ACCESSOR);

    fixture.detectChanges();
    labelField = document.getElementsByClassName('po-label');
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should create a po-label for po-radio', () => {
    expect(labelField).toBeTruthy();
  });

  describe('Properties:', () => {
    describe('p-size', () => {
      it('should set property with valid values for accessibility level is AA', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);

        component.size = 'small';
        expect(component.size).toBe('small');

        component.size = 'medium';
        expect(component.size).toBe('medium');

        component.size = 'large';
        expect(component.size).toBe('large');
      });

      it('should set property with valid values for accessibility level is AAA', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AAA);

        component.size = 'small';
        expect(component.size).toBe('medium');

        component.size = 'medium';
        expect(component.size).toBe('medium');

        component.size = 'large';
        expect(component.size).toBe('large');
      });

      it('should return small when accessibility is AA and getA11yDefaultSize is small', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);
        poThemeServiceMock.getA11yDefaultSize.and.returnValue('small');

        component['_size'] = undefined;
        expect(component.size).toBe('small');
      });

      it('should return medium when accessibility is AA and getA11yDefaultSize is medium', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);
        poThemeServiceMock.getA11yDefaultSize.and.returnValue('medium');

        component['_size'] = undefined;
        expect(component.size).toBe('medium');
      });

      it('should return medium when accessibility is AAA, regardless of getA11yDefaultSize', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AAA);
        component['_size'] = undefined;
        expect(component.size).toBe('medium');
      });
    });
  });

  describe('Methods:', () => {
    it('focus: should call `focus` of radio', () => {
      component.radioInput = {
        nativeElement: {
          focus: () => {}
        }
      };

      spyOn(component.radioInput.nativeElement, 'focus');

      component.focus();

      spyOn(component, 'onKeyup');

      component.onKeyup();

      expect(component.radioInput.nativeElement.focus).toHaveBeenCalled();
      expect(component.onKeyup).toHaveBeenCalled();
    });

    it('focus: should`t call `focus` of radio if `disabled`', () => {
      component.radioInput = {
        nativeElement: {
          focus: () => {}
        }
      };
      component.disabled = true;

      spyOn(component.radioInput.nativeElement, 'focus');

      component.focus();

      expect(component.radioInput.nativeElement.focus).not.toHaveBeenCalled();
    });

    it('onBlur: should call `onTouched` on blur', () => {
      component['onTouched'] = value => {};

      spyOn(component, <any>'onTouched');

      component.onBlur();

      expect(component['onTouched']).toHaveBeenCalledWith();
    });

    it('onBlur: shouldn´t throw error if onTouched is falsy', () => {
      component['onTouched'] = null;

      const fnError = () => component.onBlur();

      expect(fnError).not.toThrow();
    });

    it('changeValue: shouldn`t call `change.emit` and `updateModel` if radio value is false', () => {
      component.value = true;

      spyOn(component.change, 'emit');
      spyOn(component, <any>'updateModel');

      component.changeValue(false);
      expect(component['updateModel']).not.toHaveBeenCalled();
      expect(component.change.emit).not.toHaveBeenCalled();
    });

    it('changeValue: should call `change.emit` and `updateModel` if radio value is true', () => {
      component.value = false;

      spyOn(component.change, 'emit');
      spyOn(component, <any>'updateModel');

      component.changeValue(true);
      expect(component['updateModel']).toHaveBeenCalledWith(true);
      expect(component.change.emit).toHaveBeenCalledWith(true);
    });

    it('onWriteValue: should updated value and call `markForCheck`', () => {
      const expectedValue = false;

      component.value = true;

      component['changeDetector'] = <any>{ markForCheck: () => {} };
      spyOn(component['changeDetector'], 'markForCheck');

      component.onWriteValue(expectedValue);

      expect(component['changeDetector'].markForCheck).toHaveBeenCalled();
      expect(component.value).toBe(expectedValue);
    });

    it('onWriteValue: shouldn`t updated value if new value equals old value', () => {
      const expectedValue = true;

      component.value = expectedValue;

      component['changeDetector'] = <any>{ markForCheck: () => {} };

      spyOn(component['changeDetector'], 'markForCheck');

      component.onWriteValue(expectedValue);

      expect(component['changeDetector'].markForCheck).not.toHaveBeenCalled();
      expect(component.value).toBe(expectedValue);
    });

    it('eventClick: shouldn`t call changeValue if disabled is true', () => {
      component.disabled = true;

      spyOn(component, 'changeValue');

      component.eventClick();

      expect(component.changeValue).not.toHaveBeenCalled();
    });

    it('eventClick: should call changeValue', () => {
      component.disabled = false;

      spyOn(component, 'changeValue');

      component.eventClick();

      expect(component.changeValue).toHaveBeenCalled();
    });

    it('eventClick: should emit changeSelected', () => {
      component.disabled = false;

      spyOn(component.changeSelected, 'emit');

      component.eventClick();

      expect(component.changeSelected.emit).toHaveBeenCalled();
    });

    it('focusOut: should remove attibute focus from label element', () => {
      component.radio.nativeElement.setAttribute('focus', '');

      component.focusOut();

      expect(component.radio.nativeElement.hasAttribute('focus')).toBeTrue();
    });

    it('onKeydown: should remove attibute focus from label element', () => {
      component.radio.nativeElement.setAttribute('focus', '');

      component.onKeydown();

      expect(component.radio.nativeElement.hasAttribute('focus')).toBeTrue();
    });

    it('onKeyup: should remove attibute focus from label element', () => {
      component.radio.nativeElement.setAttribute('focus', '');

      component.onKeyup();

      expect(component.radio.nativeElement.hasAttribute('focus')).toBeTrue();
    });

    describe('onKeyDown:', () => {
      let fakeEvent;

      beforeEach(() => {
        fakeEvent = {
          keyCode: 32,
          which: 32
        };
      });

      it('should call preventDefault and eventClick when keycode and which equal to 32', () => {
        spyOn(component, 'eventClick');

        component.onKeyDown(fakeEvent);

        expect(component.eventClick).toHaveBeenCalled();
      });

      it('should call preventDefault and eventClick when keycode equal to 32', () => {
        fakeEvent.which = 12;
        spyOn(component, 'eventClick');

        component.onKeyDown(fakeEvent);

        expect(component.eventClick).toHaveBeenCalled();
      });

      it('should not call preventDefault and eventClick when keycode and which not equal to 32', () => {
        fakeEvent.which = 12;
        fakeEvent.keyCode = 12;
        spyOn(component, 'eventClick');

        component.onKeyDown(fakeEvent);

        expect(component.eventClick).not.toHaveBeenCalled();
      });
    });
  });
});
