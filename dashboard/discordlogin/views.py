from django.shortcuts import redirect
from django.db.models.query import QuerySet
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.messages import add_message, SUCCESS
import requests
from .bot_config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, REDIRECT_URI, TOKEN
from .models import DiscordUser, DiscordGuild
from .modmail import exchange_code_modmail, get_common_guilds_modmail, insert_into, URL


def discord_login(request):
    if request.user.is_authenticated:
        return redirect("/")
    return redirect(REDIRECT_URL)


def discord_login_redirect(request):
    if request.user.is_authenticated:
        return redirect("/")

    code = request.GET.get('code')

    user = exchange_code(code, request)

    if not user:
        return redirect("/")

    discord_user = authenticate(request, user=user)

    if isinstance(discord_user, QuerySet):
        discord_user = list(discord_user).pop()

    login(request, discord_user)

    guilds = get_common_guilds(request)
    for guild in guilds:
        find_guild = DiscordGuild.objects.filter(g_id = guild["id"], u_id=request.user.id)
        if len(find_guild) == 0:
            DiscordGuild.objects.create_new_discord_guild(
                guild, request.user.id)

    add_message(request, SUCCESS, "You have logged in.")

    return redirect("/")


def exchange_code(code: str, request):
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "scope": "indentify guilds"
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(
        "https://discord.com/api/oauth2/token", data=data, headers=headers)

    credentials = response.json()

    if "error" in list(credentials.keys()):
        return None

    access_token = credentials["access_token"]
    request.session["access_token"] = access_token

    response = requests.get("https://discord.com/api/v6/users/@me", headers={
        'Authorization': f'Bearer {access_token}'
    })

    user = response.json()

    return user


def get_common_from_list(u, b):
    common = []
    for g in u:
        user_permissions = g["permissions"]
        if (user_permissions & 0x0000000000000020) == 0x0000000000000020:
            if any(x == int(g['id']) for x in b):
                common.append(g)

    return common


def get_common_guilds(request):
    response = requests.get("https://discord.com/api/v6/users/@me/guilds", headers={
        'Authorization': f'Bearer {request.session["access_token"]}'
    })

    user_guilds = response.json()

    response = requests.get(f"{URL}/get_bot_guilds")

    bot_guilds = response.json()
    bot_guilds = bot_guilds.get("guilds")

    return get_common_from_list(user_guilds, bot_guilds)


@login_required(login_url="/oauth2/login")
def discord_logout(request):
    guilds = DiscordGuild.objects.filter(u_id=request.user.id)
    if len(guilds) > 0:
        for guild in guilds:
            guild.delete()

    user = DiscordUser.objects.get(id=request.user.id)
    user.delete()

    request.session["gid"] = None

    logout(request)

    add_message(request, SUCCESS, "You have logged out.")

    return redirect("/")


def modmail(request):
    code = request.GET['code']
    if not code:
        return redirect("/")

    information = exchange_code_modmail(code)
    access_token = information["at"]
    user_json = information["user"]

    shared_guilds = get_common_guilds_modmail(access_token)
    guilds_str = '|'.join([x["id"] for x in shared_guilds])

    insert_into("userGuilds", "['userId','guilds']",
                f"['{user_json['id']}', '{guilds_str}']")

    add_message(request, SUCCESS,
                "Authorization successfull. Please return to DMs.")
    return redirect("/")
