package com.example.ieperuanosuizoapp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class CursosActivity extends AppCompatActivity {

    private String userMode;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cursos);

        // Obtener el modo de usuario
        SharedPreferences prefs = getSharedPreferences("user_prefs", MODE_PRIVATE);
        userMode = prefs.getString("user_mode", "ALUMNO");

        // Botón de retroceso
        findViewById(R.id.btn_back).setOnClickListener(v -> {
            finish();
            overridePendingTransition(0, 0);
        });

        setupCursoClickListeners();
        configurarVisibilidadSalon();
        setupBottomNavigation();
    }

    private void configurarVisibilidadSalon() {
        // Ocultar información del salón si el usuario es ALUMNO
        if ("ALUMNO".equals(userMode)) {
            findViewById(R.id.tv_salon_1).setVisibility(View.GONE);
            findViewById(R.id.tv_salon_2).setVisibility(View.GONE);
            findViewById(R.id.tv_salon_3).setVisibility(View.GONE);
        }
    }

    private void setupCursoClickListeners() {
        // Curso 1: Matemática
        findViewById(R.id.card_curso_1).setOnClickListener(v -> {
            handleCursoClick("Matematica", "Ricardo Huaman", "17", "1A");
        });

        // Curso 2: Educación para el Trabajo
        findViewById(R.id.card_curso_2).setOnClickListener(v -> {
            handleCursoClick("Educación para el Trabajo", "Ricardo Huaman", "16", "2A");
        });

        // Curso 3: Ciencias Sociales
        findViewById(R.id.card_curso_3).setOnClickListener(v -> {
            handleCursoClick("Ciencias Sociales", "Ricardo Huaman", "15", "2B");
        });
    }

    private void handleCursoClick(String nombreCurso, String nombreProfesor, String promedio, String salon) {
        if ("PROFESOR".equals(userMode)) {
            // Profesor: Mostrar Bottom Sheet con lista de alumnos
            ListaAlumnosBottomSheet bottomSheet = ListaAlumnosBottomSheet.newInstance(
                    nombreCurso,
                    nombreProfesor,
                    salon
            );
            bottomSheet.show(getSupportFragmentManager(), "ListaAlumnos");
        } else {
            // Alumno: Mostrar Bottom Sheet con sus notas
            CursoDetalleBottomSheet bottomSheet = CursoDetalleBottomSheet.newInstance(
                    nombreCurso,
                    nombreProfesor,
                    promedio
            );
            bottomSheet.show(getSupportFragmentManager(), "CursoDetalle");
        }
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
            } else if (item.getItemId() == R.id.nav_horarios) {
                android.content.Intent intent = new android.content.Intent(this, HorariosActivity.class);
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                overridePendingTransition(0, 0);
                finish();
                return true;
            }
            return false;
        });
    }
}