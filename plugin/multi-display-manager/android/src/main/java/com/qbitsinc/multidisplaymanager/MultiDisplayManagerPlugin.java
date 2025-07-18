package com.qbitsinc.multi.display.manager;

import android.app.Presentation;
import android.content.Context;
import android.hardware.display.DisplayManager;
import android.view.Display;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject; // Importación añadida

@CapacitorPlugin(name = "MultiDisplayManager")
public class MultiDisplayManagerPlugin extends Plugin {

    private static final String TAG = "MultiDisplayManager";
    private WebViewPresentation currentPresentation;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private String lastUrl = "";

    @PluginMethod
    public void showOnSecondScreen(PluginCall call) {
        String url = call.getString("url");

        if (url == null || url.isEmpty()) {
            call.reject("URL no proporcionada");
            return;
        }

        mainHandler.post(() -> {
            try {
                // Si la URL es diferente, cerrar la presentación existente
                if (currentPresentation != null && currentPresentation.isShowing()) {
                    if (url.equals(lastUrl)) {
                        // Misma URL - toggle: cerrar presentación
                        currentPresentation.dismiss();
                        currentPresentation = null;
                        lastUrl = "";
                        call.resolve(createResponse(false, "Pantalla secundaria cerrada"));
                        return;
                    } else {
                        // Nueva URL - cerrar y abrir nueva
                        currentPresentation.dismiss();
                        currentPresentation = null;
                    }
                }

                // Guardar la última URL
                lastUrl = url;

                DisplayManager displayManager = (DisplayManager) getContext().getSystemService(Context.DISPLAY_SERVICE);
                
                if (displayManager == null) {
                    call.reject("No se pudo obtener el servicio DisplayManager");
                    return;
                }

                Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);

                // Si no hay displays de presentación, probar con todos los displays
                if (displays == null || displays.length < 2) {
                    displays = displayManager.getDisplays();
                }

                if (displays.length > 1) {
                    currentPresentation = new WebViewPresentation(getContext(), displays[1], url);
                    currentPresentation.setOnDismissListener(dialog -> {
                        currentPresentation = null;
                        lastUrl = "";
                        Log.d(TAG, "Presentación cerrada");
                    });
                    currentPresentation.show();
                    call.resolve(createResponse(true, "Contenido mostrado en pantalla secundaria"));
                } else {
                    call.reject("No se encontró una pantalla secundaria disponible");
                }
            } catch (Exception e) {
                Log.e(TAG, "Error al mostrar en pantalla secundaria", e);
                call.reject("Error al mostrar contenido: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void getSecondScreenStatus(PluginCall call) {
        mainHandler.post(() -> {
            try {
                boolean isShowing = currentPresentation != null && currentPresentation.isShowing();
                call.resolve(createResponse(isShowing, isShowing ? 
                    "Pantalla secundaria activa" : "Pantalla secundaria inactiva"));
            } catch (Exception e) {
                Log.e(TAG, "Error al obtener estado", e);
                call.reject("Error al obtener estado: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void closeSecondScreen(PluginCall call) {
        mainHandler.post(() -> {
            try {
                if (currentPresentation != null && currentPresentation.isShowing()) {
                    currentPresentation.dismiss();
                    currentPresentation = null;
                    lastUrl = "";
                }
                call.resolve(createResponse(false, "Pantalla secundaria cerrada"));
            } catch (Exception e) {
                Log.e(TAG, "Error al cerrar pantalla secundaria", e);
                call.reject("Error al cerrar pantalla secundaria: " + e.getMessage());
            }
        });
    }

    private JSObject createResponse(boolean isShowing, String message) {
        JSObject response = new JSObject();
        response.put("isShowing", isShowing);
        response.put("message", message);
        response.put("url", isShowing ? lastUrl : "");
        return response;
    }

    private static class WebViewPresentation extends Presentation {
        private final String url;

        public WebViewPresentation(Context context, Display display, String url) {
            super(context, display);
            this.url = url;
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            
            new Handler(Looper.getMainLooper()).post(() -> {
                try {
                    WebView webView = new WebView(getContext());
                    webView.setWebViewClient(new WebViewClient());
                    webView.getSettings().setJavaScriptEnabled(true);
                    webView.getSettings().setDomStorageEnabled(true);
                    webView.getSettings().setAllowFileAccess(true);
                    webView.getSettings().setLoadWithOverviewMode(true);
                    webView.getSettings().setUseWideViewPort(true);
                    webView.loadUrl(url);
                    setContentView(webView);
                } catch (Exception e) {
                    Log.e(TAG, "Error al crear WebView", e);
                }
            });
        }
    }

    @Override
    protected void handleOnDestroy() {
        mainHandler.post(() -> {
            if (currentPresentation != null && currentPresentation.isShowing()) {
                currentPresentation.dismiss();
                currentPresentation = null;
                lastUrl = "";
            }
        });
        super.handleOnDestroy();
    }
}