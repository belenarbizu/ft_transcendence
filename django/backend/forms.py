from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
import transcendence.settings as settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_username(value):
    if value.endswith(settings.LOGIN_42_SUFFIX):
        raise ValidationError(_("Invalid username"), params={
            "value": value
        })

class RegistrationForm(UserCreationForm):

    username = forms.CharField(
        required=True,
        validators=[validate_username]
    )
    
    class Meta:
        model = CustomUser
        fields = ["username", "password1", "password2",
                  "preferred_language"]

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_default_picture()
        if commit:
            user.save()
        return user
    

class EditProfileForm(forms.ModelForm):

    class Meta:
        model = CustomUser
        fields = ["bio", "preferred_language", "picture"]