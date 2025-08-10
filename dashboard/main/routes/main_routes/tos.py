from discordlogin.models import DiscordUser, DiscordGuild
from django.shortcuts import render


def tos(request):
    if request.user.is_authenticated:
        user = DiscordUser.objects.get(id=request.user.id)
        guild_id = request.session.get("gid")
        if guild_id:
            guild = DiscordGuild.objects.get(g_id=guild_id, u_id=request.user.id)
        else:
            guild = None

        dictio = {"username": user.discord_tag,
                  "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png", "guild": guild, "head_title": "TOS", "head_description": "You are now viewing the TOS"}
    else:
        dictio = {}
    return render(request, "main/tos/main_page.html", dictio)
