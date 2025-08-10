from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import PrefixForm, ModlogsForm, ChatlogsForm
from ...decorators import has_selected_guild
from ...utils import update_table


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_settings(request, page):
    gid = request.session["gid"]

    forms = [PrefixForm, ModlogsForm, ChatlogsForm]

    if request.method == "POST":
        form = forms[page-1](request.POST,
                             gid=gid)
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                if key == "prefix":
                    update_table(gid, "serverPrefix", key, value)
                else:
                    update_table(gid, "serverSettings", key, value)
            return HttpResponseRedirect('')
    else:
        form = forms[page-1](gid=gid)

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "page": page, "show_right_bar": True}
    return render(request, "main/server_settings/main_page.html", dictio)
