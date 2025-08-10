from django.shortcuts import render, redirect
from discordlogin.models import DiscordUser
from ...forms import SearchFormCommand
from ...utils import get_from_table_all


def cmd_search(request):
    if request.method == "POST":
        form = SearchFormCommand(request.POST)
        if form.is_valid():
            return redirect(f"cmd_info", form.cleaned_data["commandName"])
    else:
        form = SearchFormCommand()

    rows = get_from_table_all("1", "botCommands")
    just_names = ",".join([x[0] for x in rows])
    print(just_names)
    try:
        user = DiscordUser.objects.get(id=request.user.id)
    except DiscordUser.DoesNotExist:
        user = None
    dictio = {"username": user.discord_tag if user else None,
              "avatar": f"https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png" if user else None,
              "form": form, "show_right_bar": True, "head_title": "Command-Search",
              "head_description": "You are now searching for a command", "rows": rows, "commands": just_names}
    return render(request, "main/cmd_search/main_page.html", dictio)
