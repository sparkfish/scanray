import { longestCommonSubstring } from 'string-algorithms'
import onScan from 'onscan.js'

import AamvaIdCard from './adapters/aamvaIdCard'
import HealthIdCard from './adapters/healthIdCard'

export { onScan }

interface scanrayOptions {
  blockKeyboardEventsDuringScan?: boolean
  blockAltKeyEvents?: boolean
  blockBadKeyboardShortcutEvents?: boolean
  enabledLogging?: boolean
  prefixKeyCodes?: number[]
  suffixKeyCodes?: number[]
}

export default class Scanray {
  static options: scanrayOptions
  static currentPrefix: string
  static altKeySequence: string

  static activateMonitor(options: scanrayOptions): void {
    Scanray.options = options || {}

    // prevent keyboard events from being triggered during scan
    if (options?.blockKeyboardEventsDuringScan) document.addEventListener('keydown', Scanray._trapKeyboardEventsDuringScan)

    // prevent alt-key keyboard events from creating chars in browser window
    if (options?.blockAltKeyEvents) document.addEventListener('keydown', Scanray._trapAltKeyListener)

    // prevent special Ctrl-key sequences from triggering browser controls (as known to occur in AAMVA barcodes)
    if (options?.blockBadKeyboardShortcutEvents) document.addEventListener('keydown', Scanray._trapCtrlKeyListener)

    // enable bar code scan events for the entire document
    onScan.attachTo(document, {
      // add support for guillemets (french quotation marks) as prefix/suffix for more reliable scanning
      prefixKeyCodes: options?.prefixKeyCodes || [171], // «
      suffixKeyCodes: options?.suffixKeyCodes || [187], // »
      onScan: Scanray.onScan,
      onScanError: Scanray._resetStateAfterScan,
      keyCodeMapper: Scanray.keyCodeMapper,
    })

    Scanray._resetStateAfterScan()
  }

  static deactivateMonitor(): void {
    Scanray._resetStateAfterScan()
    document.removeEventListener('keydown', Scanray._trapKeyboardEventsDuringScan)
    document.removeEventListener('keydown', Scanray._trapCtrlKeyListener)
    onScan.detachFrom(document)
  }

  // emit parsed scan details and clean up any on-screen scan garbage
  static onScan(scanData: string, returnData?:boolean): any {
    const options = Scanray.options
    if (options.enabledLogging) console.log(`scanned: [${scanData}]`)

    // handle common control key translation optionally performed by scanner programming: [LF][RS][CR]
    let fixedScanData = scanData.replaceAll('[LF]', '\x0A').replaceAll('[CR]', '\x0D').replaceAll('[RS]', '\x1E')

    // detect scan event type and emit accordingly
    if (fixedScanData?.[0] == '%') {
      let hc = new HealthIdCard(fixedScanData)
      Scanray._emitHealthIdScanEvent(hc)

      if(returnData) {
        return hc;
      }
    }
    if (fixedScanData?.[0] == '@') {
      let dl = new AamvaIdCard(fixedScanData)
      Scanray._emitAamvaIdScanEvent(dl)

      if(returnData) {
        return dl;
      }
    }

    // remove scanned data from any text input element having focus at time of scan
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
      if (activeElement.value.includes(Scanray.currentPrefix))
        activeElement.value = activeElement.value.replaceAll(Scanray.currentPrefix, '')
      const minLen = 10
      const formValue = activeElement.value.trim()
      const scanValue = `${Scanray.currentPrefix}${scanData}`.trim()
      if (options.enabledLogging) console.log(`activeElement.value: [${formValue}]`)
      if (scanValue.length == 0 || formValue.length == 0) return
      longestCommonSubstring([formValue, scanValue]).forEach((overlappingStringToRemove: string) => {
        // remove text from field likely to have come from scanner => hence a min-length check
        if (overlappingStringToRemove.length > minLen && formValue.includes(overlappingStringToRemove))
          activeElement.value = formValue.replace(overlappingStringToRemove, '')
      })
    }

