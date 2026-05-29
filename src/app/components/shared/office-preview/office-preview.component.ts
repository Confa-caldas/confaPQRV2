import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

type OfficeKind = 'xlsx' | 'docx' | 'legacy-doc' | 'legacy-xls' | 'unsupported';

interface SheetTab {
  name: string;
  html: string;
}

const DEFAULT_MAX_BYTES = 25 * 1024 * 1024; // 25 MB

@Component({
  selector: 'app-office-preview',
  templateUrl: './office-preview.component.html',
  styleUrls: ['./office-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfficePreviewComponent implements OnChanges, OnDestroy {
  @Input() url: string | null = null;
  @Input() fileName = '';
  @Input() maxBytes: number = DEFAULT_MAX_BYTES;

  @ViewChild('docxContainer', { static: false }) docxContainer?: ElementRef<HTMLDivElement>;

  loading = false;
  error: string | null = null;
  unsupported = false;
  fileTooLarge = false;

  kind: OfficeKind = 'unsupported';
  sheets: SheetTab[] = [];
  activeSheetIndex = 0;

  private currentLoadId = 0;
  private currentBuffer: ArrayBuffer | null = null;
  private currentBlobUrl: string | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['url'] || changes['fileName']) {
      this.resetState();
      if (this.url && this.fileName) {
        void this.load(this.url, this.fileName);
      }
    }
  }

  ngOnDestroy(): void {
    this.currentLoadId = -1;
    this.clearDocxContainer();
    this.releaseBlobUrl();
    this.currentBuffer = null;
  }

  selectSheet(index: number): void {
    this.activeSheetIndex = index;
    this.cdr.markForCheck();
  }

  downloadFile(): void {
    if (this.currentBuffer && this.fileName) {
      this.downloadFromBuffer(this.currentBuffer, this.fileName);
      return;
    }
    if (this.url) {
      window.open(this.url, '_blank', 'noopener');
    }
  }

  get canDownload(): boolean {
    return !!this.url || !!this.currentBuffer;
  }

  get hasPreview(): boolean {
    if (this.loading || this.error || this.unsupported || this.fileTooLarge) {
      return false;
    }
    if (this.kind === 'xlsx') {
      return this.sheets.length > 0;
    }
    return this.kind === 'docx';
  }

  private downloadFromBuffer(buffer: ArrayBuffer, fileName: string): void {
    this.releaseBlobUrl();

    const mimeType = this.getMimeType(fileName);
    const blob = new Blob([buffer], { type: mimeType });
    this.currentBlobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = this.currentBlobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getMimeType(fileName: string): string {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      default:
        return 'application/octet-stream';
    }
  }

  private releaseBlobUrl(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }

  private resetState(): void {
    this.loading = false;
    this.error = null;
    this.unsupported = false;
    this.fileTooLarge = false;
    this.sheets = [];
    this.activeSheetIndex = 0;
    this.kind = this.detectKind(this.fileName);
    this.currentBuffer = null;
    this.releaseBlobUrl();
    this.clearDocxContainer();
  }

  private detectKind(fileName: string): OfficeKind {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'xlsx':
        return 'xlsx';
      case 'xls':
        return 'legacy-xls';
      case 'docx':
        return 'docx';
      case 'doc':
        return 'legacy-doc';
      default:
        return 'unsupported';
    }
  }

  private async load(url: string, fileName: string): Promise<void> {
    if (this.kind === 'unsupported') {
      this.unsupported = true;
      this.cdr.markForCheck();
      return;
    }

    if (this.kind === 'legacy-doc' || this.kind === 'legacy-xls') {
      this.cdr.markForCheck();
      return;
    }

    const loadId = ++this.currentLoadId;
    this.loading = true;
    this.cdr.markForCheck();

    try {
      const buffer = await this.fetchBinary(url);
      if (loadId !== this.currentLoadId) {
        return;
      }

      if (buffer.byteLength > this.maxBytes) {
        this.fileTooLarge = true;
        return;
      }

      this.currentBuffer = buffer;

      if (this.kind === 'xlsx') {
        await this.renderXlsx(buffer);
      } else if (this.kind === 'docx') {
        await this.prepareDocxContainer();
        if (loadId !== this.currentLoadId) {
          return;
        }
        await this.renderDocx(buffer);
      }
    } catch (err) {
      console.error('[office-preview] error', err);
      this.error =
        'No se pudo cargar la previsualización del documento. Puedes descargar el archivo en su lugar.';
    } finally {
      if (loadId === this.currentLoadId) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    }
  }

  private async prepareDocxContainer(): Promise<void> {
    this.loading = false;
    this.cdr.detectChanges();
    await new Promise<void>(resolve => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  private async fetchBinary(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.arrayBuffer();
  }

  private async renderXlsx(buffer: ArrayBuffer): Promise<void> {
    const xlsx = await import('xlsx');
    const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });

    this.sheets = workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name];
      const html = xlsx.utils.sheet_to_html(sheet, { editable: false });
      return { name, html };
    });
    this.activeSheetIndex = 0;
  }

  private async renderDocx(buffer: ArrayBuffer): Promise<void> {
    const docxPreview = await import('docx-preview');

    let container = this.docxContainer?.nativeElement;
    if (!container) {
      this.cdr.detectChanges();
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      container = this.docxContainer?.nativeElement;
    }

    if (!container) {
      throw new Error('Contenedor de docx no disponible');
    }
    container.innerHTML = '';

    await docxPreview.renderAsync(buffer, container, undefined, {
      className: 'docx-preview-content',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      experimental: false,
      useBase64URL: true,
    });
  }

  private clearDocxContainer(): void {
    const container = this.docxContainer?.nativeElement;
    if (container) {
      container.innerHTML = '';
    }
  }
}
