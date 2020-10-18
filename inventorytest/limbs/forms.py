from django import forms 
from .models import Items 

class ItemsForm(forms.ModelForm):
    class Meta:
        model = Items
        fields = [
            'name',
            'supplier_id',
            'part_number',
            'url',
            'description',
            'comment'
        ] 