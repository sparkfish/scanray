/* eslint-disable no-console */
/* eslint-disable max-len */
import { longestCommonSubstring } from 'string-algorithms'

const onScan = require('onscan.js')

global.onScan = onScan

const isDebug = true    // logs to console for debugging purposes

// enable bar code scan events for the entire document
onScan.attachTo(document, {

  keyCodeMapper(oEvent) {
    if( onScan.isScanInProgressFor(document) ) {
      const iKeyCode = Number(oEvent.which)
      if( isDebug )
        console.log(` Pressed: ${iKeyCode} => [${String.fromCharCode(iKeyCode)}]`)
      return (iKeyCode === 191) ? '/' : onScan.decodeKeyEvent(oEvent)
    }
    return onScan.decodeKeyEvent(oEvent)
  },

  onScan(scanData) {
    // remove scanned data from any text input element having focus at time of scan
    const { activeElement } = document
    if( isDebug )
      console.log(`scanned: [${scanData}]`)
    if( activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) !== -1 ) {
      if( isDebug )
        console.log(`activeElement.value: [${activeElement.value}]`)
      longestCommonSubstring([activeElement.value, scanData]).forEach(
        overlappingStringToRemove => {
          // remove text from field likely to have come from scanner => hence a min-length check
          const text = activeElement.value.trim()
          if( overlappingStringToRemove.length > 10 && text.includes(overlappingStringToRemove) )
            activeElement.value = text.replace(overlappingStringToRemove, '')

          // fix handle scanner input bug => remove any errant floating question mark
          if( activeElement.value.endsWith('?') )
          {
            activeElement.value = activeElement.value.replaceAll('?', '')
          }
        }
      )
    }
  },
})
