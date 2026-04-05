from django.urls import path
from .views import ReporteAsistenciaSesionView, ReporteAsistenciaAlumnoView, ReporteAsistenciaSeccionView

urlpatterns = [
    path('asistencia/sesion/<int:sesion_id>/', ReporteAsistenciaSesionView.as_view(), name='reporte_sesion'),
    path('asistencia/alumno/<int:alumno_id>/', ReporteAsistenciaAlumnoView.as_view(), name='reporte_alumno'),
    path('asistencia/seccion/<int:seccion_id>/', ReporteAsistenciaSeccionView.as_view(), name='reporte_seccion'),
]
