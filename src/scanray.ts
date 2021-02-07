import { longestCommonSubstring } from 'string-algorithms'
import onScan from 'onscan.js'
import HealthIdCard from './health-id-card'
import AamvsIdCard from './aamva-id-card'

export { onScan }

export default class Scanray {
  static enabledLogging: boolean = true

  static activateMonitor(blockBadKeyboardShortcuts: boolean = true): void {
    // prevent special Ctrl-key sequences from triggering browser controls (as known to occur AAMVA barcodes)
    if (blockBadKeyboardShortcuts) document.addEventListener('keydown', Scanray._trapCtrlKeyListener)

    // enable bar code scan events for the entire document
    onScan.attachTo(document, {
      // convert or limit scanned values on-the-fly
      keyCodeMapper(e: KeyboardEvent) {
        if (onScan.isScanInProgressFor(document)) {
          if (Scanray.enabledLogging)
            console.log(`Pressed: [${e.key}] => [${e.key.charCodeAt(0)}--${e.ctrlKey ? 'Ctrl' : ''}${e.shiftKey ? 'Shift' : ''}]`)

          // convert special control sequences seen in AAMVA barcodes
          if (e.ctrlKey && e.code == 'KeyJ') return '[LF]' // Ctrl+J
          if (e.ctrlKey && e.code == 'KeyM') return '[CR]' // Ctrl+M
          if (e.ctrlKey && e.shiftKey && e.code == 'Digit6') return '[RS]' // Ctrl+Shift+6

          // test against fixed set of printable chars (instead of an expensive regex)
          const printable = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
          if (printable.includes(e.key)) return e.key
        }
        return onScan.decodeKeyEvent(e)
      },

      // emit parsed scan details and clean up any on-screen scan garbage
      onScan(scanData: string) {
        if (Scanray.enabledLogging) console.log(`scanned: [${scanData}]`)

        // handle common control key translation optionally performed by scanner programming: [LF][RS][CR]
        let fixedScanData = scanData.replaceAll('[LF]', '\x0A').replaceAll('[CR]', '\x0D').replaceAll('[RS]', '\x1E')

        // detect scan event type and emit accordingly
        if (fixedScanData?.[0] == '%') {
          let hc = new HealthIdCard(fixedScanData)
          Scanray._emitHealthIdScanEvent(hc)
        }
        if (fixedScanData?.[0] == '@') {
          let dl = new AamvsIdCard(fixedScanData)
          Scanray._emitAamvaIdScanEvent(dl)
        }

        // remove scanned data from any text input element having focus at time of scan
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
          if (Scanray.enabledLogging) console.log(`activeElement.value: [${activeElement.value}]`)
          longestCommonSubstring([activeElement.value.trim(), scanData.trim()]).forEach((overlappingStringToRemove: string) => {
            // remove text from field likely to have come from scanner => hence a min-length check
            const text = activeElement.value.trim()
            if (overlappingStringToRemove.length > 10 && text.includes(overlappingStringToRemove))
              activeElement.value = text.replace(overlappingStringToRemove, '')
          })
        }
      },
    })
  }

  static deactivateMonitor(): void {
    document.removeEventListener('keydown', Scanray._trapCtrlKeyListener)
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
    // only allow these whitelisted keyboard sequences:
    // copy, cut, paste, print, find, reload, inspect, select all
    if (e.ctrlKey && !['KeyC', 'KeyX', 'KeyV', 'KeyP', 'KeyF', 'KeyR', 'KeyI', 'KeyA'].includes(e.code)) {
      e.preventDefault()
      if (Scanray.enabledLogging)
        console.log(`Blocked control sequence: [${JSON.stringify({ code: e.code, ctrlKey: e.ctrlKey, key: e.key })}]`)
    }
  }
}
