import type { PluginListenerHandle } from "@capacitor/core";


export interface PrinterEvent {
  type: 'usb' | 'bluetooth';
  deviceName: string;
  event: 'printerDetected' | 'printerConnected';
}

export interface PrinterPlugin {
  print(options: { text: string; type?: 'usb' | 'bluetooth' }): Promise<{ success: boolean }>;
  connectBluetoothPrinter(options: { deviceAddress: string }): Promise<{ connected: boolean }>;
  addListener(
    eventName: 'printerEvent',
    listenerFunc: (event: PrinterEvent) => void
  ): Promise<PluginListenerHandle> & PluginListenerHandle;
}
