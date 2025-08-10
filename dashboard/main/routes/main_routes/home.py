from discordlogin.models import DiscordUser, DiscordGuild
from django.shortcuts import render
from ...utils import get_bot_info


def home(request):
    bot_info = get_bot_info()
    if request.user.is_authenticated:
        user = DiscordUser.objects.get(id=request.user.id)
        guild_id = request.session.get("gid")
        if guild_id:
            guild = DiscordGuild.objects.get(g_id=guild_id, u_id=request.user.id)
        else:
            guild = None

        dictio = {"username": user.discord_tag,
                  "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png", "guild": guild, "bot_info": bot_info}
    else:
        dictio = {"bot_info": bot_info}
    return render(request, "main/home/home.html", dictio)
