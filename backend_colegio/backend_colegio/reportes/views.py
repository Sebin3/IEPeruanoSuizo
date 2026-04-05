from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone

from config.permissions import EsAdminOProfesor
from asistencia.models import Asistencia, SesionClase, Alumno, Seccion


class ReporteAsistenciaSesionView(APIView):
    permission_classes = [EsAdminOProfesor]

    def get(self, request, sesion_id):
        try:
            sesion = SesionClase.objects.select_related('curso', 'seccion').get(id=sesion_id)
        except SesionClase.DoesNotExist:
            return Response({'success': False, 'message': 'Sesión no encontrada'}, status=404)

        asistencias = Asistencia.objects.filter(sesion=sesion).select_related('alumno')

        resumen = asistencias.aggregate(
            total=Count('id'),
            presentes=Count('id', filter=Q(estado='presente')),
            tardanzas=Count('id', filter=Q(estado='tardanza')),
            ausentes=Count('id', filter=Q(estado='ausente')),
            justificados=Count('id', filter=Q(estado='justificado')),
        )

        detalle = [
            {
                'alumno_id': a.alumno.id,
                'alumno': a.alumno.nombre_completo,
                'codigo': a.alumno.codigo,
                'estado': a.estado,
                'hora_registro': a.hora_registro.strftime('%H:%M') if a.hora_registro else None,
                'via_qr': a.registrado_via_qr,
            }
            for a in asistencias.order_by('alumno__apellidos')
        ]

        return Response({
            'success': True,
            'data': {
                'sesion': {
                    'id': sesion.id,
                    'curso': sesion.curso.nombre,
                    'seccion': str(sesion.seccion),
                    'fecha': sesion.fecha,
                    'hora_inicio': sesion.hora_inicio,
                },
                'resumen': resumen,
                'detalle': detalle,
            }
        })


class ReporteAsistenciaAlumnoView(APIView):
    permission_classes = [EsAdminOProfesor]

    def get(self, request, alumno_id):
        try:
            alumno = Alumno.objects.select_related('seccion__grado').get(id=alumno_id)
        except Alumno.DoesNotExist:
            return Response({'success': False, 'message': 'Alumno no encontrado'}, status=404)

        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        asistencias = Asistencia.objects.filter(alumno=alumno).select_related('sesion__curso')

        if fecha_inicio:
            asistencias = asistencias.filter(sesion__fecha__gte=fecha_inicio)
        if fecha_fin:
            asistencias = asistencias.filter(sesion__fecha__lte=fecha_fin)

        resumen = asistencias.aggregate(
            total=Count('id'),
            presentes=Count('id', filter=Q(estado='presente')),
            tardanzas=Count('id', filter=Q(estado='tardanza')),
            ausentes=Count('id', filter=Q(estado='ausente')),
            justificados=Count('id', filter=Q(estado='justificado')),
        )

        if resumen['total'] > 0:
            resumen['porcentaje_asistencia'] = round(
                (resumen['presentes'] + resumen['tardanzas']) / resumen['total'] * 100, 2
            )
        else:
            resumen['porcentaje_asistencia'] = 0

        detalle = [
            {
                'sesion_id': a.sesion.id,
                'curso': a.sesion.curso.nombre,
                'fecha': a.sesion.fecha,
                'estado': a.estado,
                'hora_registro': a.hora_registro.strftime('%H:%M') if a.hora_registro else None,
            }
            for a in asistencias.order_by('-sesion__fecha')
        ]

        return Response({
            'success': True,
            'data': {
                'alumno': {
                    'id': alumno.id,
                    'nombre': alumno.nombre_completo,
                    'codigo': alumno.codigo,
                    'seccion': str(alumno.seccion),
                },
                'resumen': resumen,
                'detalle': detalle,
            }
        })


class ReporteAsistenciaSeccionView(APIView):
    permission_classes = [EsAdminOProfesor]

    def get(self, request, seccion_id):
        fecha = request.query_params.get('fecha', timezone.now().date())

        alumnos = Alumno.objects.filter(seccion_id=seccion_id, activo=True).prefetch_related(
            'asistencias'
        )

        data = []
        for alumno in alumnos:
            asistencias = alumno.asistencias.filter(sesion__fecha=fecha)
            resumen = asistencias.aggregate(
                presentes=Count('id', filter=Q(estado='presente')),
                tardanzas=Count('id', filter=Q(estado='tardanza')),
                ausentes=Count('id', filter=Q(estado='ausente')),
            )
            data.append({
                'alumno_id': alumno.id,
                'alumno': alumno.nombre_completo,
                'codigo': alumno.codigo,
                **resumen,
            })

        return Response({'success': True, 'data': data})
