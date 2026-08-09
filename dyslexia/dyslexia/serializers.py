from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from djoser.conf import settings as djoser_settings
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer as DjoserUserCreatePasswordRetypeSerializer,
    UserCreateSerializer as DjoserUserCreateSerializer,
)
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings


User = get_user_model()


class UserCreateSerializer(DjoserUserCreateSerializer):
    username = serializers.CharField()

    class Meta(DjoserUserCreateSerializer.Meta):
        fields = (
            User.USERNAME_FIELD,
            djoser_settings.LOGIN_FIELD,
            "password",
        )


class UserCreatePasswordRetypeSerializer(DjoserUserCreatePasswordRetypeSerializer):
    username = serializers.CharField()

    class Meta(DjoserUserCreatePasswordRetypeSerializer.Meta):
        fields = (
            User.USERNAME_FIELD,
            djoser_settings.LOGIN_FIELD,
            "password",
        )


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        try:
            self.user = User._default_manager.get(email=attrs['email'])
        except User.DoesNotExist:
            self.fail('no_active_account')

        if not self.user.check_password(attrs['password']):
            self.fail('no_active_account')

        if not jwt_api_settings.USER_AUTHENTICATION_RULE(self.user):
            self.fail('no_active_account')

        data = {}
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        if jwt_api_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, self.user)

        return data