package com.example.ieperuanosuizoapp;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class UserProfile extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Cargar preferencia de tema antes de crear la vista
        SharedPreferences sharedPreferences = getSharedPreferences("theme_prefs", Context.MODE_PRIVATE);
        boolean isDarkMode = sharedPreferences.getBoolean("isDarkMode", false);
        if (isDarkMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        }

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_user_profile);

        // Ajuste de insets
        View mainView = findViewById(R.id.main);
        if (mainView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(mainView, (v, insets) -> {
                Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
                v.setPadding(systemBars.left, systemBars.top, systemBars.right, 0); 
                return insets;
            });
        }

        // Botón Atrás
        View btnBack = findViewById(R.id.btn_back_profile);
        if (btnBack != null) {
            btnBack.setOnClickListener(v -> {
                finish();
                overridePendingTransition(0, 0);
            });
        }

        // Navegación a Apariencia
        View optionApariencia = findViewById(R.id.option_apariencia);
        if (optionApariencia != null) {
            optionApariencia.setOnClickListener(v -> {
                Intent intent = new Intent(UserProfile.this, ViewApariencia.class);
                startActivity(intent);
            });
        }
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        overridePendingTransition(0, 0);
    }
}