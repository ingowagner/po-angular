import { ChangeDetectorRef, Directive, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, Validator, Validators } from '@angular/forms';

import { PoFieldSize } from '../../../enums/po-field-size.enum';
import { PoThemeService } from '../../../services';
import { convertToBoolean, convertToInt, getDefaultSize, validateSize } from '../../../utils/util';
import { maxlengpoailed, minlengpoailed, requiredFailed } from '../validators';

/**
 * @description
 *
 * Este é um componente de entrada de dados que possibilita o preechimento com múltiplas linhas.
 * É recomendado para observações, detalhamentos e outras situações onde o usuário deva preencher com um texto.
 *
 * Importante:
 *
 * - A propriedade `name` é obrigatória para que o formulário e o `model` funcionem corretamente. Do contrário, ocorrerá um erro de
 * _Angular_, onde será necessário informar o atributo `name` ou o atributo `[ngModelOptions]="{standalone: true}"`, por exemplo:
 *
 * ```
 * <po-textarea
 *   [(ngModel)]="pessoa.nome"
 *   [ngModelOptions]="{standalone: true}">
 * </po-textarea>
 * ```
 *
 * #### Acessibilidade tratada no componente
 * Algumas diretrizes de acessibilidade já são tratadas no componente, internamente, e não podem ser alteradas. São elas:
 *
 * - O Text area foi desenvolvido com uso de controles padrões HTML, o que permite a identificação do mesmo na interface por tecnologias
 * assistivas. [WCAG 4.1.2: Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value)
 * - O foco é visível e possui uma espessura superior a 2 pixels CSS, não ficando escondido por outros
 * elementos da tela. [WCAG 2.4.12: Focus Appearance)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance-enhanced)
 * - A identificação do erro acontece também através da mudança de cor do campo, mas também de um ícone
 * junto da mensagem. [WGAG 1.4.1: Use of Color, 3.2.4: Consistent Identification](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color)
 *
 * #### Tokens customizáveis
 *
 * É possível alterar o estilo do componente usando os seguintes tokens (CSS):
 *
 * > Para maiores informações, acesse o guia [Personalizando o Tema Padrão com Tokens CSS](https://po-ui.io/guides/theme-customization).
 *
 * | Propriedade                            | Descrição                                             | Valor Padrão                                    |
 * |----------------------------------------|-------------------------------------------------------|-------------------------------------------------|
 * | **Default Values**                     |                                                       |                                                 |
 * | `--font-family`                        | Família tipográfica usada                             | `var(--font-family-theme)`                      |
 * | `--font-size`                          | Tamanho da fonte                                      | `var(--font-size-default)`                      |
 * | `--text-color-placeholder`             | Cor do texto placeholder                              | `var(--color-neutral-light-30)`                 |
 * | `--color`                              | Cor pincipal do campo                                 | `var(--color-neutral-dark-70)`                  |
 * | `--background`                         | Cor de background                                     | `var(--color-neutral-light-05)`                 |
 *
 */
@Directive()
export abstract class PoTextareaBaseComponent implements ControlValueAccessor, Validator {
  // Propriedade interna que define se o ícone de ajuda adicional terá cursor clicável (evento) ou padrão (tooltip).
  @Input() additionalHelpEventTrigger: string | undefined;

  /**
   * @optional
   *
   * @description
   * Exibe um ícone de ajuda adicional ao `p-help`, com o texto desta propriedade no tooltip.
   * Se o evento `p-additional-help` estiver definido, o tooltip não será exibido.
   * **Como boa prática, indica-se utilizar um texto com até 140 caracteres.**
   * > Requer um recuo mínimo de 8px se o componente estiver próximo à lateral da tela.
   */
  @Input('p-additional-help-tooltip') additionalHelpTooltip?: string;

  /**
   * @optional
   *
   * @description
   *
   * Define que o tooltip (`p-additional-help-tooltip` e/ou `p-error-limit`) será incluído no body da página e não
   * dentro do componente. Essa opção pode ser necessária em cenários com containers que possuem scroll ou overflow
   * escondido, garantindo o posicionamento correto do tooltip próximo ao elemento.
   *
   * > Quando utilizado com `p-additional-help-tooltip`, leitores de tela como o NVDA podem não ler o conteúdo do tooltip.
   *
   * @default `false`
   */
  @Input({ alias: 'p-append-in-body', transform: convertToBoolean }) appendBox?: boolean = false;

