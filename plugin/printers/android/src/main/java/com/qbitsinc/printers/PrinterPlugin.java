package com.qbitsinc.printers;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {
    private UsbManager usbManager;
    private UsbDevice usbDevice;
    private final ByteArrayOutputStream printBuffer = new ByteArrayOutputStream();
    private static final String ACTION_USB_PERMISSION = "com.qbitsinc.printers.USB_PERMISSION";
    private int paperWidth = 48; // Valor por defecto para 58mm (48 caracteres)
    private String currentAlign = "left";
    private String currentFontSize = "normal";
    private String currentFontWeight = "normal";

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if (device != null) {
                            usbDevice = device;
                        }
                    }
                }
            } else if (UsbManager.ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                checkAndRequestPermission(device);
            }
        }
    };

    @Override
    public void load() {
        super.load();
        usbManager = (UsbManager) getContext().getSystemService(Context.USB_SERVICE);

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_USB_PERMISSION);
        filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);
        getContext().registerReceiver(usbReceiver, filter);

        checkConnectedDevices();
    }

    @Override
    protected void handleOnDestroy() {
        getContext().unregisterReceiver(usbReceiver);
        super.handleOnDestroy();
    }

    @PluginMethod
    public void setPaperWidth(PluginCall call) {
        try {
            int width = call.getInt("width", 48);
            if (width > 0) {
                paperWidth = width;
                call.resolve();
            } else {
                call.reject("Paper width must be positive");
            }
        } catch (Exception e) {
            call.reject("Error setting paper width: " + e.getMessage());
        }
    }
    private String removeAccents(String text) {
        return text
            .replace("á", "a").replace("é", "e").replace("í", "i")
            .replace("ó", "o").replace("ú", "u")
            .replace("Á", "A").replace("É", "E").replace("Í", "I")
            .replace("Ó", "O").replace("Ú", "U")
            .replace("ñ", "n").replace("Ñ", "N");
    }

    @PluginMethod
    public void text(PluginCall call) {
        try {
            String text = removeAccents(call.getString("text", ""));
            String align = call.getString("align", currentAlign);
            String fontSize = call.getString("fontSize", currentFontSize);
            String fontWeight = call.getString("fontWeight", currentFontWeight);

            // Aplicar estilos
            applyStyles(align, fontSize, fontWeight);

            // Procesar texto según alineación
            switch (align) {
                case "center":
                    centerText(text);
                    break;
                case "right":
                    rightAlignText(text);
                    break;
                default:
                    leftAlignText(text);
            }

            call.resolve();
        } catch (Exception e) {
            call.reject("Error in text method: " + e.getMessage());
        }
    }

    private void centerText(String text) throws IOException {
        // Calcular espacios para centrar
        int textWidth = getEffectiveTextWidth(text);
        int spaces = (paperWidth - textWidth) / 2;

        // Aplicar espacios solo si el texto cabe
        if (spaces > 0) {
            printBuffer.write(new String(new char[spaces]).replace("\0", "").getBytes("UTF-8"));
        }

        // Escribir el texto
        printBuffer.write(text.getBytes("UTF-8"));
        printBuffer.write("\n".getBytes("UTF-8"));
    }

    private void rightAlignText(String text) throws IOException {
        int textWidth = getEffectiveTextWidth(text);
        int spaces = paperWidth - textWidth;

        if (spaces > 0) {
            printBuffer.write(new String(new char[spaces]).replace("\0", "").getBytes("UTF-8"));
        }

        printBuffer.write(text.getBytes("UTF-8"));
        printBuffer.write("\n".getBytes("UTF-8"));
    }

    private void leftAlignText(String text) throws IOException {
        printBuffer.write(text.getBytes("UTF-8"));
        printBuffer.write("\n".getBytes("UTF-8"));
    }

    private int getEffectiveTextWidth(String text) {
        // Considerar que caracteres grandes ocupan más espacio
        if (currentFontSize.equals("large")) {
            return (int) Math.ceil(text.length() / 2.0);
        }
        return text.length();
    }

    @PluginMethod
    public void newLine(PluginCall call) {
        try {
            printBuffer.write("\n".getBytes("UTF-8"));
            call.resolve();
        } catch (Exception e) {
            call.reject("Error adding new line: " + e.getMessage());
        }
    }

    @PluginMethod
    public void qr(PluginCall call) {
        try {
            String data = call.getString("data");
            if (data == null || data.isEmpty()) {
                call.reject("QR data is required");
                return;
            }

            int size = call.getInt("size", 4);
            int correction = call.getInt("correction", 1);
            String align = call.getString("align", "center");

            addQRCode(printBuffer, data, size, correction, align);
            call.resolve();
        } catch (Exception e) {
            call.reject("Error adding QR code: " + e.getMessage());
        }
    }

    private void addQRCode(ByteArrayOutputStream output, String data, int size, int correction, String align) throws Exception {
        // Validar parámetros
        if (size < 1 || size > 8) throw new IllegalArgumentException("QR size must be 1-8");
        if (correction < 0 || correction > 3) throw new IllegalArgumentException("QR correction must be 0-3");
        if (data == null || data.isEmpty()) throw new IllegalArgumentException("QR data cannot be empty");

        // Aplicar alineación
        switch (align) {
            case "center":
                centerText(""); // Aplicar centrado
                break;
            case "right":
                rightAlignText(""); // Aplicar alineación derecha
                break;
            default:
                leftAlignText(""); // Aplicar alineación izquierda
        }

        // Comandos ESC/POS para QR
        byte[] qrCmd = {
            0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00, // Inicializar QR
            0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, (byte)size,  // Tamaño
            0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, (byte)(48 + correction) // Corrección
        };
        output.write(qrCmd);

        // Escribir datos del QR
        byte[] dataBytes = data.getBytes("ISO-8859-1");
        int length = dataBytes.length + 3;
        output.write(new byte[]{
            0x1D, 0x28, 0x6B,
            (byte)(length & 0xFF),
            (byte)((length >> 8) & 0xFF),
            0x31, 0x50, 0x30
        });
        output.write(dataBytes);

        // Imprimir QR
        output.write(new byte[]{0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30});
        output.write("\n\n".getBytes("UTF-8")); // Espacios después del QR
    }

    @PluginMethod
    public void print(PluginCall call) {
        try {
            if (usbDevice == null) {
                call.reject("No printer connected");
                return;
            }

            UsbDeviceConnection connection = usbManager.openDevice(usbDevice);
            if (connection == null) {
                call.reject("Failed to open connection");
                return;
            }

            try {
                for (int i = 0; i < usbDevice.getInterfaceCount(); i++) {
                    UsbInterface usbInterface = usbDevice.getInterface(i);
                    connection.claimInterface(usbInterface, true);

                    for (int j = 0; j < usbInterface.getEndpointCount(); j++) {
                        UsbEndpoint endpoint = usbInterface.getEndpoint(j);
                        if (endpoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                            connection.bulkTransfer(endpoint, printBuffer.toByteArray(), printBuffer.size(), 5000);
                            break;
                        }
                    }
                    connection.releaseInterface(usbInterface);
                }

                printBuffer.reset();
                call.resolve();
            } finally {
                connection.close();
            }
        } catch (Exception e) {
            call.reject("Error in print method: " + e.getMessage());
        }
    }
    
    private void setAlignment(String align) throws IOException {
        byte[] command;
        switch (align) {
            case "center":
                command = new byte[]{0x1B, 0x61, 0x01}; // Center
                break;
            case "right":
                command = new byte[]{0x1B, 0x61, 0x02}; // Right
                break;
            default:
                command = new byte[]{0x1B, 0x61, 0x00}; // Left
                break;
        }
        printBuffer.write(command);
    }

    private void applyStyles(String align, String fontSize, String fontWeight) throws IOException {
        // Alineación (se aplica en cada comando de texto)
        currentAlign = align;

        // Tamaño de fuente
        currentFontSize = fontSize;
        byte sizeByte = 0x00;
        if ("large".equals(fontSize)) {
            sizeByte = 0x11;
        } else if ("small".equals(fontSize)) {
            sizeByte = 0x01;
        }
        printBuffer.write(new byte[]{0x1D, 0x21, sizeByte});

        // Negritas
        currentFontWeight = fontWeight;
        byte boldByte = ("bold".equals(fontWeight) || "semibold".equals(fontWeight)) ? (byte)0x01 : (byte)0x00;
        printBuffer.write(new byte[]{0x1B, 0x45, boldByte});
    }

    private void checkConnectedDevices() {
        HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
        for (UsbDevice device : deviceList.values()) {
            checkAndRequestPermission(device);
        }
    }

    private void checkAndRequestPermission(UsbDevice device) {
        if (isPrinterDevice(device)) {
            if (usbManager.hasPermission(device)) {
                usbDevice = device;
            } else {
                PendingIntent permissionIntent = PendingIntent.getBroadcast(
                    getContext(),
                    0,
                    new Intent(ACTION_USB_PERMISSION),
                    PendingIntent.FLAG_IMMUTABLE
                );
                usbManager.requestPermission(device, permissionIntent);
            }
        }
    }

    private boolean isPrinterDevice(UsbDevice device) {
        for (int i = 0; i < device.getInterfaceCount(); i++) {
            UsbInterface usbInterface = device.getInterface(i);
            if (usbInterface.getInterfaceClass() == 7) { // Printer class
                return true;
            }
        }
        return false;
    }
}
