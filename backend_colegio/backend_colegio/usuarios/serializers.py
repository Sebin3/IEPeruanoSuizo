from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nombre_completo'] = user.nombre_completo
        token['rol'] = user.rol
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['usuario'] = UsuarioSerializer(self.user).data
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    nombre_completo = serializers.ReadOnlyField()

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombres', 'apellidos', 'nombre_completo', 'rol', 'telefono', 'is_active']
        read_only_fields = ['id', 'email']


class CrearUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Usuario
        fields = ['email', 'nombres', 'apellidos', 'rol', 'telefono', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario


class CambiarPasswordSerializer(serializers.Serializer):
    password_actual = serializers.CharField(write_only=True)
    password_nuevo = serializers.CharField(write_only=True, min_length=8)
    password_confirmacion = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password_nuevo'] != attrs['password_confirmacion']:
            raise serializers.ValidationError({'password_confirmacion': 'Las contraseñas no coinciden'})
        return attrs

    def validate_password_actual(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('La contraseña actual es incorrecta')
        return value
