from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.messages import add_message, SUCCESS
import requests
from ...decorators import has_selected_guild
from ...utils import URL


@login_required(login_url="/oauth2/login")
@has_selected_guild
def delete_customcommand(request, name):
    gid = request.session["gid"]
    requests.get(f"{URL}/delete_from/{gid}/serverCustomCommands/name/{name}")

    add_message(request, SUCCESS, "Custom command deleted successfully.")
    return redirect("server_cc")
