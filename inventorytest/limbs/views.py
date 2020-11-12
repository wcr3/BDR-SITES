from django.shortcuts import redirect, render

# Create your views here.
from django.http import HttpResponse
from django.template import loader
from .forms import ItemsForm
from .models import Items
from django.db.models import Q 
import json

def index(request):
    item_list = Items.objects.order_by('name')
    form = ItemsForm()
    template = loader.get_template('limbs/index.html')
    context = {
        'item_list': item_list,
        'form': form
    }
    return HttpResponse(template.render(context,request))

def add_view(request):
    form = ItemsForm(request.POST)
    if form.is_valid():
        t = form.save()
    else:
        print("form is not validated")
    return redirect('/limbs')

def delete_view(request, id):
    item = Items.objects.get(id=id)
    item.delete()
    return redirect('/limbs')

def update_view(request, id):
    item = Items.objects.get(id=id)
    form = ItemsForm(request.POST, instance = item) 
    if form.is_valid(): 
        form.save() 
    else: 
        print(form.errors)
    return redirect('/limbs')

def search_view(request):
    item_list = Items.objects.order_by('name')
    template = loader.get_template('limbs/search.html')
    context = {
        'item_list': item_list
    }
    return HttpResponse(template.render(context,request))

def search(request):
    if request.is_ajax():
        q = request.GET.get('q')
        if q is not None:            
            results = Items.objects.filter(  
            	Q( name__contains = q ))          
            return render_to_response('results.html', {'results': results}, 
                                       context_instance = RequestContext(request))
