import ScanMonitor from './scan-monitor'

ScanMonitor.activateScanMonitor()
document.addEventListener('healthIdScan', (e) => {
    console.log(`healthIdScan: [${(e as CustomEvent).detail}]`)
})