    Scanray._resetStateAfterScan()
  }

  // convert or limit scanned values on-the-fly
  static keyCodeMapper(e: KeyboardEvent): string {
    const options = Scanray.options
    if (onScan.isScanInProgressFor(document)) {
      if (options.enabledLogging)
        console.log(
          `Pressed: [${e.key}] => [` +
            `${e.ctrlKey ? 'Ctrl' : ''}` +
            `${e.shiftKey ? 'Shift' : ''}` +
            `${e.altKey ? 'Alt' : ''}` +
            `${e.key.charCodeAt(0)} (${e.code})]`
        )

      // detect 4-digit alt-key sequences (e.g., alt+0182 => '¶')
      let altKey: string = ''
      if (e.altKey && e.code.startsWith('Numpad')) {
        e.preventDefault()
        e.stopImmediatePropagation()
        Scanray.altKeySequence += e.key
        if (Scanray.altKeySequence.length == 4) {
          const code = parseInt(Scanray.altKeySequence)
          if (!isNaN(code)) {
            altKey = String.fromCharCode(code)
            Scanray.altKeySequence = ''
          }
        }
      } else {
        Scanray.altKeySequence = ''
      }

      // skip mapping of prefix
      if (Scanray.accumulatedScanData().length == 0 && Scanray.isPrefix(altKey || e.key)) {
        Scanray.currentPrefix = altKey || e.key
        return ''
      }
      if (e.altKey && e.code.startsWith('Numpad')) return '' // prevent alt sequences from being included in stream

      // convert special control sequences seen in AAMVA barcodes
      if (e.ctrlKey && e.code == 'KeyJ') return '[LF]' // Ctrl+J
      if (e.ctrlKey && e.code == 'KeyM') return '[CR]' // Ctrl+M
      if (e.ctrlKey && e.shiftKey && e.code == 'Digit6') return '[RS]' // Ctrl+Shift+6

      // test against fixed set of printable chars (instead of an expensive regex)
      const printable = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
      if (printable.includes(e.key)) return e.key
    }
    return onScan.decodeKeyEvent(e)
  }

  static _resetStateAfterScan(): void {
    Scanray.currentPrefix = ' '
    Scanray.altKeySequence = ''
  }

  static accumulatedScanData(): string {
    return (document as any).scannerDetectionData?.vars?.accumulatedString?.[0] || ''
  }

  static prefixesExpected(): number[] {
    return (document as any)?.scannerDetectionData?.options?.prefixKeyCodes || []
  }

  static isPrefix(char: string): boolean {
    return Scanray.prefixesExpected().includes((char || ' ').charCodeAt(0))
  }

  static currentScanHasPrefix(): boolean {
    // if available, returns any current prefix for the code being scanned
    const firstChar = (Scanray.accumulatedScanData() || ' ')[0]
    return Scanray.isPrefix(firstChar) || Scanray.isPrefix(Scanray.currentPrefix)
  }

  static canBlockKeyboardEvents(): boolean {
    // determines if prefix was scanned in current conditional scanning event
    return onScan.isScanInProgressFor(document) && Scanray.currentScanHasPrefix()
  }

  static _trapKeyboardEventsDuringScan(e: KeyboardEvent): void {
    if (Scanray.canBlockKeyboardEvents()) e.preventDefault()
  }

  static _trapAltKeyListener(e: KeyboardEvent): void {
    // prevent windows alt-key combinations from being entered into browser window
    if (e.altKey && e.code.startsWith('Numpad')) e.preventDefault()
  }

  static _trapCtrlKeyListener(e: KeyboardEvent): void {
    // only allow these whitelisted keyboard sequences:
    // copy, cut, paste, print, find, reload, inspect, select all
    if (e.ctrlKey && !['KeyC', 'KeyX', 'KeyV', 'KeyP', 'KeyF', 'KeyR', 'KeyI', 'KeyA'].includes(e.code)) {
      e.preventDefault()
      if (Scanray.options.enabledLogging)
        console.log(`Blocked control sequence: [${JSON.stringify({ code: e.code, ctrlKey: e.ctrlKey, key: e.key })}]`)
    }
  }

  static _emitAamvaIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<any>('aamvaIdScan', { detail: detail })
    document.dispatchEvent(idScanEvent)
  }

  static _emitHealthIdScanEvent(detail: any): void {
    const idScanEvent = new CustomEvent<any>('healthIdScan', { detail: detail })
    document.dispatchEvent(idScanEvent)
  }
}
