<script>
  import { onMount, onDestroy } from 'svelte'
  import Form from '@svelteschool/svelte-forms'
  import Scanray, { onScan } from './scanray'

  // initialize scanner and events
  $: values = {}

  document.addEventListener('healthIdScan', (e) => {
    values = e.detail
    console.log(`healthIdScan: [${e.detail.toJson()}]`)
  })
  document.addEventListener('aamvaIdScan', (e) => {
    values = e.detail
    console.log(`aamvaIdScan: [${e.detail.toJson()}]`)
  })

  onMount(() => {
    const options = {
      blockKeyboardEventsDuringScan: true,
      blockAltKeyEvents: true,
      enabledLogging: false,
      prefixKeyCodes: [182] // '¶'  // optional prefix improves scanning experience within web browser
    }
    Scanray.activateMonitor(options)

    // simulate a scan event, for example, in case user does not have a barcode scanner
    window.setTimeout(() => {
      onScan.simulate(document, '%WH9104440260ZGP444461171^SMITH/GABRIEL^DB19860101?')
    }, 1000)
  })

  onDestroy(() => {
    Scanray.deactivateMonitor()
  })
</script>

<svelte:head
  ><script src="https://cdn.jsdelivr.net/gh/pkoretic/pdf417-generator@master/lib/libbcmath.js"></script><script
    src="https://cdn.jsdelivr.net/gh/pkoretic/pdf417-generator@master/lib/bcmath.js"></script><script
    src="https://cdn.jsdelivr.net/gh/pkoretic/pdf417-generator@master/lib/pdf417.js"></script></svelte:head
>
<div class="app">
  <input placeholder="Test scanner here..." />

  <hr noshade="noshade" size="4" hidden={!values?.lastName} />

  <Form bind:values>
    <div hidden={!values?.firstName?.length > 0}>
      <label for="firstName">firstName</label>
      <input type="text" name="firstName" />
    </div>

    <div hidden={!values?.middleName?.length > 0}>
      <label for="middleName">middleName</label>
      <input type="text" name="middleName" />
    </div>

    <div hidden={!values?.lastName?.length > 0}>
      <label for="lastName">lastName</label>
      <input type="text" name="lastName" />
    </div>

    <div hidden={!values?.suffix?.length > 0}>
      <label for="suffix">suffix</label>
      <input type="text" name="suffix" />
    </div>

    <div hidden={!values?.birthDate?.length > 0}>
      <label for="birthDate">birthDate</label>
      <input type="text" name="birthDate" />
    </div>

    <div hidden={!values?.sex?.length > 0}>
      <label for="sex">sex</label>
      <input type="text" name="sex" />
    </div>

    <div hidden={!values?.streetAddress1?.length > 0}>
      <label for="streetAddress1">streetAddress1</label>
      <input type="text" name="streetAddress1" />
    </div>

    <div hidden={!values?.streetAddress2?.length > 0}>
      <label for="streetAddress2">streetAddress2</label>
      <input type="text" name="streetAddress2" />
    </div>

    <div hidden={!values?.city?.length > 0}>
      <label for="city">city</label>
      <input type="text" name="city" />
    </div>

    <div hidden={!values?.state?.length > 0}>
      <label for="state">state</label>
      <input type="text" name="state" />
    </div>

    <div hidden={!values?.zip?.length > 0}>
      <label for="zip">zip</label>
      <input type="text" name="zip" />
    </div>

    <div hidden={!values?.cardholderId?.length > 0}>
      <label for="cardholderId">cardholderId</label>
      <input type="text" name="cardholderId" />
    </div>

    <div hidden={!values?.groupNumber?.length > 0}>
      <label for="groupNumber">groupNumber</label>
      <input type="text" name="groupNumber" />
    </div>

    <div hidden={!values?.rxBin?.length > 0}>
      <label for="rxBin">rxBin</label>
      <input type="text" name="rxBin" />
    </div>

    <div hidden={!values?.rxPcn?.length > 0}>
      <label for="rxPcn">rxPcn</label>
      <input type="text" name="rxPcn" />
    </div>

    <div hidden={!values?.primaryPhysicianNpi?.length > 0}>
      <label for="primaryPhysicianNpi">primaryPhysicianNpi</label>
      <input type="text" name="primaryPhysicianNpi" />
    </div>
  </Form>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    min-height: 95vh;
    background-color: #f9f6f6;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .app {
    text-align: center;
    color: #333;
    font-size: calc(10px + 2vmin);
    position: relative;
    border-radius: 8px;
  }

  label {
    display: block;
    color: darkgrey;
    font-weight: bold;
    padding: 10px 0 4px 0;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 1.9px;
    line-height: 2;
  }

  input {
    font-family: inherit;
    font-size: inherit;
    max-width: 500px;
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid grey;
    border-radius: 4px;
    transition: all 150ms ease;
    background: white;
    text-align: center;
  }
</style>
