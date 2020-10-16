from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse
from django.template import loader

from .models import Items


def index(request):
    item_list = Items.objects.order_by('name')
    template = loader.get_template('limbs/index.html')
    context = {
        'item_list': item_list
    }
    return HttpResponse(template.render(context,request))