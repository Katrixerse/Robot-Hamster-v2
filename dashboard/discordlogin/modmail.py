from .bot_config import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI_MODMAIL, TOKEN
import requests

URL = "http://localhost:5000"


def insert_into(t_name, cols, values):
    requests.get(f"{URL}/insert_into/{t_name}/{cols}/{values}")


def guild_has_modmail_channel(g_id):
    response = requests.get(f"{URL}/is_channel_valid/modmail/{g_id}")
    response = response.json()
    return response.get("exists")


def exchange_code_modmail(code: str):
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI_MODMAIL,
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

    response = requests.get("https://discord.com/api/v6/users/@me", headers={
        'Authorization': f'Bearer {access_token}'
    })

    user = response.json()

    return {"at": access_token, "user": user}


def get_common_from_list_modmail(u, b):
    common = []
    for g in u:
        if guild_has_modmail_channel(g['id']):
            if any(x['id'] == g['id'] for x in b):
                common.append(g)

    return common


def get_common_guilds_modmail(access_token):
    response = requests.get("https://discord.com/api/v6/users/@me/guilds", headers={
        'Authorization': f'Bearer {access_token}'
    })

    user_guilds = response.json()

    response = requests.get("https://discord.com/api/v6/users/@me/guilds", headers={
        'Authorization': f'Bot {TOKEN}'
    })

    bot_guilds = response.json()

    return get_common_from_list_modmail(user_guilds, bot_guilds)
