from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import AutoroleForm
from ...decorators import has_selected_guild
from ...utils import update_table, get_from_table_specific, get_role_info


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_autorole(request, page):
    gid = request.session["gid"]
    cur_roles = get_from_table_specific(
        gid, "serverAutoroles", "roles").split(",")
    roles_with_info = [get_role_info(gid, r) for r in cur_roles]
    if request.method == "POST":
        form = AutoroleForm(request.POST, gid=request.session["gid"])
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                for e in cur_roles:
                    if e == "":
                        cur_roles.remove(e)
                if key == "add_new_role":
                    cur_roles.append(value)
                    update_table(gid, "serverAutoroles",
                                 "roles", ",".join(cur_roles))
                elif key == "delete_role":
                    if value in cur_roles:
                        cur_roles.remove(value)
                    if len(cur_roles) == 0:
                        cur_roles = "nothing1234"
                    update_table(gid, "serverAutoroles",
                                 "roles", ",".join(cur_roles) if cur_roles != "nothing1234" else " ")
                else:
                    update_table(gid, "serverAutoroles", key, value)
            return HttpResponseRedirect('')
    else:
        form = AutoroleForm(gid=request.session["gid"])

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "page": page, "show_right_bar": False, "roles": roles_with_info}
    return render(request, "main/autorole/main_page.html", dictio)
