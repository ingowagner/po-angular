import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  forwardRef,
  ViewChild
} from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { uuid } from '../../../utils/util';

import { PoThemeService } from '../../../services';
import { PoInputGeneric } from '../po-input-generic/po-input-generic';

/**
 * @docsExtends PoInputBaseComponent
 *
 * @example
 *
 * <example name="po-input-basic" title="PO Input Basic">
 *  <file name="sample-po-input-basic/sample-po-input-basic.component.html"> </file>
 *  <file name="sample-po-input-basic/sample-po-input-basic.component.ts"> </file>
 * </example>
 *
 * <example name="po-input-labs" title="PO Input Labs">
 *  <file name="sample-po-input-labs/sample-po-input-labs.component.html"> </file>
 *  <file name="sample-po-input-labs/sample-po-input-labs.component.ts"> </file>
 * </example>
 *
 * <example name="po-input-reactive-form" title="PO Input - Reactive Form">
 *  <file name="sample-po-input-reactive-form/sample-po-input-reactive-form.component.html"> </file>
 *  <file name="sample-po-input-reactive-form/sample-po-input-reactive-form.component.ts"> </file>
 * </example>
 */
@Component({
  selector: 'po-input',
  templateUrl: './po-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PoInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PoInputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class PoInputComponent extends PoInputGeneric {
  @ViewChild('inp', { static: true }) inp: ElementRef;

  id = `po-input[${uuid()}]`;

  /* istanbul ignore next */
  constructor(
    el: ElementRef,
    cd: ChangeDetectorRef,
    protected poThemeService: PoThemeService
  ) {
    super(el, cd, poThemeService);
  }

  extraValidation(c: AbstractControl): { [key: string]: any } {
    return null;
  }
}
