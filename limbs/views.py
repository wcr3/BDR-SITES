from django.shortcuts import render

# Create your views here.
from .models import Item

def item_table(request, search):
    item_list = Item.objects
    return render(request, 'limbs/item_table.html', {'item_list': item_list})
