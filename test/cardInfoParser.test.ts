import  Scanray from '../src/index';
import AamvaIdCard from '../src/adapters/aamvaIdCard';
import healthIdCard from  '../src/adapters/healthIdCard';

const exampleEncodedString:string = '%WH9104440260ZGP444461171^SMITH/GABRIEL^DB19860101?';

Scanray.activateMonitor({
  blockKeyboardEventsDuringScan: true,
  blockAltKeyEvents: true,
  enabledLogging: false,
  prefixKeyCodes: [182] // '¶'  // optional prefix improves scanning experience within web browser
});

let cardInfo:AamvaIdCard|healthIdCard = Scanray.onScan(exampleEncodedString, true); // Send in the "scanned" data.

describe('example_encoded_string_does_evaluate', () => {
  it('gets_first_name', () => {
    expect(cardInfo.firstName).toEqual('GABRIEL');
  });

  it('gets_last_name', () => {
    expect(cardInfo.lastName).toEqual('SMITH');
  });

  it('gets_birth_date', () => {
    expect(cardInfo.birthDate).toEqual('1986-01-01');
  });

  it('gets_cardholder_id', () => {
    expect(cardInfo.cardholderId).toEqual('ZGP444461171');
  });
});
