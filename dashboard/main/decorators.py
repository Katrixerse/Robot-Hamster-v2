from django.shortcuts import redirect
from django.contrib.messages import add_message, ERROR
from discordlogin.models import DiscordGuild


def has_selected_guild(function):
    def wrap(request, *args, **kwargs):
        guild_id = request.session.get("gid")
        if not guild_id:
            add_message(request, ERROR,
                        "You must have selected a guild to access that page.")
            return redirect("/")
        guild = DiscordGuild.objects.filter(g_id=guild_id)
        if len(guild) == 0:
            add_message(request, ERROR,
                        "You must have selected a guild to access that page.")
            return redirect("/")

        return function(request, *args, **kwargs)

    wrap.__doc__ = function.__doc__
    wrap.__name__ = function.__name__
    return wrap
