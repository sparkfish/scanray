import { longestCommonSubstring } from 'string-algorithms'
import onScan from 'onscan.js'
import HealthIdCard from './health-id-card'
import AamvsIdCard from './aamva-id-card'

export { onScan }

export default class IdScanMonitor {
  static enabledLogging: boolean = false
  static delim: string = '|~|'

  static activateScanMonitor(delim: string = '|~|'): void {
    IdScanMonitor.delim = delim

    // prevent special Ctrl-key sequences from triggering browser controls (as known to occur AAMVA barcodes)
    document.addEventListener('keydown', IdScanMonitor._trapCtrlKeyListener)

    // enable bar code scan events for the entire document
    onScan.attachTo(document, {
      // convert or limit scanned values on-the-fly
      keyCodeMapper(e: KeyboardEvent) {
        if (onScan.isScanInProgressFor(document)) {
          if (IdScanMonitor.enabledLogging)
            console.log(
              ` Pressed: [${e.key}] => [${e.key.charCodeAt(0)}--${
                e.ctrlKey ? 'Ctrl' : ''
              }${e.shiftKey ? 'Shift' : ''}${e.altKey ? 'Alt' : ''}]`
            )

          // convert CRLF from Ctrl+J and Ctrl+M sequence; ignore other Ctrl-modified keys
          if (e.ctrlKey)
            return (['KeyJ', 'KeyM'] as string[]).includes(e.code) ? IdScanMonitor.delim : ''

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
        if(scanData?.[0] == '%')
        {
          let hc = new HealthIdCard(scanData)
          IdScanMonitor._emitHealthIdScanEvent(hc)
        }
        if(scanData?.[0] == '@')
        {
          let dl = new AamvsIdCard(scanData, IdScanMonitor.delim)
          IdScanMonitor._emitAamvaIdScanEvent(dl)
        }

        // remove scanned data from any text input element having focus at time of scan
        const activeElement = document.activeElement
        if (
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLInputElement
        ) {
          if (IdScanMonitor.enabledLogging)
            console.log(`activeElement.value: [${activeElement.value}]`)
          longestCommonSubstring([
            activeElement.value.trim(),
            (scanData.trim() as any).replaceAll(IdScanMonitor.delim, ''),
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
    document.removeEventListener('keydown', IdScanMonitor._trapCtrlKeyListener)
    onScan.detachFrom(document)
  }

  static _emitAamvaIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<any>('aamvaIdScan', {
      detail: detail,
    })
    document.dispatchEvent(idScanEvent)
  }

  static _emitHealthIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<any>('healthIdScan', {
      detail: detail,
    })
    document.dispatchEvent(idScanEvent)
  }

  static _trapCtrlKeyListener(e: KeyboardEvent): void {
    // only allow copy, cut, paste, print, find, reload, inspect keyboard sequences
    if (e.ctrlKey && !['KeyC', 'KeyX', 'KeyV', 'KeyP', 'KeyF', 'KeyR', 'KeyI'].includes(e.code))
    {
      e.preventDefault()
      console.log(`Blocked control sequence: [${JSON.stringify({ code: e.code, ctrlKey: e.ctrlKey, key: e.key })}]`)
    }
  }
}