from src import app
import discord
from src.db import cursor, mydb


intents = discord.Intents.all()
intents.members = True

bot = discord.Client(intents=intents)

@app.route("/bot_info")
async def bot_info():
    return {"guilds": len(bot.guilds), "users": len(bot.users)}


@app.route("/is_channel_valid/<string:c_id>/<int:g_id>")
async def channel_valid(c_id, g_id):
    guild = bot.get_guild(g_id)
    if not guild: return {"exists": False}
    channel = [c for c in guild.channels if c.name.lower() == c_id.lower()]

    if len(channel) > 0: 
        return {"exists": True, "id": channel[0].id}
    else:
        return {"exists": False}

@app.route("/is_role_valid/<string:r_id>/<int:g_id>")
async def role_valid(r_id, g_id):
    guild = bot.get_guild(g_id)
    role = [c for c in guild.roles if c.name.lower() == r_id.lower()]

    if len(role) > 0: 
        return {"exists": True, "id": role[0].id}
    else:
        return {"exists": False}

@app.route("/get_from_table/<int:g_id>/<string:t_name>")
async def get_from_table(g_id, t_name):
    sql = f"SELECT * FROM {t_name} WHERE guildId='{g_id}'"
    cursor.execute(sql)

    row = cursor.fetchone()

    return {"row": row}

@app.route("/get_from_table_specific/<int:g_id>/<string:t_name>/<string:f_name>")
async def get_from_table_specific(g_id, t_name, f_name):
    sql = f"SELECT {f_name} FROM {t_name} WHERE guildId='{g_id}'"
    cursor.execute(sql)

    row = cursor.fetchone()

    return {"value": row[0]}

@app.route("/get_from_table_all/<int:g_id>/<string:t_name>")
async def get_from_table_all(g_id, t_name):
    sql = f"SELECT * FROM {t_name} WHERE guildId='{g_id}'"
    if t_name == "botCommands":
            sql = f"SELECT * FROM {t_name}"
    cursor.execute(sql)

    rows = cursor.fetchall()

    return {"rows": rows}

@app.route("/get_from_table_uid/<int:g_id>/<int:u_id>/<string:t_name>")
async def get_from_table_uid(g_id, u_id, t_name):
    sql = f"SELECT * FROM {t_name} WHERE guildId='{g_id}' AND userId='{u_id}'"
    cursor.execute(sql)

    row = cursor.fetchone()

    return {"row": row}

@app.route("/update_table/<int:g_id>/<string:t_name>/<string:f_name>/<string:new>")
async def update_table(g_id, t_name, f_name, new):
    if new == " ":
        new = ""
    new = new.replace("%HASHTAG%", "#") # FOR USERPROFILE
    sql = f"UPDATE {t_name} SET {f_name}=%s WHERE guildId='{g_id}'"
    cursor.execute(sql, (new, ))
    mydb.commit()

    return {"msg": "Success"}

@app.route("/get_role_info/<int:g_id>/<string:r_name>")
async def get_role_info(g_id, r_name):   
    guild = bot.get_guild(g_id)
    roles = await guild.fetch_roles()
    role = [r for r in roles if r.name == r_name]
    if len(role) == 0:
        return {"msg": "Error"}
    else:
        role = role[0]
        return {"name": role.name, "color": str(role.color)}

@app.route("/insert_into/<string:t_name>/<string:cols>/<string:values>")
async def insert_into(t_name, cols, values):   
    cols = eval(cols)
    values = eval(values)
    values_question_marks = ", ".join(["%s"]*len(cols))
    cols = ", ".join(cols)
    sql = f"INSERT INTO {t_name} ({cols}) VALUES ({values_question_marks})"
    cursor.execute(sql, values)
    mydb.commit()

    return {"msg": "Success"}


@app.route("/delete_from/<int:g_id>/<string:t_name>/<string:c_name>/<string:value>")
async def delete_from(g_id, t_name, c_name, value):   
    sql = f"DELETE FROM {t_name} WHERE guildId='{g_id}' AND {c_name}=%s LIMIT 1"
    cursor.execute(sql, (value, ))
    mydb.commit()

    return {"msg": "Success"}