  /**
   * @optional
   *
   * @description
   *
   * Aplica foco no elemento ao ser iniciado.
   *
   * > Caso mais de um elemento seja configurado com essa propriedade, apenas o último elemento declarado com ela terá o foco.
   *
   * @default `false`
   */
  @Input({ alias: 'p-auto-focus', transform: convertToBoolean }) autoFocus: boolean = false;

  /** Label do campo. */
  @Input('p-label') label?: string;

  /** Texto de apoio do campo. */
  @Input('p-help') help?: string;

  /** Nome e Id do componente. */
  @Input('name') name: string;

  /**
   * @optional
   *
   * @description
   *
   * Define se a indicação de campo opcional será exibida.
   *
   * > Não será exibida a indicação se:
   * - O campo conter `p-required`;
   * - Não possuir `p-help` e/ou `p-label`.
   *
   * @default `false`
   */
  @Input('p-optional') optional: boolean;

  /**
   * @optional
   *
   * @description
   *
   * Exibe a mensagem setada se o campo estiver vazio e for requerido.
   *
   * > Necessário que a propriedade `p-required` esteja habilitada.
   *
   */
  @Input('p-field-error-message') fieldErrorMessage: string;

  /**
   * @optional
   *
   * @description
   *
   * Limita a exibição da mensagem de erro a duas linhas e exibe um tooltip com o texto completo.
   *
   * > Caso essa propriedade seja definida como `true`, a mensagem de erro será limitada a duas linhas
   * e um tooltip será exibido ao passar o mouse sobre a mensagem para mostrar o conteúdo completo.
   *
   * @default `false`
   */
  @Input('p-error-limit') errorLimit: boolean = false;

  /**
   * @optional
   *
   * @description
   * Evento disparado ao clicar no ícone de ajuda adicional.
   * Este evento ativa automaticamente a exibição do ícone de ajuda adicional ao `p-help`.
   */
  @Output('p-additional-help') additionalHelp = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado ao sair do campo.
   */
  @Output('p-blur') blur: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado ao entrar do campo.
   */
  @Output('p-enter') enter: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado ao alterar valor e deixar o campo.
   */
  @Output('p-change') change: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   *
   * Evento disparado ao alterar valor do model.
   */
  @Output('p-change-model') changeModel: EventEmitter<any> = new EventEmitter<any>();

  /**
   * @optional
   *
   * @description
   * Evento disparado quando uma tecla é pressionada enquanto o foco está no componente.
   * Retorna um objeto `KeyboardEvent` com informações sobre a tecla.
   */
  @Output('p-keydown') keydown: EventEmitter<KeyboardEvent> = new EventEmitter<KeyboardEvent>();

  displayAdditionalHelp: boolean = false;

  private _disabled: boolean = false;
  private _maxlength: number;
  private _minlength: number;
  private _placeholder: string = '';
  private _readonly: boolean = false;
  private _required: boolean = false;
  private _rows: number = 3;
  private _size?: string = undefined;

  private modelLastUpdate: any;
  private onChangePropagate: any = null;
  private validatorChange: any;
  // eslint-disable-next-line
  protected onTouched: any = null;
  protected hasValidatorRequired = false;

  /** Placeholder, mensagem que aparecerá enquanto o campo não estiver preenchido. */
  @Input('p-placeholder') set placeholder(value: string) {
    this._placeholder = value || '';
  }

  get placeholder() {
    return this._placeholder;
  }

  /**
   * @optional
   *
   * @description
   *
   * Indica que o campo será desabilitado.
   *
   * @default `false`
   */
  @Input('p-disabled') set disabled(disabled: boolean) {
    this._disabled = convertToBoolean(disabled);
  }

  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * @optional
   *
   * @description
   *
   * Indica que o campo será somente leitura.
   *
   * @default `false`
   */
  @Input('p-readonly') set readonly(readonly: boolean) {
    this._readonly = convertToBoolean(readonly);
  }

  get readonly(): boolean {
    return this._readonly;
  }

