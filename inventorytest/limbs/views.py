from django.shortcuts import (get_object_or_404, 
                              render,  
                              HttpResponseRedirect) 
# Create your views here.
from django.http import HttpResponse
from django.template import loader
from .forms import ItemsForm
from .models import Items


def index(request):
    item_list = Items.objects.order_by('name')
    template = loader.get_template('limbs/index.html')
    context = {
        'item_list': item_list
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
    form = ItemsForm()
    item_list = Items.objects.order_by('name')
    template = loader.get_template('limbs/modaltrial.html')
    print("gets here?")
    print(request.POST)
    if 'add' in request.POST:   
        form = ItemsForm(request.POST)
        if form.is_valid():
            t = form.save()
        else:
            form = ItemsForm()
    elif 'update' in request.POST:
        print("update")
    elif 'delete' in request.POST:
        obj = get_object_or_404(Items, name = request.POST.get("name")) 
        obj.delete()
    context = {
        'form': form,
        'item_list': item_list 
    }
    return HttpResponse(template.render(context,request))


def delete_view(request, id):
    print("gets here from delete request")
    if request.method == "DELETE": 
        try:
            item = Items.objects.get(name = id)
        except Item.DoesNotExist: 
            return redirect('/limbs')
        item.delete()
    redirect('/limbs')

class MyFormViews: 

    def get(self, request, *args, **kwargs):
        form = ItemsForm(request.POST)
        item_list = Items.objects.order_by('name')
        template = loader.get_template('limbs/modaltrial.html')
        return HttpResponse(template.render(context,request))

        
    def post(self, request, *args, **kwargs):
        form = ItemsForm(request.POST)
        if 'add' in request.POST:
            print("gets in to the addition")
            if form.is_valid():
                t = form.save()
            else:
                form = ItemsForm()
        elif 'update' in request.POST:
            print("it should update")
        elif 'delete' in request.POST:
            print("it should delete it")
        context = {}
        return HttpResponse(template.render(context,request))

    

        


        

