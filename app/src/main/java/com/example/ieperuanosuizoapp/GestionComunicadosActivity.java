package com.example.ieperuanosuizoapp;

import android.content.SharedPreferences;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;

import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.ArrayList;
import java.util.List;

public class GestionComunicadosActivity extends AppCompatActivity {

    private LinearLayout containerHistorial, layoutEmptyHistory;
    private String userMode;
    private List<HistorialItem> listaHistorial = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SharedPreferences themePrefs = getSharedPreferences("theme_prefs", MODE_PRIVATE);
        boolean isDarkMode = themePrefs.getBoolean("isDarkMode", false);
        int colorScheme = themePrefs.getInt("colorScheme", 0);

        if (isDarkMode) AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        else AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);

        if (colorScheme == 2) setTheme(R.style.Theme_IEPeruanoSuizoAPP_Green);

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gestion_comunicados);

        // Obtener el modo de usuario
        SharedPreferences userPrefs = getSharedPreferences("user_prefs", MODE_PRIVATE);
        userMode = userPrefs.getString("user_mode", "ALUMNO");

        containerHistorial = findViewById(R.id.container_historial);
        layoutEmptyHistory = findViewById(R.id.layout_empty_history);
        
        findViewById(R.id.btn_back).setOnClickListener(v -> finish());
        findViewById(R.id.fab_nuevo_comunicado).setOnClickListener(v -> mostrarDialogoEnviar());

        // Por defecto empezamos vacío para simular que no ha enviado nada aún
        actualizarVistaHistorial();
        setupBottomNavigation();
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);

        int[][] states = new int[][]{
                new int[]{android.R.attr.state_checked},
                new int[]{-android.R.attr.state_checked}
        };
        int[] colors = new int[]{
                Color.parseColor("#BA1924"),
                Color.parseColor("#5E5F60")
        };
        ColorStateList navTint = new ColorStateList(states, colors);
        bottomNav.setItemIconTintList(navTint);

        bottomNav.getMenu().setGroupCheckable(0, false, true);

        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                finish();
                overridePendingTransition(0, 0);
                return true;
            } else if (id == R.id.nav_homework) {
                Intent intent = new Intent(this, CursosActivity.class);
                startActivity(intent);
                finish();
                return true;
            } else if (id == R.id.nav_horarios) {
                Intent intent = new Intent(this, HorariosActivity.class);
                startActivity(intent);
                finish();
                return true;
            }
            return false;
        });
    }

    private void actualizarVistaHistorial() {
        containerHistorial.removeAllViews();
        
        if (listaHistorial.isEmpty()) {
            layoutEmptyHistory.setVisibility(View.VISIBLE);
        } else {
            layoutEmptyHistory.setVisibility(View.GONE);
            for (HistorialItem item : listaHistorial) {
                View v = LayoutInflater.from(this).inflate(R.layout.item_comunicado, containerHistorial, false);
                
                android.view.ViewGroup.LayoutParams lp = v.getLayoutParams();
                lp.width = android.view.ViewGroup.LayoutParams.MATCH_PARENT;
                v.setLayoutParams(lp);

                ((TextView) v.findViewById(R.id.tv_titulo_comunicado)).setText(item.titulo);
                ((TextView) v.findViewById(R.id.tv_contenido_comunicado)).setText(item.detalle);
                
                TextView tvTag = v.findViewById(R.id.tv_tag_salon);
                tvTag.setText("Estado: " + item.estado);
                tvTag.setVisibility(View.VISIBLE);
                
                containerHistorial.addView(v);
            }
        }
    }

    private void mostrarDialogoEnviar() {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_enviar_comunicado, null);
        android.app.AlertDialog dialog = new android.app.AlertDialog.Builder(this, R.style.CustomDialogTheme)
                .setView(dialogView)
                .create();

        Spinner spinner = dialogView.findViewById(R.id.spinner_salon);
        
        String[] salones;
        if ("PROFESOR".equals(userMode)) {
            // El profesor solo ve los salones donde dicta clases (Simulado)
            salones = new String[]{"4to A", "5to B"}; 
        } else if ("AUXILIAR".equals(userMode)) {
            // El auxiliar ve todos los salones pero NO el Global
            salones = new String[]{"1ro A", "2do B", "3ro C", "4to A", "5to B"};
        } else {
            // Admin tiene acceso total
            salones = new String[]{"Global", "1ro A", "2do B", "3ro C", "4to A", "5to B"};
        }
        
        spinner.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, salones));

        dialogView.findViewById(R.id.btn_cancelar).setOnClickListener(v -> dialog.dismiss());
        dialogView.findViewById(R.id.btn_publicar).setOnClickListener(v -> {
            String titulo = ((android.widget.EditText) dialogView.findViewById(R.id.et_titulo)).getText().toString();
            String salonSel = spinner.getSelectedItem().toString();

            if (titulo.isEmpty()) {
                Toast.makeText(this, "Escribe un título", Toast.LENGTH_SHORT).show();
                return;
            }

            // Simulación de envío exitoso y actualización de historial
            listaHistorial.add(0, new HistorialItem(titulo, "Enviado hoy para " + salonSel, "Enviado"));
            Toast.makeText(this, "Comunicado enviado con éxito", Toast.LENGTH_SHORT).show();
            dialog.dismiss();
            actualizarVistaHistorial();
        });

        dialog.show();
        if (dialog.getWindow() != null) {
            dialog.getWindow().setLayout((int) (getResources().getDisplayMetrics().widthPixels * 0.95), 
                                       android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
            dialog.getWindow().setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(Color.TRANSPARENT));
        }
    }

    private static class HistorialItem {
        String titulo, detalle, estado;
        HistorialItem(String t, String d, String e) { titulo = t; detalle = d; estado = e; }
    }
}