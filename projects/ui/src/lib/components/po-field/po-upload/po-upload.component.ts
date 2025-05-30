import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  forwardRef
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PoI18nPipe } from '../../../services/po-i18n/po-i18n.pipe';
import { PoLanguageService } from '../../../services/po-language/po-language.service';
import { PoNotificationService } from '../../../services/po-notification/po-notification.service';
import { formatBytes, isMobile, uuid } from '../../../utils/util';
import { PoProgressStatus } from '../../po-progress/enums/po-progress-status.enum';
import { PoButtonComponent } from './../../po-button/po-button.component';

import { PoThemeService } from '../../../services';
import { PoUploadBaseComponent } from './po-upload-base.component';
import { PoUploadDragDropComponent } from './po-upload-drag-drop/po-upload-drag-drop.component';
import { PoUploadFile } from './po-upload-file';
import { PoUploadStatus } from './po-upload-status.enum';
import { PoUploadService } from './po-upload.service';

/**
 * @docsExtends PoUploadBaseComponent
 *
 * @example
 *
 * <example name="po-upload-basic" title="PO Upload Basic">
 *   <file name="sample-po-upload-basic/sample-po-upload-basic.component.html"> </file>
 *   <file name="sample-po-upload-basic/sample-po-upload-basic.component.ts"> </file>
 * </example>
 *
 * <example name="po-upload-labs" title="PO Upload Labs">
 *   <file name="sample-po-upload-labs/sample-po-upload-labs.component.html"> </file>
 *   <file name="sample-po-upload-labs/sample-po-upload-labs.component.ts"> </file>
 * </example>
 *
 * <example name="po-upload-resume" title="PO Upload - Resume">
 *   <file name="sample-po-upload-resume/sample-po-upload-resume.component.html"> </file>
 *   <file name="sample-po-upload-resume/sample-po-upload-resume.component.ts"> </file>
 * </example>
 *
 * <example name="po-upload-rs" title="PO Upload - Realize & Show">
 *   <file name="sample-po-upload-rs/sample-po-upload-rs.component.html"> </file>
 *   <file name="sample-po-upload-rs/sample-po-upload-rs.component.ts"> </file>
 * </example>
 *
 * <example name="po-upload-download" title="PO Upload - with Download Button">
 *   <file name="sample-po-upload-download/sample-po-upload-download.component.html"> </file>
 *   <file name="sample-po-upload-download/sample-po-upload-download.component.ts"> </file>
 * </example>
 */
@Component({
  selector: 'po-upload',
  templateUrl: './po-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PoI18nPipe,
    PoUploadService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PoUploadComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PoUploadComponent),
      multi: true
    }
  ],
  standalone: false
})
export class PoUploadComponent extends PoUploadBaseComponent implements AfterViewInit {
  @ViewChild('inputFile', { read: ElementRef, static: true }) private inputFile: ElementRef;
  @ViewChild(PoUploadDragDropComponent) private poUploadDragDropComponent: PoUploadDragDropComponent;
  @ViewChild('uploadButton') uploadButton: PoButtonComponent;

  id = `po-upload[${uuid()}]`;

  infoByUploadStatus: { [key: string]: { text: (percent?: number) => string; icon?: string } } = {
    [PoUploadStatus.Uploaded]: {
      text: () => this.literals.sentWithSuccess,
      icon: 'ICON_OK'
    },
    [PoUploadStatus.Error]: {
      text: () => this.literals.errorOccurred
    },
    [PoUploadStatus.Uploading]: {
      text: percent => percent + '%'
    }
  };

  progressStatusByFileStatus = {
    [PoUploadStatus.Uploaded]: PoProgressStatus.Success,
    [PoUploadStatus.Error]: PoProgressStatus.Error
  };

  private calledByCleanInputValue: boolean = false;

  constructor(
    uploadService: PoUploadService,
    public renderer: Renderer2,
    private i18nPipe: PoI18nPipe,
    private notification: PoNotificationService,
    private cd: ChangeDetectorRef,
    languageService: PoLanguageService,
    protected poThemeService: PoThemeService
  ) {
    super(poThemeService, uploadService, languageService);
  }

  get displayDragDrop(): boolean {
    return this.dragDrop && !isMobile();
  }

  get displaySendButton(): boolean {
    const currentFiles = this.currentFiles || [];
    return (
      !this.hideSendButton && !this.autoUpload && currentFiles.length > 0 && this.hasFileNotUploaded && this.requiredUrl
    );
  }

  get selectFileButtonLabel() {
    if (this.canHandleDirectory) {
      return this.literals.selectFolder;
    } else if (this.isMultiple) {
      return this.literals.selectFiles;
    } else {
      return this.literals.selectFile;
    }
  }

  get hasMoreThanFourItems(): boolean {
    return this.currentFiles && this.currentFiles.length > 4;
  }

  get hasMultipleFiles(): boolean {
    return this.currentFiles && this.currentFiles.length > 1;
  }

  get hasFileNotUploaded(): boolean {
    if (Array.isArray(this.currentFiles)) {
      return this.currentFiles.some(file => file.status !== PoUploadStatus.Uploaded);
    }

    return false;
  }

