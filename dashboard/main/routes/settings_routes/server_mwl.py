from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import WelcomeForm, LeaveForm
from ...decorators import has_selected_guild
from ...utils import update_table


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_mwl(request, page):
    gid = request.session["gid"]

    forms = [WelcomeForm, LeaveForm]
    if request.method == "POST":
        form = forms[page-1](request.POST, gid=request.session["gid"])
        if form.is_valid():
            print(form.cleaned_data)
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                update_table(gid, "guildWl", key, value)
            return HttpResponseRedirect('')
    else:
        form = forms[page-1](gid=request.session["gid"])

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "page": page, "show_right_bar": False}
    return render(request, "main/mwl/main_page.html", dictio)
