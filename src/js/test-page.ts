import ScanMonitor from './scan-monitor'

ScanMonitor.activateScanMonitor()
document.addEventListener('healthIdScan', (e) => {
    console.log(`healthIdScan: [${(e as CustomEvent).detail}]`)
})

import HealthIdCard from './health-id-card'
let hc = new HealthIdCard('%H^12345678901^^^BN123456^PC1234567890^GR123456789012345?')
//let hc = new HealthIdCard('%WH9101004444ZGP923333171^SMITH/JOSE/MARCO^DB19860623?     ')
//let hc = new HealthIdCard('%WH9118772604960235001^GARCIA/MOSES/N^GR8F9999^BN610444^PC9999^RGUHC^DI20161008?                                                        ')
console.log(`healthId: [${hc.toJson()}]`)