  get isDisabled(): boolean {
    const currentFiles = this.currentFiles || [];

    return this.requiredUrl
      ? !!(
          this.hasAnyFileUploading(currentFiles) ||
          !this.url ||
          this.disabled ||
          this.isExceededFileLimit(currentFiles.length)
        )
      : !!(
          this.hasAnyFileUploading(currentFiles) ||
          this.autoUpload ||
          this.disabled ||
          this.isExceededFileLimit(currentFiles.length)
        );
  }

  get maxFiles(): number {
    return this.isMultiple && this.fileRestrictions && this.fileRestrictions.maxFiles;
  }

  cancel(file: PoUploadFile) {
    if (file.status === PoUploadStatus.Uploading) {
      return this.stopUpload(file);
    }

    this.removeFile(file);
  }

  ngAfterViewInit() {
    if (this.autoFocus) {
      this.focus();
    }
  }

  /** Método responsável por **limpar** o(s) arquivo(s) selecionado(s). */
  clear() {
    this.currentFiles = undefined;
    this.updateModel([]);
    this.cleanInputValue();
  }

  emitAdditionalHelp() {
    if (this.isAdditionalHelpEventTriggered()) {
      this.additionalHelp.emit();
    }
  }

  /**
   * Função que atribui foco ao componente.
   *
   * Para utilizá-la é necessário ter a instância do componente no DOM, podendo ser utilizado o ViewChild da seguinte forma:
   *
   * ```
   * import { PoUploadComponent } from '@po-ui/ng-components';
   *
   * ...
   *
   * @ViewChild(PoUploadComponent, { static: true }) upload: PoUploadComponent;
   *
   * focusUpload() {
   *   this.upload.focus();
   * }
   * ```
   */
  focus() {
    if (!this.disabled) {
      if (this.uploadButton) {
        this.uploadButton.focus();
        return;
      }

      if (this.displayDragDrop) {
        this.poUploadDragDropComponent.focus();
      }
    }
  }

  getAdditionalHelpTooltip() {
    return this.isAdditionalHelpEventTriggered() ? null : this.additionalHelpTooltip;
  }

  // Verifica se existe algum arquivo sendo enviado ao serviço.
  hasAnyFileUploading(files: Array<PoUploadFile>) {
    if (files && files.length) {
      return files.some(file => file.status === PoUploadStatus.Uploading);
    }

    return false;
  }

  // retorna se o status do arquivo é diferente de enviado
  isAllowCancelEvent(status: PoUploadStatus) {
    return status !== PoUploadStatus.Uploaded;
  }

  onBlur(): void {
    if (!this.isUploadButtonFocused() && this.getAdditionalHelpTooltip() && this.displayAdditionalHelp) {
      this.showAdditionalHelp();
    }
  }

  // Função disparada ao selecionar algum arquivo.
  onFileChange(event): void {
    // necessário este tratamento quando para IE, pois nele o change é disparado quando o campo é limpado também
    if (this.calledByCleanInputValue) {
      this.calledByCleanInputValue = false;
      return event.preventDefault();
    }

    const files = event.target.files;
    this.updateFiles(files);

    this.cleanInputValue();
  }

