from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS, INFO
from django.http import HttpResponseRedirect
from ...forms import CCForm
from ...decorators import has_selected_guild
from ...utils import insert_into, get_from_table_all, URL
import urllib.parse


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_cc(request):
    gid = request.session["gid"]
    rows = get_from_table_all(gid, "serverCustomCommands")

    if request.method == "POST":
        form = CCForm(request.POST, gid=request.session["gid"])
        if form.is_valid():
            search = [x for x in rows if x[1] == form.cleaned_data['name']]
            if len(rows) >= 25:
                add_message(request, INFO,
                            "This server has too many commands right now. (25)")
            elif len(search) > 0:
                add_message(request, INFO,
                            "There already is a custom command with that name.")
            else:
                add_message(request, SUCCESS, "Command added!")
                insert_into("serverCustomCommands", "['guildId', 'name', 'output']",
                            f"['{gid}', '{urllib.parse.quote(form.cleaned_data['name'], safe='')}', '{form.cleaned_data['output']}']")
            return HttpResponseRedirect('')
    else:
        form = CCForm(gid=request.session["gid"])

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "rows": rows, "url": f"{URL}/delete_from/{gid}/serverCustomCommands/name/", "show_right_bar": False}
    return render(request, "main/custom_commands/main_page.html", dictio)
