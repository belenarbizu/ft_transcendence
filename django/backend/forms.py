from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser

class RegistrationForm(UserCreationForm):

    email = forms.EmailField(
        required=True
    )

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password1", "password2",
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