  onFileChangeDragDrop(files) {
    this.updateFiles(files);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isUploadButtonFocused()) {
      this.keydown.emit(event);
    }
  }

  // Remove o arquivo passado por parâmetro da lista dos arquivos correntes.
  removeFile(file): void {
    const index = this.currentFiles.indexOf(file);
    this.currentFiles.splice(index, 1);

    this.updateModel([...this.currentFiles]);
  }

  /** Método responsável por **abrir** a janela para seleção de arquivo(s). */
  selectFiles() {
    this.onModelTouched?.();
    this.calledByCleanInputValue = false;
    this.inputFile.nativeElement.click();
  }

  sendFeedback(): void {
    if (this.sizeNotAllowed > 0) {
      const minFileSize = formatBytes(this.fileRestrictions.minFileSize);
      const maxFileSize = formatBytes(this.fileRestrictions.maxFileSize);
      const args = [this.sizeNotAllowed, minFileSize || '0', maxFileSize];
      this.setPipeArguments('invalidSize', args);
      this.sizeNotAllowed = 0;
    }

    if (this.extensionNotAllowed > 0) {
      const allowedExtensionsFormatted = this.fileRestrictions.allowedExtensions.join(', ').toUpperCase();
      const args = [this.extensionNotAllowed, allowedExtensionsFormatted];
      this.setPipeArguments('invalidFormat', args);
      this.extensionNotAllowed = 0;
    }

    if (this.quantityNotAllowed > 0) {
      const args = [this.quantityNotAllowed];
      this.setPipeArguments('invalidAmount', args);
      this.quantityNotAllowed = 0;
    }
  }

  /** Método responsável por **enviar** o(s) arquivo(s) selecionado(s). */
  sendFiles(): void {
    if (this.currentFiles && this.currentFiles.length) {
      this.uploadFiles(this.currentFiles);
    }
  }

  setDirectoryAttribute(canHandleDirectory: boolean) {
    if (canHandleDirectory) {
      this.renderer.setAttribute(this.inputFile.nativeElement, 'webkitdirectory', 'true');
    } else {
      this.renderer.removeAttribute(this.inputFile.nativeElement, 'webkitdirectory');
    }
  }

  /**
   * Método que exibe `p-additionalHelpTooltip` ou executa a ação definida em `p-additionalHelp`.
   * Para isso, será necessário configurar uma tecla de atalho utilizando o evento `p-keydown`.
   *
   * ```
   * <po-upload
   *  #upload
   *  ...
   *  p-additional-help-tooltip="Mensagem de ajuda complementar"
   *  (p-keydown)="onKeyDown($event, upload)"
   * ></po-upload>
   * ```
   * ```
   * ...
   * onKeyDown(event: KeyboardEvent, inp: PoUploadComponent): void {
   *  if (event.code === 'F9') {
   *    inp.showAdditionalHelp();
   *  }
   * }
   * ```
   */
  showAdditionalHelp(): boolean {
    this.displayAdditionalHelp = !this.displayAdditionalHelp;
    return this.displayAdditionalHelp;
  }

  showAdditionalHelpIcon() {
    return !!this.additionalHelpTooltip || this.isAdditionalHelpEventTriggered();
  }

  // Caso o componente estiver no modo AutoUpload, o arquivo também será removido da lista.
  stopUpload(file: PoUploadFile) {
    this.uploadService.stopRequestByFile(file, () => {
      if (this.autoUpload) {
        this.removeFile(file);
      } else {
        this.stopUploadHandler(file);
      }
      this.cd.markForCheck();
    });
  }

  trackByFn(index, file: PoUploadFile) {
    return file.uid;
  }

  // Envia os arquivos passados por parâmetro, exceto os que já foram enviados ao serviço.
  uploadFiles(files: Array<PoUploadFile>) {
    const filesFiltered = files.filter(file => file.status !== PoUploadStatus.Uploaded);
    this.uploadService.upload(
      this.url,
      filesFiltered,
      this.headers,
      this.onUpload,
      (file, percent): any => {
        // UPLOADING
        this.uploadingHandler(file, percent);
      },
      (file, eventResponse): any => {
        // SUCCESS
        this.responseHandler(file, PoUploadStatus.Uploaded);
        this.onSuccess.emit(eventResponse);
      },
      (file, eventError): any => {
        // Error
        this.responseHandler(file, PoUploadStatus.Error);
        this.onError.emit(eventError);
      }
    );
  }

  customClick(file: PoUploadFile) {
    if (this.customAction) {
      this.customActionClick.emit(file);
    }
  }

  private cleanInputValue() {
    this.calledByCleanInputValue = true;
    this.inputFile.nativeElement.value = '';
    this.cd.detectChanges();
  }

  private isAdditionalHelpEventTriggered(): boolean {
    return (
      this.additionalHelpEventTrigger === 'event' ||
      (this.additionalHelpEventTrigger === undefined && this.additionalHelp.observed)
    );
  }

  private isUploadButtonFocused(): boolean {
    return document.activeElement === this.uploadButton.buttonElement.nativeElement;
  }

  // função disparada na resposta do sucesso ou error
  private responseHandler(file: PoUploadFile, status: PoUploadStatus) {
    file.status = status;
    file.percent = 100;
    this.cd.markForCheck();
  }

  // método responsável por setar os argumentos do i18nPipe de acordo com a restrição.
  private setPipeArguments(literalAttributes: string, literalArguments?) {
    const pipeArguments = this.i18nPipe.transform(this.literals[literalAttributes], literalArguments);
    this.notification.information(pipeArguments);
  }

  // Função disparada ao parar um envio de arquivo.
  private stopUploadHandler(file: PoUploadFile) {
    file.status = PoUploadStatus.None;
    file.percent = 0;
    this.cd.markForCheck();
  }

  private updateFiles(files) {
    this.currentFiles = this.parseFiles(files);

    this.updateModel([...this.currentFiles]);

    if (this.autoUpload) {
      this.uploadFiles(this.currentFiles);
    }
  }

  // Atualiza o ngModel para os arquivos passados por parâmetro.
  private updateModel(files: Array<PoUploadFile>) {
    const modelFiles: Array<PoUploadFile> = this.mapCleanUploadFiles(files);
    this.onModelChange ? this.onModelChange(modelFiles) : this.ngModelChange.emit(modelFiles);
  }

  // Função disparada enquanto o arquivo está sendo enviado ao serviço.
  private uploadingHandler(file: any, percent: number) {
    file.status = PoUploadStatus.Uploading;
    file.percent = percent;
    this.cd.markForCheck();
  }

  // retorna os objetos do array sem as propriedades: percent e displayName
  private mapCleanUploadFiles(files: Array<PoUploadFile>): Array<PoUploadFile> {
    const mapedByUploadFile = progressFile => {
      const { percent, displayName, ...uploadFile } = progressFile;

      return uploadFile;
    };

    return files.map(mapedByUploadFile);
  }
}
