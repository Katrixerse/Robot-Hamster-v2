from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
import requests

URL = "http://localhost:5000"


def valid_channel_validator(gid):
    def inner_fn(value):
        response = requests.get(
            f"{URL}/is_channel_valid/{value}/{gid}")
        response = response.json()

        if not response.get("exists"):
            raise ValidationError("That is not a valid channel.")

    return inner_fn


def valid_role_validator(gid):
    def inner_fn(value):
        response = requests.get(
            f"{URL}/is_role_valid/{value}/{gid}")
        response = response.json()

        if not response.get("exists"):
            raise ValidationError("That is not a valid role.")

    return inner_fn


POSSIBLE_NO = ["no", "off", "false", "disabled"]
POSSIBLE_YES = ["yes", "on", "true", "enabled"]


class SearchForm(forms.Form):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for _, field in self.fields.items():
            field.label = ""

    guild_name = forms.CharField(label=None, widget=forms.TextInput(
        attrs={'placeholder': 'Guild name...', 'class': 'form-control'}))


class SearchFormCommand(forms.Form):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for _, field in self.fields.items():
            field.label = ""

    commandName = forms.CharField(widget=forms.TextInput(
        attrs={'placeholder': 'Command name', 'class': 'form-dark form-control', 'id': 'commandInput'}))


class PrefixForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        pref_row = get_from_table(gid, "serverPrefix")
        cur_pref = pref_row[1]
        for key, field in self.fields.items():
            if key == "prefix":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': cur_pref})
            field.label = ""

    prefix = forms.CharField(required=False, max_length=7)


class ModlogsForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        settings_row = get_from_table(gid, "serverSettings")
        for key, field in self.fields.items():
            if key == "modlogsChannel":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': settings_row[3]})
                field.validators = [
                    valid_channel_validator(gid)
                ]
            if key == "modlogs":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input align-self-center', 'id': 'flexSwitchCheckDefault', 'checked': True if settings_row[1] in POSSIBLE_YES else False})
            field.label = ""

    modlogsChannel = forms.CharField(required=False)
    modlogs = forms.BooleanField(required=False)


class ChatlogsForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        settings_row = get_from_table(gid, "serverSettings")
        for key, field in self.fields.items():
            if key == "chatlogsChannel":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': settings_row[4]})
                field.validators = [
                    valid_channel_validator(gid)
                ]
            if key == "chatlogs":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input align-self-center', 'id': 'flexSwitchCheckDefault', 'checked': True if settings_row[2] in POSSIBLE_YES else False})
            field.label = ""

    chatlogsChannel = forms.CharField(required=False)
    chatlogs = forms.BooleanField(required=False)


BACKGROUND_CHOICES = [
    ('default', 'Default'),
    ('fade', 'Fade'),
    ('space', 'Space'),
    ('blossom', 'Blossom'),
    ('neon', 'Neon'),
    ('leafs', 'Leafs'),
    ('samurai', 'Samurai'),
    ('eclipse', 'Eclipse'),
    ('binary', 'Binary')
]

STYLE_CHOICES = [
    ('text', 'Text'),
    ('image', 'Image')
]

FONT_CHOICES = [
    ('arial', 'Default'),
    ('verdana', 'Verdana'),
    ('times_new_roman', 'Times New Roman'),
    ('courier_new', 'Courier New'),
    ('serif', 'serif'),
    ('sans-serif', 'sans-serif')
]


class WelcomeForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        wl_row = get_from_table(gid, "guildWl")
        for key, field in self.fields.items():
            if key == "welcomeMessageEnabled":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if wl_row[1] == "true" else False})
            elif key == "welcomeMessage":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': wl_row[2]})
            elif key == "welcomeChannel":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': wl_row[3]})
                field.validators = [valid_channel_validator(gid)]
            elif key == "background":
                field.widget = forms.Select(
                    attrs={"class": "form-select"}, choices=BACKGROUND_CHOICES)
            elif key == "style":
                field.widget = forms.Select(
                    attrs={"class": "form-select"}, choices=STYLE_CHOICES)
            field.label = ""

    welcomeMessageEnabled = forms.BooleanField(required=False)
    welcomeMessage = forms.CharField(required=False)
    welcomeChannel = forms.CharField(required=False)
    background = forms.ChoiceField(required=False, choices=BACKGROUND_CHOICES)
    style = forms.ChoiceField(required=False, choices=STYLE_CHOICES)


class LeaveForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        wl_row = get_from_table(gid, "guildWl")
        for key, field in self.fields.items():
            if key == "leaveMessageEnabled":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if wl_row[4] == "true" else False})
            elif key == "leaveMessage":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': wl_row[5]})
            elif key == "leaveChannel":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': wl_row[6]})
                field.validators = [valid_channel_validator(gid)]
            field.label = ""

    leaveMessageEnabled = forms.BooleanField(required=False)
    leaveMessage = forms.CharField(required=False)
    leaveChannel = forms.CharField(required=False)
    # leave_background = forms.MultipleChoiceField(required=False, choices=BACKGROUND_CHOICES,
    #                                              widget=forms.Select(attrs={"class": "form-select"}))
    # leave_style = forms.MultipleChoiceField(required=False, choices=STYLE_CHOICES,
    #                                         widget=forms.Select(attrs={"class": "form-select"}))


class AutoroleForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        ar_row = get_from_table(gid, "serverAutoroles")
        for key, field in self.fields.items():
            if key == "enabled":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if ar_row[1] == "yes" else False})
            elif key == "add_new_role" or key == "delete_role":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': 'Enter role name...'})
                field.validators = [valid_role_validator(
                    gid)] if key == "add_new_role" else []
            field.label = ""

    enabled = forms.BooleanField(required=False)
    add_new_role = forms.CharField(required=False, max_length=20)
    delete_role = forms.CharField(required=False, max_length=20)


class TwitchForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        tw_row = get_from_table(gid, "serverTwitch")
        for key, field in self.fields.items():
            if key == "channel":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': tw_row[2]})
                field.validators = [valid_channel_validator(gid)]
            if key == "username":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': tw_row[1]})
            if key == "messageContent":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': tw_row[4]})
            field.label = ""

    channel = forms.CharField(required=False, max_length=20)
    username = forms.CharField(required=False, max_length=20)
    messageContent = forms.CharField(required=False, max_length=70)


class CategoriesForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table
        ct_row = get_from_table(gid, "serverCategories")
        i = 1
        for key, field in self.fields.items():
            field.widget = forms.CheckboxInput(
                {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if ct_row[i] == "yes" else False})
            field.label = ""
            i += 1

    economy = forms.BooleanField(required=False)
    fun = forms.BooleanField(required=False)
    info = forms.BooleanField(required=False)
    leveling = forms.BooleanField(required=False)
    moderation = forms.BooleanField(required=False)
    nsfw = forms.BooleanField(required=False)
    roleplay = forms.BooleanField(required=False)
    misc = forms.BooleanField(required=False)
    image = forms.BooleanField(required=False)


class ServerProtectForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        from .views import get_from_table, get_from_table_specific
        pass_row = get_from_table(gid, "serverTfa")
        captcha_value = get_from_table_specific(
            gid, "serverSettings", "serverCaptcha")
        for key, field in self.fields.items():
            if key == "code":
                field.widget = forms.TextInput(
                    {'class': 'form-dark form-control', 'placeholder': pass_row[2]})
            if key == "serverCaptcha":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if captcha_value == "enabled" else False})
            elif key == "enabled":
                field.widget = forms.CheckboxInput(
                    {'class': 'form-check-input', 'type': 'checkbox', 'id': 'flexSwitchCheckDefault', 'checked': True if pass_row[1] == "true" else False})
            field.label = ""

    enabled = forms.BooleanField(required=False)
    serverCaptcha = forms.BooleanField(required=False)
    code = forms.CharField(required=False, max_length=15)


class UserProfileForm(forms.Form):
    def __init__(self, *args, row, **kwargs):
        super().__init__(*args, **kwargs)
        for key, field in self.fields.items():
            if key not in ["textColor", "font", "bckgColor"]:
                field.widget = forms.CheckboxInput(
                    {'type': 'checkbox', 'id': key, 'class': 'profile-img-checkbox'})
            elif key == "textColor":
                field.widget = forms.TextInput(
                    attrs={'type': 'color', 'value': row[2]})
            elif key == "bckgColor":
                field.widget = forms.TextInput(
                    attrs={'type': 'color', 'value': row[6]})
            field.label = ""

    textColor = forms.CharField(required=False)
    bckgColor = forms.CharField(required=False)
    # font = forms.MultipleChoiceField(required=False, choices=FONT_CHOICES,
    #                                  widget=forms.Select(attrs={"class": "form-select", "style": "width: fit-content;"}))
    background_default = forms.BooleanField(required=False)
    background_space = forms.BooleanField(required=False)
    background_fade = forms.BooleanField(required=False)
    background_blosssom = forms.BooleanField(required=False)
    background_neon = forms.BooleanField(required=False)
    background_leafs = forms.BooleanField(required=False)
    background_samurai = forms.BooleanField(required=False)
    background_eclipse = forms.BooleanField(required=False)
    background_binary = forms.BooleanField(required=False)


class CCForm(forms.Form):
    def __init__(self, *args, gid, **kwargs):
        super().__init__(*args, **kwargs)
        for key, field in self.fields.items():
            field.widget = forms.TextInput(
                {'class': 'form-dark form-control', 'placeholder': ''})
            field.label = ""

    name = forms.CharField(required=True, max_length=6)
    output = forms.CharField(required=True, max_length=40)
