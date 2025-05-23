import { Directive } from '@angular/core';

import { fakeAsync, tick } from '@angular/core/testing';

import { expectPropertiesValues } from '../../../util-test/util-expect.spec';
import { poLocaleDefault } from './../../../services/po-language/po-language.constant';
import { PoLanguageService } from './../../../services/po-language/po-language.service';
import * as UtilFunctions from './../../../utils/util';

import { PoDisclaimer } from '../../po-disclaimer/po-disclaimer.interface';

import { PoThemeA11yEnum, PoThemeService } from '../../../services';
import { PoPageListBaseComponent, poPageListLiteralsDefault } from './po-page-list-base.component';

@Directive()
class PoPageListComponent extends PoPageListBaseComponent {
  setDropdownActions() {}
}

describe('PoPageListBaseComponent:', () => {
  let languageService: PoLanguageService;
  let component: PoPageListComponent;
  let poThemeServiceMock: jasmine.SpyObj<PoThemeService>;

  beforeEach(() => {
    poThemeServiceMock = jasmine.createSpyObj('PoThemeService', ['getA11yLevel', 'getA11yDefaultSize']);

    languageService = new PoLanguageService();
    component = new PoPageListComponent(languageService, poThemeServiceMock);
  });

  it('should be created', () => {
    expect(component instanceof PoPageListBaseComponent).toBeTruthy();
  });

  describe('Properties:', () => {
    describe('p-literals:', () => {
      it('should be in portuguese if `getShortLanguage` return an unsupported language.', () => {
        component['language'] = 'zw';

        component.literals = {};

        expect(component.literals).toEqual(poPageListLiteralsDefault[poLocaleDefault]);
      });

      it('should be in portuguese if `getShortLanguage` return `pt`.', () => {
        component['language'] = 'pt';

        component.literals = {};

        expect(component.literals).toEqual(poPageListLiteralsDefault.pt);
      });

      it('should be in english if `getShortLanguage` return `en`.', () => {
        component['language'] = 'en';

        component.literals = {};

        expect(component.literals).toEqual(poPageListLiteralsDefault.en);
      });

      it('should be in spanish if `getShortLanguage` return `es`.', () => {
        component['language'] = 'es';

        component.literals = {};

        expect(component.literals).toEqual(poPageListLiteralsDefault.es);
      });

      it('should be in russian if `getShortLanguage` return `ru`.', () => {
        component['language'] = 'ru';

        component.literals = {};

        expect(component.literals).toEqual(poPageListLiteralsDefault.ru);
      });

      it('should accept custom literals.', () => {
        spyOn(UtilFunctions, <any>'getShortBrowserLanguage').and.returnValue(poLocaleDefault);

        const customLiterals = poPageListLiteralsDefault[poLocaleDefault];

        // Custom some literals
        customLiterals.otherActions = 'Other actions';

        component.literals = customLiterals;

        expect(component.literals).toEqual(customLiterals);
      });

      it('should update property with default literals if is setted with invalid values.', () => {
        const invalidValues = [null, undefined, false, true, '', 'literals', 0, 10, [], [1, 2], () => {}];

        component['language'] = poLocaleDefault;

        expectPropertiesValues(component, 'literals', invalidValues, poPageListLiteralsDefault[poLocaleDefault]);
      });
    });

    it('should return object when set disclaimerGroup with undefined', () => {
      component.disclaimerGroup = undefined;

      expect(typeof component.disclaimerGroup === 'object').toBeTruthy();
    });

    it('should return object when set disclaimerGroup with null', () => {
      component.disclaimerGroup = null;

      expect(typeof component.disclaimerGroup === 'object').toBeTruthy();
    });

    it('should set disclaimer group with value', () => {
      const disclaimers: Array<PoDisclaimer> = [
        { value: 'hotel', label: 'Hotel', property: 'hotel' },
        { value: '500', label: 'Price', property: 'Preço' },
        { value: 'north', label: 'Region', property: 'region' }
      ];
      component.disclaimerGroup = { change: () => {}, disclaimers, title: 'teste' };

      expect(component.disclaimerGroup).toBeTruthy();
    });

    it('p-actions: should update property `p-actions` to empty if is invalid values.', () => {
      const invalidValues = [undefined, null, '', true, false, 0, 1, 'string', [], {}];

      expectPropertiesValues(component, 'actions', invalidValues, []);
    });

    it('p-actions: should update property `p-actions` if is valid values.', () => {
      const validValues = [[{ label: 'Share', icon: 'po-icon-share' }]];

      expectPropertiesValues(component, 'actions', validValues, validValues);
    });

    describe('p-components-size', () => {
      it('should set property with valid values for accessibility level is AA', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);

        component.componentsSize = 'small';
        expect(component.componentsSize).toBe('small');

        component.componentsSize = 'medium';
        expect(component.componentsSize).toBe('medium');
      });

      it('should set property with valid values for accessibility level is AAA', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AAA);

        component.componentsSize = 'small';
        expect(component.componentsSize).toBe('medium');

        component.componentsSize = 'medium';
        expect(component.componentsSize).toBe('medium');
      });

      it('should return small when accessibility is AA and getA11yDefaultSize is small', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);
        poThemeServiceMock.getA11yDefaultSize.and.returnValue('small');

        component['_componentsSize'] = undefined;
        expect(component.componentsSize).toBe('small');
      });

      it('should return medium when accessibility is AA and getA11yDefaultSize is medium', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AA);
        poThemeServiceMock.getA11yDefaultSize.and.returnValue('medium');

        component['_componentsSize'] = undefined;
        expect(component.componentsSize).toBe('medium');
      });

      it('should return medium when accessibility is AAA, regardless of getA11yDefaultSize', () => {
        poThemeServiceMock.getA11yLevel.and.returnValue(PoThemeA11yEnum.AAA);
        component['_componentsSize'] = undefined;
        expect(component.componentsSize).toBe('medium');
      });
    });

    it('p-title: should call recalculateHeaderSize', fakeAsync(() => {
      component.poPageContent = <any>{
        recalculateHeaderSize: () => {}
      };

      spyOn(component.poPageContent, 'recalculateHeaderSize');

      component.title = 'teste';

      tick();

      expect(component.poPageContent.recalculateHeaderSize).toHaveBeenCalled();
    }));
  });
});
