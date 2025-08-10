from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import TwitchForm
from ...decorators import has_selected_guild
from ...utils import update_table


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_twitch(request):
    gid = request.session["gid"]

    if request.method == "POST":
        form = TwitchForm(request.POST, gid=request.session["gid"])
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                if key == "channel":
                    update_table(gid, "serverTwitch", "receivingAlerts", "yes")
                update_table(gid, "serverTwitch", key, value)
            return HttpResponseRedirect('')
    else:
        form = TwitchForm(gid=request.session["gid"])

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "show_right_bar": False}
    return render(request, "main/twitch_notif/main_page.html", dictio)
