![Scanray Logo](https://github.com/sparkfish/scanray/blob/HEAD/scanray.svg)

<center><strong><h3>Scanner events to streamline data extraction from ID cards into web-based EMRs</h3></strong></center>
<hr>
**Scanray** is a barcode scanner utility package for use with web-based Electronic Medical Records (EMR) systems. With Scanray, PDF417 bardcode scanners can quickly and accurately extract the backs of Drivers Licenses and Health ID cards directly into web-based EMRs using inexpensive laser barcode scanners. Scan events are easily captured to provide extracted data elements as native Javascript objects.

It's a common need in the healthcare settings to enter patient demographics accurately and quickly. This is often entered manually or by using a TWAIN scanner to capture the details from images of these ID cards. However, using a document scanner is both slow and presents accuracy problems. Document scanners experience mechanical malfunctions frequently and require more expensive models in order to sustain high volume usage and sufficient image quality.

## Quick Start

### Requirements
* Node >=10
* A Physical or Virtual Scanner


### Installation
Using NPM you can quickly install **Scanray** using the ```npm i @sparkfish/scanray``` command. Alternatively you can install Scanray using Yarn with the following command ```yarn add @sparkfish/scanray```. 

### Importing
To get started with the basics you only need to import these items. Scanray is the main utility. Each cards type contains card specific parsers and the data class in which you will access data. 

```
import Scanray from '../src/index';
import AamvaIdCard from '../src/adapters/aamvaIdCard'; // Optional
import healthIdCard from '../src/adapters/healthIdCard'; // Optional
```

The card adapter imports are optional. This is because Scanray will automatically dump the contents of the card into the correct adapter. However if you are working in Typescript it is a good idea to import the class definitions to avoid compiling errors or warnings.

-- ***as more adapters or methods become available this section will be updated*** --

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

If everything worked as expected you should be greeted with some user data inside the ```cardInfo``` variable. Look below in the Class reference section for more information on what data becomes available. 

## Class References

### Card Adapters [AamvaIdCard, healthIdCard]
The card adapters share the same public getters.

##### Note: 
1) <small>In type script getters are class methods. However you can access them without directly calling the method. </small>
```EX: card.lastName = card.lastName()```

| Getter 		   	| Return Type			| Description |
|---------------	|------------			|-------------|
|```card.fullName```		| ```string```| Card holders full name |
|```card.firstName```		|```string```| Card holders first name |
|```card.middleName```		| ```string```| Card holders middle name |
|```card.lastName```		| ```string```| Card holders last name |
|```card.suffix```			| ```string```| Card holders name prefix |
|```card.prefix```			| ```string```| Card holders name suffix |
|```card.birthDate```		|```string```| Card holders birthdate |
|```card.sex```				| ```string```| Card holders sex |
|```card.issuerId```		| ```string```| Card issuers id |
|```card.type```				| ```string```| Card type |
|```card.version```			| ```number```| Card version |
|```card.race```				| ```string```| Card holders race |
|```card.ethnicity```		| ```string```| Card holders ethnicity |
|```card.eyeColor```		| ```string```| Card holders eye color |
|```card.hairColor```		| ```string```| Card holders hair color |
|```card.weight```			| ```string```| Card holders weight |
|```card.height```			| ```string```| Card holders height |
|```card.streetAddress1```	| ```string```| Card holders street address |
|```card.streetAddress2```	| ```string```| Card holders street address second line |
|```card.city```				| ```string```| Card holders city |
|```card.state```			| ```string```| Card holders state |
|```card.zip```				| ```string```| Card holders zip code |
|```card.country```			| ```string```| Card holders country |
|```card.birthPlace```		| ```string```| Card holders birth place |
|```card.isDonor```			| ```boolean```| Card holders donor status |
|```card.isVeteran```		| ```boolean```| Card holders veteran status |
|```card.cardHolderId```	| ```string```| Card holders id |
|```card.expirationDate```	| ```string```| Cards expiration date |
|```card.issueDate```		| ```string```| Cards issue date |
|```card.ssn```				| ```string```| Card holders ssn |

| Method 		   	| Return Type			| Description |
|---------------	|------------			|-------------|
| ```card.toJson()``` | ```JSON```| Convert class data to Json|
--
### Scanray

***scanrayOptions***

| scanrayOptions   	| Required			| Type           |
|---------------		|------------			| ---------------|
| ```blockKeyboardEventsDuringScan``` 	| <span style="color: green">Optional</span> | ```boolean```|
| ```blockAltKeyEvents ``` 				| <span style="color: green">Optional</span> | ```boolean```|
| ```blockBadKeyboardShortcutEvents ```	| <span style="color: green">Optional</span> | ```boolean```|
| ```enabledLogging ```						| <span style="color: green">Optional</span> | ```boolean```|
| ```prefixKeyCodes ```						| <span style="color: green">Optional</span> | ```number<array>```|
| ```suffixKeyCodes ```						| <span style="color: green">Optional</span> | ```number<array>```|
--
#### Scanray.activateMonitor(options: scanrayOptions)
This method activates the event monitor to listen for code scans. It takes in the series of optional ```scanrayOptions``` object. The code scanner is attached to the ```document``` so that we enable the code scanning for the whole document.

#### Scanray.deactivateMonitor()
This method resets the scanner state and removes the event listeners from the document. Then finally it removes the scanner itself from the document.

#### Scanray.onScan(scanData: string, returnData?: boolean)
This method is called when the document has triggered the scan event and the Scanray listeners have detected it. It takes in the scanData and determines which adapter type it is. It then fires a new event that the adapter has been filled. Or if you have sent in the returnData param and it is true it will return the data directly.


