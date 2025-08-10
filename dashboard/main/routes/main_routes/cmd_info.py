from django.shortcuts import render, redirect
from discordlogin.models import DiscordUser
from django.contrib.messages import add_message, INFO
from ...utils import get_from_table_all


def cmd_info(request, cmd_name):
    if not cmd_name or len(cmd_name) == 0:
        add_message(request, INFO, "That is not a valid command name.")
        return redirect("/")
    rows = get_from_table_all("1", "botCommands")
    cmd = [c for c in rows if c[0] == cmd_name]
    if len(cmd) == 0:
        add_message(request, INFO, "That is not a valid command name.")
        return redirect("/")
    cmd = cmd[0]
    try:
        user = DiscordUser.objects.get(id=request.user.id)
    except DiscordUser.DoesNotExist:
        user = None
    dictio = {"username": user.discord_tag if user else None,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png" if user else None,
              "show_right_bar": True, "head_title": "Command-Search",
              "head_description": "You are now searching for a command", "cmd": cmd}
    return render(request, "main/cmd_info/main_page.html", dictio)
