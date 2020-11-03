from django.shortcuts import redirect, render

# Create your views here.
from django.http import HttpResponse
from django.template import loader
from .forms import ItemsForm
from .models import Items


def index(request):
    item_list = Items.objects.order_by('name')
    form = ItemsForm()
    template = loader.get_template('limbs/index.html')
    context = {
        'item_list': item_list,
        'form': form
    }
    return HttpResponse(template.render(context,request))

def items_create_view(request): 
    form = ItemsForm(request.POST)
    template = loader.get_template('limbs/formtrial.html')
    if form.is_valid():
        form.save()
        print("form was saved") 
    else:
        print("form was not validated")
        form = ItemsForm()
    context = {
        'form': form
    }
    return HttpResponse(template.render(context,request))
    
def modal_create_view(request):
    form = ItemsForm(request.POST)
    template = loader.get_template('limbs/modaltrial.html')
    print(request.POST)
    
    if form.is_valid():
        form.save()
        print("form was saved") 
    else:
        print("form was not validated")
        form = ItemsForm()
    context = {
        'form': form
    }
    return HttpResponse(template.render(context,request))

def delete_view(request, id):
    item = Items.objects.get(id=id)
    item.delete()
    return redirect('/limbs')

# def item_create_form(request, id):
#     item = Items.objects.get(id=id)
