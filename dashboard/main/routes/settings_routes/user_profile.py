from django.shortcuts import render, redirect
from discordlogin.models import DiscordUser
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS, INFO
from django.http import HttpResponseRedirect
from ...forms import UserProfileForm
from ...decorators import has_selected_guild
from ...utils import update_table, get_from_table_uid


@login_required(login_url="/oauth2/login")
@has_selected_guild
def user_profile(request):
    gid = request.session["gid"]
    profile_row = get_from_table_uid(gid, request.user.id, "profileSettings")
    if not profile_row:
        add_message(
            INFO, "To access that feature, you need to enable the leveling system.")
        redirect("/")

    if request.method == "POST":
        form = UserProfileForm(request.POST, row=profile_row)
        if form.is_valid():
            add_message(request, SUCCESS, "Settings updated")
            for key, value in form.cleaned_data.items():
                if value == "":
                    continue
                if key == "textColor" or key == "bckgColor":
                    update_table(gid, "profileSettings",
                                 key, value.replace("#", "%HASHTAG%"))
                elif value == True:
                    update_table(gid, "profileSettings",
                                 "background", key.split("_")[1])
            return HttpResponseRedirect('')
    else:
        form = UserProfileForm(row=profile_row)

    profile = {
        "color": profile_row[2],
        "font": "Arial" if profile_row[4] == "default" else profile_row[4],
        "font_style": "normal" if profile_row[5] == "default" else profile_row[5],
        "background": profile_row[3],
        "background_color": profile_row[6]
    }

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "show_right_bar": False, "profile": profile}
    return render(request, "main/user_profile/main_page.html", dictio)
