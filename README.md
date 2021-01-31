# Barcode Scanner Tester

This sample project serves a test page for debugging and validation purposes.

## Tested Scanners
* NADAMOO Wireless 2D Barcode Scanner (BUR3072) [server@nadamoo.cn; nadamoo@126.com]
  * Common Scanner Settings
    * Auto induction scanning enabled (high sensitivity) - pg 16
    * Prevent Duplicates for 2s - p18
    * Keep red aiming beam on all the time - p19
    * Beep volume low - p23

## Installation

Install NPM dependencies

```bash
npm i
```

## Usage

### Development server

You can view the development server at `localhost:8080`:

```bash
npm start
```

### Production build

Serve assets that are built into the `dist` folder by the following command:

```bash
npm run build
```

# Health Identification Card Standard

The purpose of Health Identification Cards is to identify the card issuer and the cardholder to facilitate health care transactions and to provide input data for such transactions.  Very basic insurance and patient identification information is provided.  This information varies significantly depending on the payer.

The only required fields are:

  * firstName
  * lastName
  * issuerId
  * cardholderId
  * cardType (_WH_ - WEDI Health ID, ???)
## Examples

**BCBS - Blue Cross Blue Shield**

```
 {
   "firstName":"MOSES",
   "lastName":"GARCIA",
   "middleName":"N",
   "cardType":"WH",
   "issuerId":"9118772604",
   "cardholderId":"960235001",
   "groupNumber":"8F9999",
   "issueDate":"2016-10-08",
   "rxBin":"610444",
   "rxPcn":"9999"
  }
```

**UHC - United Healthcare**
```
{
  "firstName":"JOSE",
  "lastName":"SMITH",
  "middleName":"MARCO",
  "birthDate":"1986-06-23",
  "cardType":"WH",
  "issuerId":"9101004444",
  "cardholderId":"ZGP923333171"
}
```
