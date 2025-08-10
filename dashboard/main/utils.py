import requests

URL = "http://localhost:5000"


def get_bot_info():
    response = requests.get(f"{URL}/bot_info")
    response = response.json()

    return response


def get_from_table(gid, t_name):
    response = requests.get(f"{URL}/get_from_table/{gid}/{t_name}")
    response = response.json()

    return response.get("row")


def get_from_table_uid(gid, uid, t_name):
    response = requests.get(f"{URL}/get_from_table_uid/{gid}/{uid}/{t_name}")
    response = response.json()

    return response.get("row")


def get_from_table_specific(gid, t_name, f_name):
    response = requests.get(
        f"{URL}/get_from_table_specific/{gid}/{t_name}/{f_name}")
    response = response.json()

    return response.get("value")


def get_from_table_all(gid, t_name):
    response = requests.get(
        f"{URL}/get_from_table_all/{gid}/{t_name}")
    response = response.json()

    return response.get("rows")


def insert_into(t_name, cols, values):
    requests.get(f"{URL}/insert_into/{t_name}/{cols}/{values}")


def update_table(gid, t_name, f_name, new):
    old_value = get_from_table_specific(gid, t_name, f_name)
    if type(new) == bool:
        if old_value in ["enabled", "disabled"]:
            new = "enabled" if new else "disabled"
        elif old_value in ["true", "false"]:
            new = "true" if new else "false"
        elif old_value in ["on", "off"]:
            new = "on" if new else "false"
        elif old_value in ["no", "yes"]:
            new = "yes" if new else "no"
    if old_value != new:
        requests.get(
            f"{URL}/update_table/{gid}/{t_name}/{f_name}/{new}")


def get_role_info(gid, r_name):
    response = requests.get(f"{URL}/get_role_info/{gid}/{r_name}")
    response = response.json()

    return response
