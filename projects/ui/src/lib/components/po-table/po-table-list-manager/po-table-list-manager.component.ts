import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, Optional, Output, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { PoFieldSize } from '../../../enums/po-field-size.enum';
import { PoThemeService } from '../../../services';
import { poLocaleDefault } from '../../../services/po-language/po-language.constant';
import { PoLanguageService } from '../../../services/po-language/po-language.service';
import { convertToBoolean, getDefaultSize, validateSize } from '../../../utils/util';
import { PoCheckboxGroupComponent } from '../../po-field/po-checkbox-group/po-checkbox-group.component';
import { AnimaliaIconDictionary, ICONS_DICTIONARY } from '../../po-icon';
import { PoTableColumn } from '../interfaces/po-table-column.interface';

export const poTableListManagerLiterals = {
  en: {
    up: 'up',
    down: 'down',
    otherColumns: 'Other columns',
    fixedColumns: 'Fixed'
  },
  es: {
    up: 'arriba',
    down: 'abajo',
    otherColumns: 'Otras columnas',
    fixedColumns: 'Fijado'
  },
  pt: {
    up: 'acima',
    down: 'abaixo',
    otherColumns: 'Outras colunas',
    fixedColumns: 'Fixo'
  },
  ru: {
    up: 'вверх',
    down: 'вниз',
    otherColumns: 'Другие столбцы',
    fixedColumns: 'зафиксированный'
  }
};

type Direction = 'up' | 'down';

@Component({
  selector: 'po-table-list-manager',
  templateUrl: './po-table-list-manager.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PoTableListManagerComponent),
      multi: true
    }
  ],
  standalone: false
})
export class PoTableListManagerComponent extends PoCheckboxGroupComponent {
  private _componentsSize?: string = undefined;
  private _iconToken: { [key: string]: string };

  @Output('p-change-position')
  private changePosition = new EventEmitter<any>();

  @Output('p-change-fixed')
  private changeColumnFixed = new EventEmitter<any>();

  @Input('p-columns-manager') columnsManager: Array<PoTableColumn>;

  /**
   * @optional
   *
   * @description
   *
   * Define o tamanho dos componentes de formulário no table:
   * - `small`: aplica a medida small de cada componente (disponível apenas para acessibilidade AA).
   * - `medium`: aplica a medida medium de cada componente.
   *
   * > Caso a acessibilidade AA não esteja configurada, o tamanho `medium` será mantido.
   * Para mais detalhes, consulte a documentação do [po-theme](https://po-ui.io/documentation/po-theme).
   *
   * @default `medium`
   */
  @Input('p-components-size') set componentsSize(value: string) {
    this._componentsSize = validateSize(value, this.poThemeService, PoFieldSize);
  }

  get componentsSize(): string {
    return this._componentsSize ?? getDefaultSize(this.poThemeService, PoFieldSize);
  }

  @Input({ alias: 'p-hide-action-fixed-columns', transform: convertToBoolean }) hideActionFixedColumns: boolean = false;

  literals;

  get iconNameLib() {
    return this._iconToken.NAME_LIB;
  }

  constructor(
    languageService: PoLanguageService,
    changeDetector: ChangeDetectorRef,
    @Optional() @Inject(ICONS_DICTIONARY) value: { [key: string]: string },
    protected poThemeService: PoThemeService
  ) {
    super(changeDetector, poThemeService);

    const language = languageService.getShortLanguage();

    this.literals = {
      ...poTableListManagerLiterals[poLocaleDefault],
      ...poTableListManagerLiterals[language]
    };

    this._iconToken = value ?? AnimaliaIconDictionary;
  }

  emitChangePosition(option, direction: Direction) {
    if (!this.isFixed(option)) {
      const infoPosition = { option, direction };
      const hasDisabled: boolean = this.verifyArrowDisabled(option, direction);
      if (!hasDisabled) {
        this.changePosition.emit(infoPosition);
      }
    }
  }

  verifyArrowDisabled(option, direction: Direction) {
    const index = this.columnsManager.findIndex(el => el.property === option.value);
    const existsDetail = this.columnsManager.some(function (el) {
      return el.property === 'detail';
    });
    const valueSubtraction = existsDetail ? 2 : 1;

    if (index === 0 && direction === 'up') {
      return true;
    }

    if (index !== 0 && direction === 'up' && this.columnsManager[index - 1].fixed) {
      return true;
    }

    if (index === this.columnsManager.length - valueSubtraction && direction === 'down') {
      return true;
    }

    return false;
  }

  emitFixed(option) {
    if (option.visible) {
      const index = this.columnsManager.findIndex(el => el.property === option.value);

      if (
        this.columnsManager[index].fixed === null ||
        this.columnsManager[index].fixed === undefined ||
        this.columnsManager[index].fixed === false
      ) {
        this.columnsManager[index].fixed = true;
        option.fixed = true;
      } else {
        this.columnsManager[index].fixed = false;
        option.fixed = false;
      }
      this.changeColumnFixed.emit(option);
    }
  }

  isFixed(option) {
    const index = this.columnsManager.findIndex(el => el.property === option.value);
    if (this.columnsManager[index].fixed === true) {
      return true;
    }
    return false;
  }

  existedFixedItem() {
    return this.columnsManager.some(option => option['fixed'] === true);
  }

  checksIfHasFiveFixed(option) {
    const isMoreThanFive = this.columnsManager.filter(item => item.fixed === true).length > 4;
    const isNotFixed = !this.isFixed(option);

    return isMoreThanFive && isNotFixed;
  }

  clickSwitch(option) {
    this.checkOption(option);
  }
}
