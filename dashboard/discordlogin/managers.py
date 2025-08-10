from django.contrib.auth import models


class DiscordOAuth2Manager(models.UserManager):
    def create_new_discord_user(self, user):
        discord_tag = f'{user["username"]}#{user["discriminator"]}'
        new_user = self.create(
            id=user['id'],
            avatar=user['avatar'],
            public_flags=user['public_flags'],
            flags=user['flags'],
            locale=user['locale'],
            mfa_enabled=user['mfa_enabled'],
            discord_tag=discord_tag
        )

        return new_user


class DiscordGuildManager(models.GroupManager):
    def create_new_discord_guild(self, guild, user_id):
        icon = f"https://cdn.discordapp.com/icons/{guild['id']}/{guild['icon']}.png"
        new_guild = self.create(
            g_id=guild['id'],
            u_id=user_id,
            name=guild['name'],
            icon=icon
        )

        return new_guild
