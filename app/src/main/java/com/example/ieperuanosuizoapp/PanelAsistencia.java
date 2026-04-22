package com.example.ieperuanosuizoapp;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.transition.AutoTransition;
import androidx.transition.TransitionManager;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;
import com.google.common.util.concurrent.ListenableFuture;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

public class PanelAsistencia extends AppCompatActivity {

    private PreviewView previewView;
    private MaterialButton btnActivarCamara;
    private ActivityResultLauncher<String> requestPermissionLauncher;
    private boolean isCameraActive = false;
    private ProcessCameraProvider cameraProvider;
    private AutoCompleteTextView autoCompleteSalon;
    private ConstraintLayout mainLayout;
    private View cameraContainer, layoutEmptyState, layoutPaginacion, dividerPaginacion;
    private EditText etBuscador;
    private RecyclerView rvAlumnos;
    private TextView tvPaginationInfo;
    private ImageButton btnPagePrev, btnPageNext;

    private AlumnoAdapter adapter;
    private List<Alumno> listaCompleta = new ArrayList<>();
    private List<Alumno> listaFiltrada = new ArrayList<>();
    private int paginaActual = 1;
    private final int itemsPorPagina = 3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_panel_asistencia);

        // Inicializar vistas
        mainLayout = findViewById(R.id.main);
        previewView = findViewById(R.id.previewView);
        btnActivarCamara = findViewById(R.id.btn_activar_camara);
        autoCompleteSalon = findViewById(R.id.autoComplete_salon);
        cameraContainer = findViewById(R.id.camera_container);
        etBuscador = findViewById(R.id.et_buscador);
        rvAlumnos = findViewById(R.id.rv_alumnos);
        layoutEmptyState = findViewById(R.id.layout_empty_state);
        layoutPaginacion = findViewById(R.id.layout_paginacion);
        dividerPaginacion = findViewById(R.id.divider_paginacion);
        tvPaginationInfo = findViewById(R.id.tv_pagination_info);
        btnPagePrev = findViewById(R.id.btn_page_prev);
        btnPageNext = findViewById(R.id.btn_page_next);

        // Inicializar RecyclerView
        rvAlumnos.setLayoutManager(new LinearLayoutManager(this));

        // Datos de prueba
        generarDatosPrueba();

        // Configurar Adapter
        adapter = new AlumnoAdapter(new ArrayList<>());
        rvAlumnos.setAdapter(adapter);

        // Configurar Paginación
        setupPaginacion();

        // Configurar Selector de Salón
        setupSalonSelector();

        // Configurar Animación del Buscador
        setupSearchAnimation();

        // Mostrar tabla
        actualizarVistaTabla();

        // Configurar botón de atrás
        findViewById(R.id.btn_back).setOnClickListener(v -> {
            String query = etBuscador.getText().toString();
            String salon = autoCompleteSalon.getText().toString();

            // Si hay algo filtrado o el buscador tiene el foco, primero limpiamos
            if (etBuscador.hasFocus() || !query.isEmpty() || !salon.equals("Salon")) {
                etBuscador.setText("");
                autoCompleteSalon.setText("Salon", false);
                hideSearchMode();
            } else {
                finish();
            }
        });

        // --- Lógica de la Cámara ---
        requestPermissionLauncher = registerForActivityResult(
                new ActivityResultContracts.RequestPermission(),
                isGranted -> {
                    if (isGranted) {
                        toggleCamera();
                    } else {
                        Toast.makeText(this, "Permiso de cámara denegado", Toast.LENGTH_SHORT).show();
                    }
                }
        );

        btnActivarCamara.setOnClickListener(v -> checkCameraPermission());

        // --- Configuración del BottomNavigationView ---
        setupBottomNavigation(findViewById(R.id.bottom_navigation));
    }

    private void setupBottomNavigation(BottomNavigationView bottomNav) {
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

        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.nav_home) {
                Intent intent = new Intent(this, HomeActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                finish();
                return true;
            } else if (id == R.id.nav_homework) {
                Intent intent = new Intent(this, CursosActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
                startActivity(intent);
                return true;
            }
            return true;
        });
    }

    private void setupSearchAnimation() {
        etBuscador.setOnFocusChangeListener((v, hasFocus) -> {
            if (hasFocus) {
                showSearchMode();
            }
            // Eliminamos el hideSearchMode automático al perder foco para que no se cierre al tocar el salón
        });

        etBuscador.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                aplicarFiltros();
            }
            @Override public void afterTextChanged(Editable s) {}
        });
    }

    private void aplicarFiltros() {
        paginaActual = 1;
        actualizarVistaTabla();
    }

    private void generarDatosPrueba() {
        // Estudiantes para 1ro A
        listaCompleta.add(new Alumno("Carlos Ramos", "1ro A", "06:50 am"));
        listaCompleta.add(new Alumno("Lucia Mendoza", "1ro A", "06:50 am"));
        listaCompleta.add(new Alumno("Andres Quispe", "1ro A", "06:51 am"));
        listaCompleta.add(new Alumno("Maria Jose", "1ro A", null)); // Ausente
        listaCompleta.add(new Alumno("Roberto Gomez", "1ro A", "07:10 am"));
        listaCompleta.add(new Alumno("Elena Torres", "1ro A", null)); // Ausente
        listaCompleta.add(new Alumno("Juan Perez", "1ro A", "07:05 am"));
        listaCompleta.add(new Alumno("Sofia Castro", "1ro A", "06:45 am"));
        listaCompleta.add(new Alumno("Diego Salas", "1ro A", null)); // Ausente
        listaCompleta.add(new Alumno("Laura Luna", "1ro A", "07:15 am"));

        // Otros salones
        listaCompleta.add(new Alumno("Pedro Picapiedra", "2do B", "07:00 am"));
        listaCompleta.add(new Alumno("Vilma Palma", "2do B", null));

        listaFiltrada = new ArrayList<>(listaCompleta);
    }

    private void setupPaginacion() {
        btnPagePrev.setOnClickListener(v -> {
            if (paginaActual > 1) {
                paginaActual--;
                actualizarVistaTabla();
            }
        });

        btnPageNext.setOnClickListener(v -> {
            int totalPaginas = (int) Math.ceil((double) listaFiltrada.size() / itemsPorPagina);
            if (paginaActual < totalPaginas) {
                paginaActual++;
                actualizarVistaTabla();
            }
        });
    }

    private void actualizarVistaTabla() {
        String query = etBuscador.getText().toString().toLowerCase();
        String salon = autoCompleteSalon.getText().toString();

        boolean hasQuery = !query.isEmpty();
        boolean hasSalon = !salon.equals("Salon");
        boolean isSearching = etBuscador.hasFocus() || hasQuery;

        if (isSearching && !hasSalon) {
            // MODO BUSCADOR (En vivo): Solo presentes que coincidan con el nombre
            listaFiltrada = listaCompleta.stream()
                    .filter(a -> a.nombre.toLowerCase().contains(query) && a.hora != null && !a.hora.isEmpty())
                    .collect(Collectors.toList());
        } else if (hasSalon) {
            // MODO SELECT (Salón): Todos los alumnos del salón (Presentes y Ausentes)
            listaFiltrada = listaCompleta.stream()
                    .filter(a -> a.fecha.equals(salon) && (query.isEmpty() || a.nombre.toLowerCase().contains(query)))
                    .collect(Collectors.toList());
        } else {
            // MODO NORMAL (Al entrar): Solo alumnos que marcaron asistencia (Presentes)
            listaFiltrada = listaCompleta.stream()
                    .filter(a -> a.hora != null && !a.hora.isEmpty())
                    .collect(Collectors.toList());
        }

        int totalItems = listaFiltrada.size();
        if (totalItems == 0) {
            rvAlumnos.setVisibility(View.GONE);
            layoutEmptyState.setVisibility(View.VISIBLE);
            layoutPaginacion.setVisibility(View.GONE);
            dividerPaginacion.setVisibility(View.GONE);
            return;
        }

        rvAlumnos.setVisibility(View.VISIBLE);
        layoutEmptyState.setVisibility(View.GONE);

        // Sin paginación si se está buscando o si hay un salón seleccionado
        if (isSearching || hasSalon) {
            adapter.updateList(listaFiltrada);
            layoutPaginacion.setVisibility(View.GONE);
            dividerPaginacion.setVisibility(View.GONE);
        } else {
            // Paginación solo en el estado inicial "limpio"
            int inicio = (paginaActual - 1) * itemsPorPagina;
            int fin = Math.min(inicio + itemsPorPagina, totalItems);
            adapter.updateList(listaFiltrada.subList(inicio, fin));

            if (totalItems > itemsPorPagina) {
                layoutPaginacion.setVisibility(View.VISIBLE);
                dividerPaginacion.setVisibility(View.VISIBLE);
                int totalPaginas = (int) Math.ceil((double) totalItems / itemsPorPagina);
                String info = "Pagina " + paginaActual + " de " + totalPaginas;
                tvPaginationInfo.setText(info);
                btnPagePrev.setEnabled(paginaActual > 1);
                btnPageNext.setEnabled(paginaActual < totalPaginas);
            } else {
                layoutPaginacion.setVisibility(View.GONE);
                dividerPaginacion.setVisibility(View.GONE);
            }
        }
    }

    private void showSearchMode() {
        TransitionManager.beginDelayedTransition(mainLayout, new AutoTransition());
        cameraContainer.setVisibility(View.GONE);
        btnActivarCamara.setVisibility(View.GONE);
        actualizarVistaTabla();
    }

    private void hideSearchMode() {
        TransitionManager.beginDelayedTransition(mainLayout, new AutoTransition());
        cameraContainer.setVisibility(View.VISIBLE);
        btnActivarCamara.setVisibility(View.VISIBLE);
        etBuscador.clearFocus();
        actualizarVistaTabla();
    }

    private void setupSalonSelector() {
        String[] salones = {"1ro A", "2do B", "3ro C", "4to A", "5to B"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, salones);
        autoCompleteSalon.setAdapter(adapter);
        autoCompleteSalon.setKeyListener(null);
        autoCompleteSalon.setOnItemClickListener((parent, view, position, id) -> {
            showSearchMode(); // Aseguramos que se mantenga el modo expandido al seleccionar salón
            aplicarFiltros();
        });
    }

    private void checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            toggleCamera();
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA);
        }
    }

    private void toggleCamera() {
        if (isCameraActive) stopCamera();
        else startCamera();
    }

    private void startCamera() {
        ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);
        cameraProviderFuture.addListener(() -> {
            try {
                cameraProvider = cameraProviderFuture.get();
                CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;
                Preview preview = new Preview.Builder().build();
                preview.setSurfaceProvider(previewView.getSurfaceProvider());
                cameraProvider.unbindAll();
                cameraProvider.bindToLifecycle(this, cameraSelector, preview);
                previewView.setVisibility(View.VISIBLE);
                isCameraActive = true;
                btnActivarCamara.setText("Desactivar Camara");
                btnActivarCamara.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#F5F5F5")));
                btnActivarCamara.setTextColor(Color.BLACK);
            } catch (ExecutionException | InterruptedException e) {
                Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        }, ContextCompat.getMainExecutor(this));
    }

    private void stopCamera() {
        if (cameraProvider != null) {
            cameraProvider.unbindAll();
            isCameraActive = false;
            previewView.setVisibility(View.INVISIBLE);
            btnActivarCamara.setText("Activar Camara");
            btnActivarCamara.setBackgroundTintList(ColorStateList.valueOf(Color.parseColor("#BA1924")));
            btnActivarCamara.setTextColor(Color.WHITE);
        }
    }

    static class Alumno {
        String nombre, fecha, hora;
        Alumno(String nombre, String fecha, String hora) {
            this.nombre = nombre;
            this.fecha = fecha;
            this.hora = hora;
        }
    }

    class AlumnoAdapter extends RecyclerView.Adapter<AlumnoAdapter.ViewHolder> {
        private List<Alumno> alumnos;
        AlumnoAdapter(List<Alumno> alumnos) { this.alumnos = alumnos; }
        void updateList(List<Alumno> newList) { this.alumnos = newList; notifyDataSetChanged(); }

        @Override
        public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            View v = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_alumno_asistencia, parent, false);
            return new ViewHolder(v);
        }

        @Override
        public void onBindViewHolder(ViewHolder holder, int position) {
            Alumno a = alumnos.get(position);
            holder.tvNombre.setText(a.nombre);
            holder.tvFecha.setText(a.fecha);
            if (a.hora == null || a.hora.isEmpty()) {
                holder.tvHora.setText("Ausente");
                holder.tvHora.setTextColor(Color.parseColor("#BA1924"));
            } else {
                holder.tvHora.setText(a.hora);
                holder.tvHora.setTextColor(Color.parseColor("#27AE60"));
            }
        }

        @Override
        public int getItemCount() { return alumnos.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvNombre, tvFecha, tvHora;
            ViewHolder(View v) {
                super(v);
                tvNombre = v.findViewById(R.id.tv_nombre_alumno);
                tvFecha = v.findViewById(R.id.tv_salon_alumno);
                tvHora = v.findViewById(R.id.tv_estado_entrada);
            }
        }
    }
}
