from .utils import *
from .routes.main_routes import home, select_guild, set_guild, tos, privacy_policy, cmd_search, cmd_info
from .routes.settings_routes import server_autorole, server_categories, server_cc,\
    delete_customcommand, server_mwl, server_protect, server_settings, server_twitch, user_profile

from django.shortcuts import render
def page_not_found(request, exception):
    return render(request, "main/errors/404.html", status = 404)

def server_error(request):
    return render(request, "main/errors/500.html", status = 500)