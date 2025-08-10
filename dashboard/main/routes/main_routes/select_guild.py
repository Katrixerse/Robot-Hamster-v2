from discordlogin.models import DiscordUser
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from ...forms import SearchForm
from discordlogin.models import DiscordGuild


@login_required(login_url="/oauth2/login")
def select_guild(request):
    cleaned_data = None
    guilds = DiscordGuild.objects.filter(u_id=request.user.id)

    if request.method == "POST":
        form = SearchForm(request.POST)

        if form.is_valid():
            cleaned_data = form.cleaned_data['guild_name']
            guilds = [x for x in guilds if x.name.startswith(cleaned_data)]

    else:
        form = SearchForm()

    user = DiscordUser.objects.get(id=request.user.id)
    dictio = {"username": user.discord_tag, "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png",
              "form": form, "searched_for": cleaned_data, "guilds": guilds}
    return render(request, "main/select_guild/select_guild.html", dictio)
