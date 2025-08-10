from django.contrib import admin
from django.urls import path

from discordlogin import views as oauth_views
from main import views as main_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', main_views.home.home, name='home'),
    path('tos', main_views.tos.tos, name='tos'),
    path('privacy_policy', main_views.privacy_policy.privacy, name='privacy_policy'),
    path('select_guild/', main_views.select_guild.select_guild, name='select_guild'),
    path('set_guild/<int:id>/', main_views.set_guild.set_guild, name='set_guild'),
    path('cmd_info/<str:cmd_name>/',
         main_views.cmd_info.cmd_info, name='cmd_info'),
    path('cmd_search/', main_views.cmd_search.cmd_search, name='cmd_search'),
    path('server_settings/<int:page>/',
         main_views.server_settings.server_settings, name='server_settings'),
    path('server_mwl/<int:page>/',
         main_views.server_mwl.server_mwl, name='server_mwl'),
    path('server_autorole/<int:page>/',
         main_views.server_autorole.server_autorole, name='server_autorole'),
    path('twitch_notifs/',
         main_views.server_twitch.server_twitch, name='twitch'),
    path('server_categories/',
         main_views.server_categories.server_categories, name='categories'),
    path('server_protection/',
         main_views.server_protect.server_protect, name='server_protection'),
    path('custom_commands/',
         main_views.server_cc.server_cc, name='server_cc'),
    path('delete_customcommand/<str:name>/',
         main_views.delete_customcommand.delete_customcommand, name='delete_cc'),
    path('user_profile/',
         main_views.user_profile.user_profile, name='user_profile'),
    path('oauth2/login', oauth_views.discord_login, name='login'),
    path('oauth2/login/redirect', oauth_views.discord_login_redirect),
    path('oauth2/logout', oauth_views.discord_logout, name='logout'),
    path('oauth2/modmail/redirect', oauth_views.modmail, name='modmail'),
]

handler404 = 'main.views.page_not_found'
handler500 = 'main.views.server_error'