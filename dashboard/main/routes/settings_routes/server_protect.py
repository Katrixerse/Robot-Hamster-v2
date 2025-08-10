from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import ServerProtectForm
from ...decorators import has_selected_guild
from ...utils import update_table


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_protect(request):
    gid = request.session["gid"]

    if request.method == "POST":
        form = ServerProtectForm(request.POST, gid=gid)
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                if key == "code" or key == "enabled":
                    update_table(gid, "serverTfa", key, value)
                else:
                    update_table(gid, "serverSettings", key, value)
            return HttpResponseRedirect('')
    else:
        form = ServerProtectForm(gid=gid)

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "show_right_bar": False}
    return render(request, "main/server_protection/main_page.html", dictio)
