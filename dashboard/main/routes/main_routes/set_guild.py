from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from discordlogin.models import DiscordGuild


@login_required(login_url="/oauth2/login")
def set_guild(request, id):
    if id:
        try:
            guilds = DiscordGuild.objects.filter(g_id=id)
            if len(guilds) > 0:
                request.session["gid"] = id
        except DiscordGuild.DoesNotExist:
            pass
    return redirect("/")
