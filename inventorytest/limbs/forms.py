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
        widgets = {
            'name': forms.TextInput(attrs={'class':"form-control" , 'type':"text", 'placeholder':"name", 'width':"50%"}),
            'supplier_id': forms.Select(attrs = {'class':"form-control"}),
            'part_number': forms.TextInput(attrs={'class':"form-control" , 'type':"text", 'placeholder':"partnumber", 'width':"50%"}),
            'url': forms.TextInput(attrs={'class':"form-control" , 'type':"text", 'placeholder':"url", 'width':"50%"}),
            'description': forms.TextInput(attrs={'class':"form-control" , 'type':"text", 'placeholder':"description", 'width':"50%"}),
            'comment': forms.TextInput(attrs={'class':"form-control" , 'type':"text", 'placeholder':"comment", 'width':"50%"})
        }