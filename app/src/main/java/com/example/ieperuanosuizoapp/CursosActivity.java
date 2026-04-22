package com.example.ieperuanosuizoapp;

import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class CursosActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cursos);

        // Botón de retroceso
        findViewById(R.id.btn_back).setOnClickListener(v -> {
            finish();
            overridePendingTransition(0, 0);
        });

        setupBottomNavigation();
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);

        // Definir colores: Rojo para seleccionado, Gris para normal
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
        
        // Marcar "Cursos" (nav_homework) como seleccionado
        bottomNav.setSelectedItemId(R.id.nav_homework);

        bottomNav.setOnItemSelectedListener(item -> {
            if (item.getItemId() == R.id.nav_home) {
                finish(); // Volver a la Home
                overridePendingTransition(0, 0);
                return true;
            } else if (item.getItemId() == R.id.nav_homework) {
                return true; // Ya estamos aquí
            }
            return false;
        });
    }
}