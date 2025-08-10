from src import app
from src.routes import bot


@bot.event
async def on_ready():
    print(f"{bot.user.name} is ready for the api")
    await start()

token = ""


async def start():
    from src import routes  # nopep8

    await bot.loop.create_task(app.run_task())


bot.run(token)