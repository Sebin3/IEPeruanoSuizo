package com.example.ieperuanosuizoapp;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Outline;
import android.os.Bundle;
import android.view.View;
import android.view.ViewOutlineProvider;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationView;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class HomeActivity extends AppCompatActivity {

    private TextView tvCelebration, tvDayNumber, tvDayName, tvMonthYear, tvGreeting;
    private ImageView ivDailyIllustration, ivMenuIcon;
    private DrawerLayout drawerLayout;
    private NavigationView navigationView;
    private View mainContent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Cargar tema antes de super.onCreate para evitar parpadeo
        SharedPreferences prefs = getSharedPreferences("theme_prefs", MODE_PRIVATE);
        boolean isDarkMode = prefs.getBoolean("isDarkMode", false);
        if (isDarkMode) {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        } else {
            AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);
        }

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_home);

        // Inicializar vistas del drawer
        drawerLayout = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.navigation_view);
        mainContent = findViewById(R.id.main_content);
        ivMenuIcon = findViewById(R.id.iv_menu_icon);
        ivMenuIcon.setTag("closed");

        findViewById(R.id.btn_menu).setOnClickListener(v -> {
            drawerLayout.openDrawer(GravityCompat.START);
        });

        setupPerspectiveDrawer();

        // Configurar navegación del Drawer
        navigationView.setNavigationItemSelectedListener(item -> {
            int id = item.getItemId();

            if (id == R.id.nav_perfil) {
                Intent intent = new Intent(HomeActivity.this, UserProfile.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                overridePendingTransition(0, 0);
                drawerLayout.closeDrawer(GravityCompat.START);
                return true;
            } else if (id == R.id.nav_asistencia) {
                Intent intent = new Intent(HomeActivity.this, PanelAsistencia.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                overridePendingTransition(0, 0);
                drawerLayout.closeDrawer(GravityCompat.START);
                return true;
            }

            // Cerrar el drawer para otros ítems si es necesario
            drawerLayout.closeDrawer(GravityCompat.START);
            return true;
        });

        // Inicializar vistas del header dinámico
        tvCelebration = findViewById(R.id.tv_celebration);
        tvDayNumber = findViewById(R.id.tv_day_number);
        tvDayName = findViewById(R.id.tv_day_name);
        tvMonthYear = findViewById(R.id.tv_month_year);
        tvGreeting = findViewById(R.id.tv_greeting);
        ivDailyIllustration = findViewById(R.id.iv_daily_illustration);

        updateDailyInfo();

        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);

        // 1. Definimos el tinte: Rojo (#BA1924) para seleccionado, Gris (#5E5F60) para normal
        int[][] states = new int[][]{
                new int[]{android.R.attr.state_checked},
                new int[]{-android.R.attr.state_checked}
        };
        int[] colors = new int[]{
                Color.parseColor("#BA1924"),
                Color.parseColor("#5E5F60")
        };
        ColorStateList navTint = new ColorStateList(states, colors);

        // 2. Estado inicial: Aplicamos tinte gris y desmarcamos todo
        bottomNav.setItemIconTintList(navTint);
        bottomNav.getMenu().setGroupCheckable(0, false, true);
        bottomNav.getMenu().getItem(0).setChecked(false);

        bottomNav.setOnItemSelectedListener(item -> {
            // Habilitamos la selección al tocar
            bottomNav.getMenu().setGroupCheckable(0, true, true);

            // Siempre reseteamos el icono de Home al gris original
            bottomNav.getMenu().findItem(R.id.nav_home).setIcon(R.drawable.ic_home);

            if (item.getItemId() == R.id.nav_home) {
                // TRUCO: Quitamos el tinte para que se vea el rojo y blanco de tu ic_homepress
                bottomNav.setItemIconTintList(null);
                item.setIcon(R.drawable.ic_homepress);
            } else if (item.getItemId() == R.id.nav_homework) {
                // Abrir pantalla de Cursos
                android.content.Intent intent = new android.content.Intent(this, CursosActivity.class);
                intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                overridePendingTransition(0, 0);
                return true;
            } else {
                // Para los otros, aplicamos el tinte que los pone rojos
                bottomNav.setItemIconTintList(navTint);
            }

            return true;
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        BottomNavigationView bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setSelectedItemId(R.id.nav_home);
    }

    private void setupPerspectiveDrawer() {
        drawerLayout.setScrimColor(Color.TRANSPARENT); // Quitar la sombra negra

        // Configurar el OutlineProvider para esquinas redondeadas
        mainContent.setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                // Radio de 30dp (puedes ajustarlo)
                float radius = 80f;
                outline.setRoundRect(0, 0, view.getWidth(), view.getHeight(), radius);
            }
        });

        drawerLayout.addDrawerListener(new DrawerLayout.SimpleDrawerListener() {
            @Override
            public void onDrawerSlide(View drawerView, float slideOffset) {
                // Escalar el contenido principal
                float scaleFactor = 1f - (slideOffset * 0.15f);
                mainContent.setScaleX(scaleFactor);
                mainContent.setScaleY(scaleFactor);

                // Mover el contenido hacia la derecha
                float xOffset = drawerView.getWidth() * slideOffset * 0.7f;
                mainContent.setTranslationX(xOffset);

                // Activar el recorte de esquinas solo cuando se desliza
                mainContent.setClipToOutline(slideOffset > 0);
                mainContent.setElevation(slideOffset * 20); // Sombra para profundidad

                // Animación de "conversión" suave (Fade + Swap)
                float iconAlpha = Math.abs(slideOffset - 0.5f) * 2;
                ivMenuIcon.setAlpha(iconAlpha);
                ivMenuIcon.setScaleX(0.8f + (iconAlpha * 0.2f));
                ivMenuIcon.setScaleY(0.8f + (iconAlpha * 0.2f));

                if (slideOffset > 0.5f) {
                    if (!"open".equals(ivMenuIcon.getTag())) {
                        ivMenuIcon.setImageResource(R.drawable.hamburgicon);
                        ivMenuIcon.setTag("open");
                    }
                } else {
                    if (!"closed".equals(ivMenuIcon.getTag())) {
                        ivMenuIcon.setImageResource(R.drawable.hamburgiconnew);
                        ivMenuIcon.setTag("closed");
                    }
                }
            }
        });
    }

    private void updateDailyInfo() {
        Calendar calendar = Calendar.getInstance();

        // Saludo dinámico según la hora
        int hour = calendar.get(Calendar.HOUR_OF_DAY);
        String greeting;
        if (hour >= 6 && hour < 12) {
            greeting = "Buenos días, ";
        } else if (hour >= 12 && hour < 19) {
            greeting = "Buenas tardes, ";
        } else {
            greeting = "Buenas noches, ";
        }
        tvGreeting.setText(greeting);

        // Formatear fecha actual
        SimpleDateFormat dayFormat = new SimpleDateFormat("d", Locale.getDefault());
        SimpleDateFormat dayNameFormat = new SimpleDateFormat("EEEE", new Locale("es", "PE"));
        SimpleDateFormat monthYearFormat = new SimpleDateFormat("MMMM yyyy", new Locale("es", "PE"));

        String dayNumber = dayFormat.format(calendar.getTime());
        String dayName = dayNameFormat.format(calendar.getTime());
        String monthYear = monthYearFormat.format(calendar.getTime());

        // Capitalizar primera letra
        dayName = dayName.substring(0, 1).toUpperCase() + dayName.substring(1);
        monthYear = monthYear.substring(0, 1).toUpperCase() + monthYear.substring(1);

        tvDayNumber.setText(dayNumber);
        tvDayName.setText(dayName);
        tvMonthYear.setText(monthYear);

        // Lógica de Celebraciones (Ejemplo)
        int day = calendar.get(Calendar.DAY_OF_MONTH);
        int month = calendar.get(Calendar.MONTH) + 1; // Enero es 0

        String celebrationText = "";
        int illustrationRes = R.drawable.diamundial; // Imagen por defecto

        // Ejemplo: Día de la Tierra (22 de Abril)
        if (day == 22 && month == 4) {
            celebrationText = "Día Mundial de la Tierra";
            // illustrationRes = R.drawable.dia_tierra; // Cambiar por la imagen real
        } else if (day == 1 && month == 5) {
            celebrationText = "Día del Trabajador";
        } else if (day == 7 && month == 6) {
            celebrationText = "Día de la Bandera";
        }

        // Mostrar o esconder el texto de celebración
        if (celebrationText.isEmpty()) {
            tvCelebration.setVisibility(View.GONE);
        } else {
            tvCelebration.setVisibility(View.VISIBLE);
            tvCelebration.setText(celebrationText);
        }

        // Lógica de imágenes por día de la semana (Lunes a Viernes)
        if (celebrationText.isEmpty()) { // Solo si no hay una celebración especial
            int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
            switch (dayOfWeek) {
                case Calendar.MONDAY:
                    illustrationRes = R.drawable.pibblepruebaportada;
                    break;
                case Calendar.TUESDAY:
                    illustrationRes = R.drawable.diamundial;
                    break;
                case Calendar.WEDNESDAY:
                    illustrationRes = R.drawable.diamundial;
                    break;
                case Calendar.THURSDAY:
                    illustrationRes = R.drawable.diamundial;
                    break;
                case Calendar.FRIDAY:
                    illustrationRes = R.drawable.diamundial;
                    break;
                default:
                    illustrationRes = R.drawable.portadaimagenprueba; // Fin de semana
                    break;
            }
        }

        ivDailyIllustration.setImageResource(illustrationRes);
    }
}