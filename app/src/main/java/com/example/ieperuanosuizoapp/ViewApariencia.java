package com.example.ieperuanosuizoapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class ViewApariencia extends AppCompatActivity {

    private RadioButton rbDark, rbLight;
    private LinearLayout layoutDark, layoutLight;
    private SharedPreferences sharedPreferences;
    private static final String PREFS_NAME = "theme_prefs";
    private static final String KEY_THEME = "isDarkMode";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Cargar el tema antes de super.onCreate para evitar parpadeos
        sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean isDarkMode = sharedPreferences.getBoolean(KEY_THEME, false);
        
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_view_apariencia);

        // Inicializar vistas
        rbDark = findViewById(R.id.rb_dark);
        rbLight = findViewById(R.id.rb_light);
        layoutDark = findViewById(R.id.layout_dark_theme);
        layoutLight = findViewById(R.id.layout_light_theme);

        // Establecer estado inicial de los RadioButtons
        if (isDarkMode) {
            rbDark.setChecked(true);
            rbLight.setChecked(false);
        } else {
            rbLight.setChecked(true);
            rbDark.setChecked(false);
        }

        // Listeners para Modo Oscuro
        layoutDark.setOnClickListener(v -> selectTheme(true));
        rbDark.setOnClickListener(v -> selectTheme(true));

        // Listeners para Modo Claro
        layoutLight.setOnClickListener(v -> selectTheme(false));
        rbLight.setOnClickListener(v -> selectTheme(false));

        // Botón de retroceso
        View btnBack = findViewById(R.id.btn_back);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> finish());
        }

        // Mantener Bottom Navigation por ahora
        setupBottomNavigation();
    }

    private void selectTheme(boolean dark) {
        // Actualizar RadioButtons
        rbDark.setChecked(dark);
        rbLight.setChecked(!dark);

        // Guardar preferencia
        SharedPreferences.Editor editor = sharedPreferences.edit();
        editor.putBoolean(KEY_THEME, dark);
        editor.apply();

        // Aplicar el tema inmediatamente
        if (dark) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        }
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNavigationView = findViewById(R.id.bottom_navigation);
        if (bottomNavigationView != null) {
            bottomNavigationView.setSelectedItemId(R.id.nav_perfil);
            bottomNavigationView.setOnItemSelectedListener(item -> {
                int itemId = item.getItemId();
                if (itemId == R.id.nav_home) {
                    startActivity(new Intent(getApplicationContext(), MainActivity.class));
                    overridePendingTransition(0, 0);
                    return true;
                } else if (itemId == R.id.nav_perfil) {
                    return true;
                }
                return false;
            });
        }
    }
}