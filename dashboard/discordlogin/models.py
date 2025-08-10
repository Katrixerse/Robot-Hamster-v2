from django.db import models
from .managers import DiscordOAuth2Manager, DiscordGuildManager


class DiscordUser(models.Model):
    objects = DiscordOAuth2Manager()

    id = models.BigIntegerField(primary_key=True)
    discord_tag = models.CharField(max_length=100)
    avatar = models.CharField(max_length=100)
    public_flags = models.IntegerField()
    flags = models.IntegerField()
    locale = models.CharField(max_length=100)
    mfa_enabled = models.BooleanField()
    last_login = models.DateTimeField(null=True)

    def is_authenticated(self):
        return True


class DiscordGuild(models.Model):
    objects = DiscordGuildManager()

    g_id = models.BigIntegerField()
    u_id = models.BigIntegerField()
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=150)
