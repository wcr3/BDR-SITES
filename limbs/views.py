from django.shortcuts import render
from django.http import HttpResponseRedirect
import random
# Create your views here.
from .models import Item, Manufacturer, ItemSupplier, Supplier, ItemQuantity, Location, Tag

def parse_form_create_item(form_data, item_id=None):
        print(form_data)
        print(form_data.keys())
        #make new item
        temp_item = Item(
            name=form_data["item_name"],
            part_number=form_data["part_number"],
            manufacturer=Manufacturer.objects.get(name__iexact=form_data["manufacturer_name"]) #search by name
        )
        #add id 
        if item_id:
            temp_item.id = item_id
        #save the item
        temp_item.save()

        #for supplier and location table determine max id...
        supplier_max_id = -1 
        location_max_id = -1
        tag_max_id = -1 
        for key in form_data.keys():
            if "supplier_name_" in key:
                supplier_max_id = max(supplier_max_id, int(key[-1]))
            if "location_name_" in key:
                location_max_id = max(location_max_id, int(key[-1]))
            if "tag_name_" in key:
                tag_max_id = max(tag_max_id, int(key[-1]))

        #populating the through fields for suppliers
        for i in range(1, supplier_max_id+1):

            key_a = "supplier_name_"+str(i)
            key_b = "supplier_partno_"+str(i)
            key_c = "supplier_link_"+str(i)
            key_d = "supplier_cost_"+str(i)

            if key_a not in form_data: continue

            item_sup = ItemSupplier(
                item = temp_item,
                supplier = Supplier.objects.get(name__iexact=form_data[key_a]), #search by name
                supplier_part_number = form_data[key_b],
                link = form_data[key_c],
                cost = "{:.2f}".format(float(form_data[key_d])),
            )
            print(item_sup)
            item_sup.save()

        #populating the through fields for locations
        for i in range(1, location_max_id+1):
            key_e = "location_name_"+str(i)
            key_f = "location_quantity_"+str(i)

            if key_e not in form_data: continue

            item_quant = ItemQuantity(
                item = temp_item,
                location = Location.objects.get(name__iexact=form_data[key_e]),
                quantity = form_data[key_f],
            )
            print(item_quant)
            item_quant.save()

        for i in range(1, tag_max_id+1):
            key_g = "tag_name_" + str(i)

            if key_g not in form_data: continue

            limbs_tag = Tag.objects.get(name__iexact=form_data[key_g])

            temp_item.tags.add(limbs_tag)        

def item_table(request, search):
    item_list = Item.objects
    print("Hello")
    print(item_list)
    return render(request, 'limbs/item_table.html', {'item_list': item_list})

def item_popup(request, pk):
    item = Item.objects.get(id=pk)
    print(item)
    manufacturers = Manufacturer.objects.all
    suppliers = Supplier.objects.all 
    locations = Location.objects.all
    tags = Tag.objects.all
    return render(request, 
    'limbs/item_popup.html', 
    {"item":item,
    "manufacturers":manufacturers, 
    "suppliers":suppliers, 
    "locations":locations,
    "tags":tags})

def edit_item(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Item.objects.filter(id=pk).delete()

        #make new item with same id 
        if "Edit" in form_data.keys():
            parse_form_create_item(form_data, item_id=pk)

    #redirect to home page
    return HttpResponseRedirect('/limbs')

def create_item(request):
    if request.method == 'POST':

        form_data = request.POST

        print(form_data)

        #make new item
        parse_form_create_item(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs')
    else:
        manufacturers = Manufacturer.objects.all
        suppliers = Supplier.objects.all 
        locations = Location.objects.all
        tags = Tag.objects.all
        return render(request, 
        'limbs/create_item.html', 
        {"manufacturers":manufacturers, 
        "suppliers":suppliers, 
        "locations":locations,
        "tags":tags})

# Pulls suppliers from DB to display in supplier_table.html
def supplier_table(request):
    supplier_list = Supplier.objects.all()
    return render(request, 'limbs/supplier_table.html', {'supplier_list': supplier_list})

def supplier_popup(request, pk):

    supplier = Supplier.objects.get(id=pk)
    print(supplier)
    return render(request, 
    'limbs/supplier_popup.html', {"supplier": supplier})

def edit_supplier(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Supplier.objects.filter(id=pk).delete()

        #make new item with same id 
        if "Edit" in form_data.keys():
            parse_form_create_supplier(form_data, supplier_id=pk)

    #redirect to home page
    return HttpResponseRedirect('/limbs/supplier_list')

def create_supplier(request):

    if request.method == 'POST':

        form_data = request.POST

        print(form_data)

        #make new supplier
        parse_form_create_supplier(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs/supplier_list')
    else:
        return render(request, 
        'limbs/create_supplier.html')

def parse_form_create_supplier(form_data, supplier_id=None):

        temp_supplier = Supplier(
            name=form_data["supplier_name"],
            link=form_data["supplier_link"],
        )

        if supplier_id:
            temp_supplier.id = supplier_id

        #save the item
        temp_supplier.save()

def location_table(request):
    location_list = Location.objects.all()
    return render(request, 'limbs/location_table.html', {'location_list':location_list})

def location_popup(request, pk):

    location = Location.objects.get(id=pk)
    locations = Locations.objects.all
    return render(request, 
    'limbs/location_popup.html', {
        'location': location, "locations": locations
    })

def create_location(request):

    if request.method == 'POST':

        form_data = request.POST

        print(form_data)

        #make new supplier
        parse_form_create_location(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs/location_list')
    else:
        locations = Location.objects.all
        return render(request, 
        'limbs/create_location.html', {"locations":locations})

def parse_form_create_location(form_data, location_id=None):

    temp_location = Location(
        name=form_data["location_name"],
        # parent=form_data["location_parent"],
    )

    if location_id:
        temp_location.id = location_id

    #save the item
    temp_location.save()

def edit_location(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Location.objects.filter(id=pk).delete()

        #make new item with same id 
        if "Edit" in form_data.keys():
            parse_form_create_location(form_data, location_id=pk)

    #redirect to home page
    return HttpResponseRedirect('/limbs/location_list')