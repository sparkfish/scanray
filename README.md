![Scanray Logo](https://github.com/sparkfish/scanray/blob/HEAD/scanray.svg)

<strong>
  <h2 style="text-align: center; width: 100%;">
    Scanner events to streamline data extraction from ID cards into web-based EMRs
  </h2>
</strong>
<hr>

**Scanray** is a barcode scanner utility package for use with web-based Electronic Medical Records (EMR) systems. With Scanray, PDF417 bardcode scanners can quickly and accurately extract the backs of Drivers Licenses and Health ID cards directly into web-based EMRs using inexpensive laser barcode scanners. Scan events are easily captured to provide extracted data elements as native Javascript objects.

It's a common need in the healthcare settings to enter patient demographics accurately and quickly. This is often entered manually or by using a TWAIN scanner to capture the details from images of these ID cards. However, using a document scanner is both slow and presents accuracy problems. Document scanners experience mechanical malfunctions frequently and require more expensive models in order to sustain high volume usage and sufficient image quality.


# Why Scanray? 
When using a scanner it acts like a keyboard an inputs the data as characters into your machine. The problem here is the command character sets are included in these data strings from the scanners. These can cause windows to open or quit and can even cause other unintended behaviour. Scanray parses and escapes these characters so you can focus on using the scanned data in your applications.

# Quick Start

### Requirements

- NPM version >=10
- A Physical or Virtual Scanner

### Installation

Using NPM you can quickly install **Scanray** using the `npm i @sparkfish/scanray` command. Alternatively you can install Scanray using Yarn with the following command `yarn add @sparkfish/scanray`.

### Importing

To get started with the basics you only need to import these items. Scanray is the main utility. Each cards type contains card specific parsers and the data class in which you will access data.

```
import Scanray from '../src/index';
import AamvaIdCard from '../src/adapters/aamvaIdCard'; // Optional
import healthIdCard from '../src/adapters/healthIdCard'; // Optional
```

The card adapter imports are optional. This is because Scanray will automatically dump the contents of the card into the correct adapter. However if you are working in Typescript it is a good idea to import the class definitions to avoid compiling errors or warnings.

### Testing Installation

Once Scanray is installed in your project and you have imported the minimum elements it is time to wire Scanray up to your application. The example below shows a simple and basic example.

```
import Scanray from '../src/index';
import AamvaIdCard from '../src/adapters/aamvaIdCard';
import healthIdCard from '../src/adapters/healthIdCard';

const exampleEncodedString: string =
  '%WH9104440260ZGP444461171^SMITH/GABRIEL^DB19860101?';

Scanray.activateMonitor({
  blockKeyboardEventsDuringScan: true,
  blockAltKeyEvents: true,
  enabledLogging: false,
  prefixKeyCodes: [182], // '¶'  // optional prefix improves scanning experience within web browser
});

let cardInfo: AamvaIdCard | healthIdCard = Scanray.onScan(
  exampleEncodedString,
  true // return data directly instead of through browser events
); // Send in the "scanned" data.
```

If everything worked as expected you should be greeted with some user data inside the `cardInfo` variable. Look below in the Class reference section for more information on what data becomes available.

## Class References

### Card Adapters [AamvaIdCard, healthIdCard]

The card adapters share the same public getters.

##### Note:

1. <small>In type script getters are class methods. However you can access them without directly calling the method. </small>
   `EX: card.lastName = card.lastName()`


##### A = Aamva | H = Heath

| Getter                      | A   | H   | Type      | Description                             |
| --------------------------- | --- | --- | --------- | --------------------------------------- |
| `card.fullName`             | x   |     | `string`  | Card holders full name                  |
| `card.firstName`            | x   | x   | `string`  | Card holders first name                 |
| `card.middleName`           | x   | x   | `string`  | Card holders middle name                |
| `card.lastName`             | x   | x   | `string`  | Card holders last name                  |
| `card.suffix`               | x   | x   | `string`  | Card holders name prefix                |
| `card.prefix`               | x   |     | `string`  | Card holders name suffix                |
| `card.birthDate`            | x   | x   | `string`  | Card holders birthdate                  |
| `card.sex`                  | x   |     | `string`  | Card holders sex                        |
| `card.issuerId`             | x   | x   | `string`  | Card issuers id                         |
| `card.type`                 | x   | x   | `string`  | Card type                               |
| `card.cardType`             |     | x   | `string`  | Card type                               |
| `card.version`              | x   |     | `number`  | Card version                            |
| `card.race`                 | x   |     | `string`  | Card holders race                       |
| `card.ethnicity`            | x   |     | `string`  | Card holders ethnicity                  |
| `card.eyeColor`             | x   |     | `string`  | Card holders eye color                  |
| `card.hairColor`            | x   |     | `string`  | Card holders hair color                 |
| `card.weight`               | x   |     | `string`  | Card holders weight                     |
| `card.height`               | x   |     | `string`  | Card holders height                     |
| `card.streetAddress1`       | x   |     | `string`  | Card holders street address             |
| `card.streetLine1`          |     | x   | `string`  | Card holders street address             |
| `card.streetAddress2`       | x   |     | `string`  | Card holders street address second line |
| `card.streeLine2`           |     | x   | `string`  | Card holders street address second line |
| `card.city`                 | x   | x   | `string`  | Card holders city                       |
| `card.state`                | x   | x   | `string`  | Card holders state                      |
| `card.zip`                  | x   | x   | `string`  | Card holders zip code                   |
| `card.country`              | x   | x   | `string`  | Card holders country                    |
| `card.birthPlace`           | x   |     | `string`  | Card holders birth place                |
| `card.isDonor`              | x   |     | `boolean` | Card holders donor status               |
| `card.isVeteran`            | x   |     | `boolean` | Card holders veteran status             |
| `card.cardHolderId`         | x   | x   | `string`  | Card holders id                         |
| `card.expirationDate`       | x   |     | `string`  | Cards expiration date                   |
| `card.issueDate`            | x   | x   | `string`  | Cards issue date                        |
| `card.ssn`                  | x   |     | `string`  | Card holders ssn                        |
| `card.drugCardholderId`     |     | x   | `string`  | Card holders drug holder ID             |
| `card.groupNumber`          |     | x   | `string`  | Card holders group number               |
| `card.rxBin`                |     | x   | `string`  | Card holders rxBin Id                   |
| `card.rxPcn`                |     | x   | `string`  | Card holders rxPcn Id                   |
| `card.primaryPhysicianNpi`  |     | x   | `string`  | Card holders primary physician          |
| `card.primaryPhysicianName` |     | x   | `string`  | Card holders primary physician name     |

| Method          | Return Type | Description                |
| --------------- | ----------- | -------------------------- |
| `card.toJson()` | `JSON`      | Convert class data to Json |

--

### Scanray

**_scanrayOptions_**

| scanrayOptions                   | Required                                   | Type            |
| -------------------------------- | ------------------------------------------ | --------------- |
| `blockKeyboardEventsDuringScan`  | <span style="color: green">Optional</span> | `boolean`       |
| `blockAltKeyEvents`              | <span style="color: green">Optional</span> | `boolean`       |
| `blockBadKeyboardShortcutEvents` | <span style="color: green">Optional</span> | `boolean`       |
| `enabledLogging`                 | <span style="color: green">Optional</span> | `boolean`       |
| `prefixKeyCodes`                 | <span style="color: green">Optional</span> | `number<array>` |
| `suffixKeyCodes`                 | <span style="color: green">Optional</span> | `number<array>` |

--

#### Scanray.activateMonitor(options: scanrayOptions)

This method activates the event monitor to listen for code scans. It takes in the series of optional `scanrayOptions` object. The code scanner is attached to the `document` so that we enable the code scanning for the whole document.

#### Scanray.deactivateMonitor()

This method resets the scanner state and removes the event listeners from the document. Then finally it removes the scanner itself from the document.

#### Scanray.onScan(scanData: string, returnData?: boolean)

This method is called when the document has triggered the scan event and the Scanray listeners have detected it. It takes in the scanData and determines which adapter type it is. It then fires a new event that the adapter has been filled. Or if you have sent in the returnData param and it is true it will return the data directly.

## Roadmap

- [x] Suppress browser's keyboard events that conflict with AAMVA bardcode data injected into keyboard stream
- [x] Parse AAMVA data elements into native javascript objects
- [x] Parse Health ID Card data elements into native javascript objects
- [x] Expose scan events and extracted data as document events (e.g, for use w/ `document.addEventListener`)
- [ ] Convert from static Scanray to object instance
- [ ] Add more options to code more parameterizable
- [ ] Add trace level setting for console logging
- [ ] Issue PR to onScan.js to get away from deprecated `keyCode` references
- [ ] Issue PR to onScan.js to add `scanStart` and `scanEnd` events
- [ ] Issue PR to onScan.js to track prefix from start of new scan and add `requirePrefix` param to `onScan.isScanInProgressFor()`

## Credits

This library heavily relies on [onScan.js](https://github.com/axenox/onscan.js) by Andrej Kabachnik.

## License

This is an open source project licensed under MIT.
