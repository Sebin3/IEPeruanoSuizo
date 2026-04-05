from django.core.management.base import BaseCommand
from django.utils import timezone


class Command(BaseCommand):
    help = 'Carga datos iniciales: admin, docentes turno mañana y alumnos 1A'

    def handle(self, *args, **kwargs):
        self._seed_admin()
        self._seed_docentes()
        self._seed_alumnos_1A()
        self.stdout.write(self.style.SUCCESS('\nSeed completado exitosamente.'))

    # ------------------------------------------------------------------
    def _seed_admin(self):
        from usuarios.models import Usuario
        admin, creado = Usuario.objects.get_or_create(
            email='admin@peruanosuizo.edu.pe',
            defaults={
                'nombres': 'Admin', 'apellidos': 'Sistema',
                'rol': 'admin', 'is_staff': True, 'is_superuser': True,
            }
        )
        if creado:
            admin.set_password('123456789')
            admin.save()
            self.stdout.write(f'  Admin creado: {admin.email}')
        else:
            self.stdout.write(f'  Admin ya existe: {admin.email}')

    # ------------------------------------------------------------------
    def _seed_docentes(self):
        from usuarios.models import Usuario
        docentes = [
            ('Anibal',    'Moreno',            'anibalmoreno@peruanosuizo.edu.pe'),
            ('Aydee',     'Arellano Cabada',   'aydeearellano@peruanosuizo.edu.pe'),
            ('Blanca',    'Rodriguez Reyes',   'blancarodriguez@peruanosuizo.edu.pe'),
            ('Carmen',    'Moreno Vasquez',    'carmenmoreno@peruanosuizo.edu.pe'),
            ('Edgar',     'Vega Quiñones',     'edgarvega@peruanosuizo.edu.pe'),
            ('Elcy',      'Hernandez Rodas',   'elcyhernandez@peruanosuizo.edu.pe'),
            ('Esther',    'Estrada Huerta',    'estherestrada@peruanosuizo.edu.pe'),
            ('Freddy',    'Estelo Castañeda',  'freddyestelo@peruanosuizo.edu.pe'),
            ('Hilmer',    'Yacupoma Aguirre',  'hilmeryacupoma@peruanosuizo.edu.pe'),
            ('Jessica',   'Herrera Sanchez',   'jessicaherrera@peruanosuizo.edu.pe'),
            ('Maricella', 'Timoteo Gahona',    'maricellatimoteo@peruanosuizo.edu.pe'),
            ('Mariluz',   'Huaman Inga',       'mariluzhuaman@peruanosuizo.edu.pe'),
            ('Milton',    'Purizaca Martinez', 'miltonpurizaca@peruanosuizo.edu.pe'),
            ('Nelly',     'Mujica Galvez',     'nellymujica@peruanosuizo.edu.pe'),
            ('Pablo',     'Veramendi Rivera',  'pabloveramendi@peruanosuizo.edu.pe'),
            ('Richer',    'Orduna Vergara',    'richerorduna@peruanosuizo.edu.pe'),
            ('Ronald',    'Gogin Carreño',     'ronaldgogin@peruanosuizo.edu.pe'),
            ('Rosmery',   'Correa Caytano',    'rosmerycorrea@peruanosuizo.edu.pe'),
            ('Susy',      'Alberto',           'susyalberto@peruanosuizo.edu.pe'),
            ('Walter',    'Castro Valdivia',   'castrovaldivia@peruanosuizo.edu.pe'),
        ]
        creados = 0
        for nombres, apellidos, email in docentes:
            u, creado = Usuario.objects.get_or_create(email=email, defaults={
                'nombres': nombres, 'apellidos': apellidos, 'rol': 'profesor',
            })
            if creado:
                u.set_password('123456789')
                u.save()
                creados += 1
        self.stdout.write(f'  Docentes creados: {creados} / {len(docentes)}')

    # ------------------------------------------------------------------
    def _seed_alumnos_1A(self):
        from usuarios.models import Usuario
        from asistencia.models import Grado, Seccion, Alumno, Curso, SesionClase

        prof = Usuario.objects.filter(rol='profesor').first()
        grado, _ = Grado.objects.get_or_create(nombre='1ro', nivel='secundaria')
        seccion, _ = Seccion.objects.get_or_create(
            grado=grado, nombre='A', defaults={'tutor': prof}
        )

        alumnos = [
            ('Abad',       'Villaner',   'Liseth',     'Sayuri',    '71000001'),
            ('Bazan',      'Navarro',    'Leonardo',   'Arturo',    '71000002'),
            ('Cabanillas', 'Liñan',      'Angel',      'Gabriel',   '71000003'),
            ('Carrillo',   'Vilchez',    'Edgardo',    'Miguel',    '71000004'),
            ('Cerna',      'Villar',     'Aaron',      '',          '71000005'),
            ('Chavarria',  'Aranda',     'Jeremy',     '',          '71000006'),
            ('Condor',     'Olivas',     'Mackenzye',  'Romina',    '71000007'),
            ('Cuzcano',    'Espinoza',   'Lizeth',     'Vallolet',  '71000008'),
            ('Espinoza',   'Yarleque',   'Jhostin',    '',          '71000009'),
            ('Godoy',      'Soria',      'Karla',      'Merlyn',    '71000010'),
            ('Gutierrez',  'Moreno',     'Jose',       'Eduardo',   '71000011'),
            ('Huaman',     'Carhuacota', 'Enmanuel',   'Jesus',     '71000012'),
            ('Huerta',     'Astonitas',  'Leonela',    '',          '71000013'),
            ('Inca',       'Paccori',    'Jeremy',     'Oscar',     '71000014'),
            ('Juarez',     'Rumay',      'July',       '',          '71000015'),
            ('Loyola',     'Espinola',   'Carlos',     'Nicolas',   '71000016'),
            ('Marcos',     'Sanchez',    'Alexander',  'Andre',     '71000017'),
            ('Meza',       'Ccente',     'Jordy',      'Anderson',  '71000018'),
            ('Miñan',      'Valverde',   'Ana',        'Camila',    '71000019'),
            ('Naventa',    'Ucañay',     'Dariana',    'Stefany',   '71000020'),
            ('Ore',        'Quevedo',    'Jose',       'Fernando',  '71000021'),
            ('Raymundo',   'Soto',       'Alessandro', '',          '71000022'),
            ('Rioja',      'Toledo',     'Karen',      'Milagros',  '71000023'),
            ('Rivera',     'Mallqui',    'Jeanpiero',  'Manuel',    '71000024'),
            ('Romero',     'Reyes',      'Mirko',      'Johel',     '71000025'),
            ('Salas',      'Panaifo',    'Leysy',      'Esther',    '71000026'),
            ('Salgado',    'Palacios',   'Andry',      'Ryan',      '71000027'),
            ('Santiago',   'Sulca',      'Melany',     'Darlyn',    '71000028'),
            ('Seron',      'Alca',       'Rodrigo',    'Cristobal', '71000029'),
            ('Vasquez',    'Cano',       'Edinson',    'Valentino', '71000030'),
            ('Vega',       'Aguero',     'Cristiano',  'Santiago',  '71000031'),
            ('Vilchez',    'Paraguay',   'Nahidu',     'Sofia',     '71000032'),
        ]

        creados = 0
        for i, (ap1, ap2, n1, n2, dni) in enumerate(alumnos, start=1):
            _, creado = Alumno.objects.get_or_create(
                dni=dni,
                defaults={
                    'codigo': f'1A{str(i).zfill(3)}',
                    'nombres': f'{n1} {n2}'.strip(),
                    'apellidos': f'{ap1} {ap2}'.strip(),
                    'seccion': seccion,
                    'fecha_nacimiento': '2010-01-01',
                }
            )
            if creado:
                creados += 1

        self.stdout.write(f'  Alumnos 1A creados: {creados} / {len(alumnos)}')

        # Sesión de hoy si no existe
        curso, _ = Curso.objects.get_or_create(
            codigo='MAT01',
            defaults={'nombre': 'Matematica', 'grado': grado, 'profesor': prof}
        )
        hoy = timezone.now().date()
        _, creada = SesionClase.objects.get_or_create(
            curso=curso, seccion=seccion, fecha=hoy,
            defaults={'profesor': prof, 'hora_inicio': '07:30'}
        )
        if creada:
            self.stdout.write(f'  Sesion de hoy creada para 1A')
