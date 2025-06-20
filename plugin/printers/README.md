# printers

Impresoras

## Install

```bash
npm install printers
npx cap sync
```

## API

<docgen-index>

* [`print(...)`](#print)
* [`connectBluetoothPrinter(...)`](#connectbluetoothprinter)
* [`addListener('printerEvent', ...)`](#addlistenerprinterevent-)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### print(...)

```typescript
print(options: { text: string; type?: 'usb' | 'bluetooth'; }) => Promise<{ success: boolean; }>
```

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code>{ text: string; type?: 'usb' \| 'bluetooth'; }</code> |

**Returns:** <code>Promise&lt;{ success: boolean; }&gt;</code>

--------------------


### connectBluetoothPrinter(...)

```typescript
connectBluetoothPrinter(options: { deviceAddress: string; }) => Promise<{ connected: boolean; }>
```

| Param         | Type                                    |
| ------------- | --------------------------------------- |
| **`options`** | <code>{ deviceAddress: string; }</code> |

**Returns:** <code>Promise&lt;{ connected: boolean; }&gt;</code>

--------------------


### addListener('printerEvent', ...)

```typescript
addListener(eventName: 'printerEvent', listenerFunc: (event: PrinterEvent) => void) => Promise<PluginListenerHandle> & PluginListenerHandle
```

| Param              | Type                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **`eventName`**    | <code>'printerEvent'</code>                                               |
| **`listenerFunc`** | <code>(event: <a href="#printerevent">PrinterEvent</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt; & <a href="#pluginlistenerhandle">PluginListenerHandle</a></code>

--------------------


### Interfaces


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### PrinterEvent

| Prop             | Type                                                 |
| ---------------- | ---------------------------------------------------- |
| **`type`**       | <code>'usb' \| 'bluetooth'</code>                    |
| **`deviceName`** | <code>string</code>                                  |
| **`event`**      | <code>'printerDetected' \| 'printerConnected'</code> |

</docgen-api>
