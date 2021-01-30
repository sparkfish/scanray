import { longestCommonSubstring } from 'string-algorithms'
import onScan from 'onscan.js'

export default class ScanMonitor {
  enabledLogging: boolean = false
  delim: string = '\n'

  static activateScanMonitor(): void {
    // prevent special Ctrl-key sequences from triggering browser controls (as known to occur AAMVA barcodes)
    document.addEventListener('keydown', this._trapCtrlKeyListener)

    // enable bar code scan events for the entire document
    onScan.attachTo(document, {
      // convert or limit scanned values on-the-fly
      keyCodeMapper(e: KeyboardEvent) {
        if (onScan.isScanInProgressFor(document)) {
          if (this.enabledLogging)
            console.log(
              ` Pressed: [${e.key}] => [${e.key.charCodeAt(0)}--${
                e.ctrlKey ? 'Ctrl' : ''
              }${e.shiftKey ? 'Shift' : ''}${e.altKey ? 'Alt' : ''}]`
            )

          // convert CRLF from Ctrl+J and Ctrl+M sequence; ignore other Ctrl-modified keys
          if (e.ctrlKey)
            return (['KeyJ', 'KeyM'] as string[]).includes(e.code) ? this.delim : ''

          // test against fixed set of printable chars (instead of an expensive regex)
          const printable =
            ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
          if (printable.includes(e.key)) return e.key
        }
        return onScan.decodeKeyEvent(e)
      },

      // emit parsed scan details and clean up any on-screen scan garbage
      onScan(scanData: string) {
        console.log(`scanned: [${scanData}]`)

        // detect scan event type and emit accordingly
        ScanMonitor._emitHealthIdScanEvent(scanData)

        // remove scanned data from any text input element having focus at time of scan
        const activeElement = document.activeElement
        if (
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLInputElement
        ) {
          if (this.enabledLogging)
            console.log(`activeElement.value: [${activeElement.value}]`)
          longestCommonSubstring([
            activeElement.value.trim(),
            (scanData.trim() as any).replaceAll(this.delim, ''),
          ]).forEach((overlappingStringToRemove: string) => {
            // remove text from field likely to have come from scanner => hence a min-length check
            const text = activeElement.value.trim()
            if (
              overlappingStringToRemove.length > 10 &&
              text.includes(overlappingStringToRemove)
            )
              activeElement.value = text.replace(overlappingStringToRemove, '')
          })
        }
      },
    })
  }

  static deactivateScanMonitor(): void {
    document.removeEventListener('keydown', this._trapCtrlKeyListener)
    onScan.detachFrom(document)
  }
  
  static _emitAamvaIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<number>('aamvaIdScan', {
      detail: detail,
    })
    document.dispatchEvent(idScanEvent)
  }

  static _emitHealthIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<number>('healthIdScan', {
      detail: detail,
    })
    document.dispatchEvent(idScanEvent)
  }

  static _trapCtrlKeyListener(e: KeyboardEvent): void {
    // only allow copy, cut, paste, print keyboard sequences
    if (e.ctrlKey && !['KeyC', 'KeyX', 'KeyV', 'KeyP'].includes(e.code))
      e.preventDefault()
  }
}

export { onScan }