  /**
   * @optional
   *
   * @description
   *
   * Define que o campo será obrigatório.
   * > Esta propriedade é desconsiderada quando o input está desabilitado `(p-disabled)`.
   *
   * @default `false`
   */
  @Input('p-required') set required(required: boolean) {
    this._required = convertToBoolean(required);

    this.validateModel();
  }

  get required(): boolean {
    return this._required;
  }

  /**
   * Define se a indicação de campo obrigatório será exibida.
   *
   * > Não será exibida a indicação se:
   * - Não possuir `p-help` e/ou `p-label`.
   */
  @Input('p-show-required') showRequired: boolean = false;

  /**
   * @optional
   *
   * @description
   *
   * Indica a quantidade mínima de caracteres que o campo aceita.
   */
  @Input('p-minlength') set minlength(minlength: number) {
    this._minlength = convertToInt(minlength);
    this.validateModel();
  }

  get minlength(): number {
    return this._minlength;
  }

  /**
   * @optional
   *
   * @description
   *
   * Indica a quantidade máxima de caracteres que o campo aceita.
   */
  @Input('p-maxlength') set maxlength(maxlength: number) {
    this._maxlength = convertToInt(maxlength);
    this.validateModel();
  }

  get maxlength(): number {
    return this._maxlength;
  }

  /**
   * @optional
   *
   * @description
   *
   * Indica a quantidade de linhas que serão exibidas.
   *
   * @default `3`
   */
  @Input('p-rows') set rows(value: number) {
    this._rows = isNaN(parseInt(<any>value, 10)) || value < 3 ? 3 : parseInt(<any>value, 10);
  }
  get rows(): number {
    return this._rows;
  }

  /**
   * @optional
   *
   * @description
   *
   * Define o tamanho do componente:
   * - `small` (disponível apenas para acessibilidade AA)
   * - `medium`
   *
   * > Caso a acessibilidade AA não esteja configurada, o tamanho `medium` será mantido.
   * Para mais detalhes, consulte a documentação do [po-theme](https://po-ui.io/documentation/po-theme).
   *
   * @default `medium`
   */
  @Input('p-size') set size(value: string) {
    this._size = validateSize(value, this.poThemeService, PoFieldSize);
  }

  get size(): string {
    return this._size ?? getDefaultSize(this.poThemeService, PoFieldSize);
  }

  constructor(
    public cd: ChangeDetectorRef,
    protected poThemeService: PoThemeService
  ) {}

  callOnChange(value: any) {
    // Quando o input não possui um formulário, então esta função não é registrada
    if (this.onChangePropagate) {
      this.onChangePropagate(value);
    }

    this.controlChangeModelEmitter(value);
  }

  controlChangeModelEmitter(value: any) {
    if (this.modelLastUpdate !== value) {
      this.changeModel.emit(value);
      this.modelLastUpdate = value;
    }
  }

  // Função implementada do ControlValueAccessor
  // Usada para interceptar os estados de habilitado via forms api
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  // Funções `registerOnChange`, `registerOnTouched` e `registerOnValidatorChange` implementadas referentes ao ControlValueAccessor
  // usadas para interceptar as mudanças e não atualizar automaticamente o Model
  registerOnChange(func: any): void {
    this.onChangePropagate = func;
  }

  registerOnTouched(func: any): void {
    this.onTouched = func;
  }

  registerOnValidatorChange(func: any): void {
    this.validatorChange = func;
  }

  validate(abstractControl: AbstractControl): { [key: string]: any } {
    if (!this.hasValidatorRequired && this.fieldErrorMessage && abstractControl.hasValidator(Validators.required)) {
      this.hasValidatorRequired = true;
    }

    if (requiredFailed(this.required, this.disabled, abstractControl.value)) {
      return {
        required: {
          valid: false
        }
      };
    }

    if (minlengpoailed(this.minlength, abstractControl.value)) {
      return {
        minlength: {
          valid: false
        }
      };
    }

    if (maxlengpoailed(this.maxlength, abstractControl.value)) {
      return {
        maxlength: {
          valid: false
        }
      };
    }
  }

  // Função implementada do ControlValueAccessor
  writeValue(value: any) {
    this.writeValueModel(value);
    this.cd.markForCheck();
  }

  protected validateModel() {
    if (this.validatorChange) {
      this.validatorChange();
    }
  }

  abstract writeValueModel(value: any): void;
}
