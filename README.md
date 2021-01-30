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

