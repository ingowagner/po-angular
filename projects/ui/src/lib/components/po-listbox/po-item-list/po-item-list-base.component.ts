import { Directive, EventEmitter, HostBinding, Input, Output, TemplateRef } from '@angular/core';
import { convertToBoolean } from '../../../utils/util';
import { PoItemListFilterMode } from '../enums/po-item-list-filter-mode.enum';
import { PoItemListType } from '../enums/po-item-list-type.enum';
import { PoItemListAction } from './interfaces/po-item-list-action.interface';
import { PoItemListOptionGroup } from './interfaces/po-item-list-option-group.interface';
import { PoItemListOption } from './interfaces/po-item-list-option.interface';

/**
 * @description
 *
 * O componente `po-item-list` é a menor parte da lista de ação que compõem o componente [**PO Listbox**](/documentation/po-listbox).
 */
@Directive()
export class PoItemListBaseComponent {
  private _label: string;
  private _value: string;
  private _type!: PoItemListType;
  private _visible: boolean = true;
  private _disabled: boolean = false;
  _activeTabs: boolean = false;

  @HostBinding('attr.p-type')
  @Input('p-type')
  set type(value: string) {
    this._type = PoItemListType[value] ?? 'action';
  }

  get type(): PoItemListType {
    return this._type;
  }

  /**
   * @optional
   *
   * @description
   *
   * Define o estado como visível.
   *
   * @default `true`
   */
  @Input('p-visible')
  set visible(value: any) {
    if (value === true || value === null || value === undefined) {
      this._visible = true;
    } else {
      this._visible = false;
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  @Input('p-item') item: PoItemListAction | PoItemListOption | PoItemListOptionGroup | any;

  /** Texto de exibição do item. */
  @Input('p-label') label: string;

  /** Tamanho do texto exibido. */
  @Input('p-size') size: string;

  /** Valor do item. */
  @Input('p-value') value: string;

  @Input({ alias: 'p-danger', transform: convertToBoolean }) danger: boolean = false;

  /**
   * @optional
   *
   * @description
   *
   * Define o estado como desabilitado.
   *
   * @default `false`
   */
  @Input('p-disabled')
  set disabled(value: any) {
    if (value === false || value === null || value === undefined) {
      this._disabled = false;
    } else {
      this._disabled = true;
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * @optional
   *
   * @description
   *
   * Define se a ação está selecionada.
   *
   * @default `false`
   */
  @Input({ alias: 'p-selected', transform: convertToBoolean }) selected: boolean = false;

  /**
   * @optional
   *
   * @description
   *
   * Atribui uma linha separadora acima do item.
   *
   * @default `false`
   */
  @Input({ alias: 'p-separator', transform: convertToBoolean }) separator: boolean = false;

  /**
   * @optional
   *
   * @description
   *
   * Define um ícone que será exibido ao lado esquerdo do rótulo.
   */
  @Input('p-icon') icon: string | TemplateRef<void>;

  /**
   * @optional
   *
   * @description
   *
   * Ação a ser realizada ao clicar no item do tipo `option`.
   */
  @Output('p-click-item') clickItem = new EventEmitter<PoItemListAction | any>();

  // MULTISELECT PROPERTIES
  //emissao de evento do checkbox
  @Output('p-selectcheckbox-item') checkboxItem = new EventEmitter<any>();

  @Output('p-selectcombo-item') comboItem = new EventEmitter<any>();

  //valor do checkbox de selecionar todos
  @Input('p-checkbox-value') checkboxValue: any;

  @Input('p-field-value') fieldValue: string = 'value';

  @Input('p-field-label') fieldLabel: string = 'label';

  @Input('p-template') template: TemplateRef<any> | any;

  @Input('p-template-context') templateContext: any;

  @Input('p-search-value') searchValue: string = '';

  @Input('p-filter-mode') filterMode: PoItemListFilterMode = PoItemListFilterMode.contains;

  @Input('p-filtering') isFiltering: boolean = false;

  @Input('p-should-mark-letter') shouldMarkLetters: boolean = true;

  @Input('p-compare-cache') compareCache: boolean = false;

  @Input('p-combo-service') comboService: any;

  // TABS PROPERTIES

  @Input('p-is-tabs') isTabs?: boolean = false;

  @Input('p-tab-hide') tabHide?: boolean = false;

  @Output('p-emit-item-tabs') tabsItem = new EventEmitter<any>();

  @Output('p-activated-tabs') activatedTab = new EventEmitter();

  // Ativa o botão
  @Input('p-active-tabs') set activeTabs(value: boolean) {
    this._activeTabs = value;

    this.emitActiveTabs(this.item);
  }

  get activeTabs() {
    return this._activeTabs;
  }

  protected emitActiveTabs(tab) {
    if (tab?.active) {
      this.activatedTab.emit(tab);
    }
  }
}
