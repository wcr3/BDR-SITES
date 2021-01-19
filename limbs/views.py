from django.shortcuts import render
from django.http import HttpResponseRedirect
import random
# Create your views here.
from .models import Item, Manufacturer, ItemSupplier, Supplier, ItemQuantity, Location

def parse_form_create_item(form_data):
        #make new item
        temp_item = Item(
            name=form_data["item_name"],
            part_number=form_data["part_number"],
            manufacturer=Manufacturer.objects.get(name__iexact=form_data["manufacturer_name"]) #search by name
        )
        #TODO add stuff for tags

        #save the just made item
        temp_item.save()

        #populating the through fields for suppliers
        key_id = 1
        while True:
            key_a = "supplier_name_"+str(key_id)
            if key_a not in form_data:
                break
            print("key a \n\n\n" + key_a);
            key_b = "supplier_partno_"+str(key_id)
            key_c = "supplier_link_"+str(key_id)
            key_d = "supplier_cost_"+str(key_id)

            item_sup = ItemSupplier(
                item = temp_item,
                supplier = Supplier.objects.get(name__iexact=form_data[key_a]), #search by name
                supplier_part_number = form_data[key_b],
                link = form_data[key_c],
                cost = "{:.2f}".format(float(form_data[key_d])),
            )
            item_sup.save()
            key_id+=1

        #TODO add for item locations
        key_id = 1
        print(form_data)
        while True:
            key_e = "location_name_"+str(key_id)
            if key_e not in form_data:
                break
            key_f = "location_quantity_"+str(key_id)
            item_quant = ItemQuantity(
                item = temp_item,
                location = Location.objects.get(name__iexact=form_data[key_e]),
                quantity = form_data[key_f],
            )
            item_quant.save()
            key_id +=1

def item_table(request, search):
    item_list = Item.objects
    return render(request, 'limbs/item_table.html', {'item_list': item_list})

def edit_item(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Item.objects.filter(id=pk).delete()

        #make new item
        if "Edit" in form_data.keys():
            parse_form_create_item(form_data)

    #redirect to home page
    return HttpResponseRedirect('/limbs')

def create_item(request):
    if request.method == 'POST':

        form_data = request.POST

        #make new item
        parse_form_create_item(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs')
    else:
        return render(request, 'limbs/create_item.html', {})
