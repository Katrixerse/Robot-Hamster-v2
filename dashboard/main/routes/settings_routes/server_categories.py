from django.shortcuts import render
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
from django.http import HttpResponseRedirect
from ...forms import CategoriesForm
from ...decorators import has_selected_guild
from ...utils import update_table


@login_required(login_url="/oauth2/login")
@has_selected_guild
def server_categories(request):
    gid = request.session["gid"]

    if request.method == "POST":
        form = CategoriesForm(request.POST, gid=gid)
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                update_table(gid, "serverCategories", key, value)
            return HttpResponseRedirect('')
    else:
        form = CategoriesForm(gid=gid)

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "show_right_bar": False}
    return render(request, "main/categories/main_page.html", dictio)
