from django.shortcuts import render
from django.http import HttpResponseRedirect
import random
from .models import Item, Manufacturer, ItemSupplier, Supplier, ItemQuantity, Location, Tag, Order, ItemOrder
from django.db.models import Q, CharField
import openpyxl


def upload_excel(request):
    """
    source: https://pythoncircle.com/post/591/how-to-upload-and-process-the-excel-file-in-django/
    """
    excel_file = request.FILES["excel_file"]
    # you may put validations here to check extension or file size
    wb = openpyxl.load_workbook(excel_file)
    # getting a particular sheet by name out of many sheets
    ord_vect = {}
    items_to_create = []
    sheets = wb.sheetnames
    worksheet = wb["Sheet1"]
    data = tuple(worksheet.rows)
    for x in range (len(data[0])):
        ord_vect.update({data[0][x].value.lower():x})
    for x in range(len(data)):
        if(x == 0):
            continue
        q_info = []
        t_info = []
        exists_val = False
        name = data[x][ord_vect["name"]].value
        part_num = data[x][ord_vect["partnumber"]].value
        manufacturer = data[x][ord_vect["manufacturer"]].value
        manufacturer_obj = Manufacturer.objects.get(name__iexact=manufacturer)
        item_comp = Item.objects.all().filter(name=name,manufacturer=manufacturer_obj)
        if(len(item_comp)) >= 1:
            exists_val = True
        # item_comp = Item.objects.all().filter(name = )
        quantity_list = str(data[x][ord_vect["quantity"]].value).split(",")
        location_list = str(data[x][ord_vect["location"]].value).split(",")
        tag_list = str(data[x][ord_vect["tags"]].value).split(",")

        for y in range(len(quantity_list)):
            q_info.append({"location":location_list[y], "quantity": quantity_list[y]})
        for y in range(len(tag_list)):
            t_info.append(tag_list[y])
        temp_item = {
            "name": name,
            "part_number": part_num,
            "manufacturer": manufacturer,
            "quantity_info": q_info,
            "exists": exists_val,
            "tags": tag_list
        }
        items_to_create.append(temp_item)

    ##figure out the order of the sheets
    excel_data = []
    #TODO Actually populate "items_to_create" with excel data



    manufacturers = Manufacturer.objects.all
    suppliers = Supplier.objects.all
    locations = Location.objects.all
    tags = Tag.objects.all

    return render(request,
        'limbs/sample_bulk_add.html',
        {"items_to_create":items_to_create,
        "manufacturers":manufacturers,
        "suppliers":suppliers,
        "locations":locations,
        "tags":tags})

def item_search(request):
    item_list = Item.objects.all()
    results_searched = False

    if request.method == "GET":
        form_data = request.GET


        if "general_search" in form_data and form_data["general_search"] != "":
            #regular search
            results_searched = True
            search_fields = form_data["general_search"].split(" ")
            qs = Q()
            for search_field in search_fields:

                big_q = None

                def get_query_for_model(model):
                    fields = [f for f in model._meta.fields if isinstance(f, CharField)]
                    queries = [Q(**{f.name+"__icontains": search_field}) for f in fields]
                    return queries

                def retrieve_objs_for_model(model):
                    qs = Q()
                    queries = get_query_for_model(model)
                    for query in queries:
                        qs = qs | query
                    return model.objects.filter(qs)


                big_q = get_query_for_model(Item)
                big_q += [Q(manufacturer__in=retrieve_objs_for_model(Manufacturer))]
                big_q += [Q(quantities__in=retrieve_objs_for_model(Location))]
                big_q += [Q(tags__in=retrieve_objs_for_model(Tag))]
                big_q += [Q(suppliers__in=retrieve_objs_for_model(Supplier))]

                for query in big_q:
                    qs = qs | query

            item_list = Item.objects.filter(qs).distinct()


        else:
            #advanced search
            if len(form_data) > 1:

                results_searched = True
                name = form_data["item_name"]
                part_no = form_data["item_part_no"]
                manuf = form_data["item_manufacturer"]

                def get_ids_for_prefix(form_data, prefix_value):
                    lst_of_ids = []
                    for key in form_data.keys():
                        if prefix_value in key:
                            lst_of_ids.append(form_data[key])
                    return lst_of_ids

                tag_ids = get_ids_for_prefix(form_data, "tag_input_multiple_")
                location_ids = get_ids_for_prefix(form_data, "location_input_multiple_")
                supplier_ids = get_ids_for_prefix(form_data, "supplier_input_multiple_")

                if name == "" and part_no == "" and manuf == "" and len(tag_ids) == 0 and len(location_ids) == 0: #just pressed serach bar
                    item_list = Item.objects.all()

                if name != "":
                    item_list = item_list.filter(name = name)

                if manuf != "":
                    item_list = item_list.filter(manufacturer=Manufacturer.objects.get(name__iexact=manuf))

                if part_no != "":
                    item_list = item_list.filter(part_number=part_no)

                if len(tag_ids) > 0:
                    item_list = item_list.filter(tags__in=tag_ids)

                if len(location_ids) > 0:
                    item_list = item_list.filter(quantities__in=location_ids)

                if len(supplier_ids) > 0:
                    item_list = item_list.filter(suppliers__in=supplier_ids)



    manufacturers = Manufacturer.objects.all
    locations = Location.objects.all
    tags = Tag.objects.all
    suppliers = Supplier.objects.all

    return render(request,
        'limbs/index.html',
        {"item_list":item_list,
        "results_searched":results_searched,
        "manufacturers":manufacturers,
        "locations":locations,
        "suppliers":suppliers,
        "tags":tags,
        })


def get_form_max_ids(lst_of_prefix, form_data):
    final_list = []
    index = 0 
    for prefix_str in lst_of_prefix:
        final_list.append(-1)
        for key in form_data.keys():
            if prefix_str in key:
                arr = key.split(prefix_str)
                final_list[index] = max(final_list[index], int(arr[-1]))
        index += 1

    if len(final_list) == 1:
        return final_list[0]

    return tuple(final_list)

def parse_form_create_item(form_data, item_id=None, from_bulk=False):
        name = form_data["item_name"]
        manufacturer_obj = Manufacturer.objects.get(name__iexact=form_data["manufacturer_name"])
        part_number = form_data["part_number"]

        #before we create item see if it exists already...
        already_exists = False
        if (from_bulk):
            item_list = Item.objects.all().filter(name=name,manufacturer=manufacturer_obj) #IGNORE PART NUMBER
            if len(item_list) >= 1:
                temp_item = item_list[0]
                already_exists = True


        if not already_exists:
            #make new item
            temp_item = Item(
                name=name,
                part_number=part_number,
                manufacturer=manufacturer_obj
            )
            #TODO add stuff for tags

            #add id
            if item_id:
                temp_item.id = item_id
            #save the item
            temp_item.save()


        #for supplier and location table determine max id...

        # supplier_max_id = -1
        # location_max_id = -1
        # tag_max_id = -1 
        # for key in form_data.keys():
        #     if "supplier_name_" in key:
        #         supplier_max_id = max(supplier_max_id, int(key[-1]))
        #     if "location_name_" in key:
        #         location_max_id = max(location_max_id, int(key[-1]))
        #     if "tag_name_" in key:
        #         tag_max_id = max(tag_max_id, int(key[-1]))
                

        supplier_max_id, location_max_id, tag_max_id = get_form_max_ids(["supplier_name_", "location_name_", "tag_name_"], form_data)

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
            item_sup.save()

        #populating the through fields for locations
        for i in range(1, location_max_id+1):
            key_e = "location_name_"+str(i) #don't actually use this one
            key_f = "location_quantity_"+str(i)
            key_g = "id_location_name_"+str(i) #hidden field that stores the id

            if key_e not in form_data: continue

            #override if object already exists
            if from_bulk and already_exists:
                matching_locs = ItemQuantity.objects.all().filter(item=temp_item,location=Location.objects.get(id=form_data[key_g]))
                if len(matching_locs) > 0:
                    matching_locs[0].quantity += int(form_data[key_f])
                    matching_locs[0].save()
                    continue

            item_quant = ItemQuantity(
                item = temp_item,
                location = Location.objects.get(id=form_data[key_g]),
                quantity = form_data[key_f],
            )

            item_quant.save()

        for i in range(1, tag_max_id+1):
            key_g = "tag_name_" + str(i)

            if key_g not in form_data: continue

            limbs_tag = Tag.objects.get(name__iexact=form_data[key_g])

            temp_item.tags.add(limbs_tag)        

def item_table(request, search):
    item_list = Item.objects
    return render(request, 'limbs/item_table.html', {'item_list': item_list})

def item_popup(request, pk):
    item = Item.objects.get(id=pk)
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

def create_bulk_items(request):
    """
    TODO: NEED TO FIX THIS IF WE REMOVE A ROW...form data might not exist! 
    also int(key[-1]) onlt works if one digit, will fix 

    should work but we should skip in both loops if key doesn't exist since you remove! 

    NEED TO TEST THAT MY CHANGES WORK! 
    """
    if request.method == 'POST':
        #change this data
        form_data = request.POST
        location_max_id = -1
        
        # for key in form_data.keys():
        #     if "location_name_" in key:
        #         location_max_id = max(location_max_id, int(key[-1]))

        location_max_id = get_form_max_ids(["location_name_"], form_data)


        item_list = form_data.getlist('_item_name')
        part_list = form_data.getlist('_part_number')
        man_list = form_data.getlist('_manufacturer_name')
        for x in range(len(item_list)):
            sample_data = {
                'item_name':item_list[x],
                'part_number': part_list[x],
                'manufacturer_name': man_list[x],
            }
            for y in range(location_max_id):
                loc = str(x+1) + '_location_name_' + str(y+1)

                if loc not in form_data:
                    continue 

                quant = str(x+1) + '_location_quantity_'+ str(y+1)
                id = 'id_'+str(x+1) + '_location_name_'+str(y+1)
                sample_data['id_location_name_' + str(y+1)] = form_data[id]
                sample_data['location_quantity_'+str(y+1)] = form_data[quant]
                sample_data['location_name_'+str(y+1)] = form_data[loc]
            parse_form_create_item(sample_data, from_bulk=True)
        return HttpResponseRedirect('/limbs')


# Pulls suppliers from DB to display in supplier_table.html
def supplier_table(request):
    supplier_list = Supplier.objects.all()
    return render(request, 'limbs/supplier_table.html', {'supplier_list': supplier_list})

def supplier_popup(request, pk):

    supplier = Supplier.objects.get(id=pk)
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
    locations = Location.objects.all

    return render(request, 
    'limbs/location_popup.html', {
        'location': location, "locations": locations
    })

def create_location(request):

    if request.method == 'POST':

        form_data = request.POST
        #make new supplier
        parse_form_create_location(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs/location_list')
    else:
        locations = Location.objects.all
        return render(request, 
        'limbs/create_location.html', {"locations":locations})

def parse_form_create_location(form_data, location_id=None):

    if form_data["location_parent"] == '':
        temp_location = Location (
            name = form_data["location_name"]
        )
    else:
        temp_location = Location(
            name=form_data["location_name"],
            parent = Location.objects.get(name__iexact=form_data["location_parent"])
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

def tag_popup(request, pk):

    tag = Tag.objects.get(id=pk)
    return render(request, 
    'limbs/tag_popup.html', {
        'tag': tag
    })

def create_tag(request):

    if request.method == 'POST':

        form_data = request.POST
        #make new supplier
        parse_form_create_tag(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs/tag_list')
    else:
        tags = Tag.objects.all
        return render(request, 
        'limbs/create_tag.html', {"tags":tags})

def parse_form_create_tag(form_data, tag_id=None):

    temp_tag = Tag(
        name=form_data["tag_name"],
    )

    if tag_id:
        temp_tag.id = tag_id

    #save the item
    temp_tag.save()

def edit_tag(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Tag.objects.filter(id=pk).delete()

        #make new item with same id 
        if "Edit" in form_data.keys():
            parse_form_create_tag(form_data, tag_id=pk)
    
    return HttpResponseRedirect('/limbs/tag_list')

def manufacturer_popup(request, pk):

    manufacturer = Manufacturer.objects.get(id=pk)
    return render(request, 
    'limbs/manufacturer_popup.html', {
        'manufacturer': manufacturer
    })

def create_manufacturer(request):

    if request.method == 'POST':

        form_data = request.POST

        #make new supplier
        parse_form_create_manufacturer(form_data)

        #redirect to home page
        return HttpResponseRedirect('/limbs/manufacturer_list')
    else:
        manufacturers = Manufacturer.objects.all
        return render(request, 
        'limbs/create_manufacturer.html', {"manufacturers":manufacturers})

def parse_form_create_manufacturer(form_data, manufacturer_id=None):

    temp_manufacturer = Manufacturer(
        name=form_data["manufacturer_name"],
        link=form_data["manufacturer_link"]
    )

    if manufacturer_id:
        temp_manufacturer.id = manufacturer_id

    #save the item
    temp_manufacturer.save()

def edit_manufacturer(request, pk):

    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        Manufacturer.objects.filter(id=pk).delete()

        #make new item with same id 
        if "Edit" in form_data.keys():
            parse_form_create_manufacturer(form_data, manufacturer_id=pk)
    
    return HttpResponseRedirect('/limbs/manufacturer_list')

def orders_page(request):
    order_list = Order.objects.all()
    return render(request, 'limbs/orders.html', {'order_list': order_list})

def parse_form_create_order(form_data, order_id=None, created_at=None):

    print(form_data)
    temp_order = Order(
        name=form_data["order_name"],
    )
    #determine max ids 
    max_id = get_form_max_ids(["item_id_"], form_data)

    if order_id and created_at:
        temp_order.id = order_id
        temp_order.created_date = created_at

    #save the item
    temp_order.save()

    for id_val in range(1, max_id+1):
        key_item = "item_id_" + str(id_val)
        key_supp = "supplier_id_" + str(id_val)
        key_qty = "item_order_qty_" + str(id_val)

        if key_item not in form_data:
            continue 

        item_obj =  Item.objects.get(id=form_data[key_item])  
        supplier_obj = Supplier.objects.get(id= form_data[key_supp]) 
        qty = form_data[key_qty]

        temp_item_order = ItemOrder(item=item_obj, order=temp_order, quantity=qty, supplier=supplier_obj)
        temp_item_order.save() 

def create_order(request):
    if request.method == 'POST':
        form_data = request.POST
        parse_form_create_order(form_data)
        #redirect to home page
        return HttpResponseRedirect('/limbs/orders')
    else:
        return render(request, 
        'limbs/create_order.html')

def get_estimated_cost_order(pk):
    order = Order.objects.get(id=pk)
    item_orders = ItemOrder.objects.all().filter(order=order)
    total_cost = 0
    for io in item_orders:
        cost_info = ItemSupplier.objects.get(item=io.item, supplier=io.supplier)
        sub_total = cost_info.cost * io.quantity 
        total_cost += sub_total
    return total_cost

def order_popup(request, pk):
    order = Order.objects.get(id=pk)
    item_orders = ItemOrder.objects.all().filter(order=order)
    estimated_cost = get_estimated_cost_order(pk)

    return render(request, 
    'limbs/order_popup.html', {
        'order': order,
        'item_orders': item_orders, 
        'estimated_cost': estimated_cost, 
    })

def edit_order(request, pk):
    if request.method == 'POST':
        form_data = request.POST

        #delete original item
        original_order = Order.objects.get(id=pk)
        created_date = original_order.created_date
        Order.objects.filter(id=pk).delete()

        #make new item with same id and date 
        if "Edit" in form_data.keys():
            parse_form_create_order(form_data, order_id=pk, created_at=created_date)
    
    return HttpResponseRedirect('/limbs/orders')

def add_item_order(request, pk):
    if request.method == 'POST':
        form_data = request.POST
        item = Item.objects.get(id=pk)
        order = Order.objects.get(id=form_data['order_id'])
        supplier = Supplier.objects.get(id=form_data["item_order_supplier"])
        order_qty = form_data["item_order_qty"]
        new_item_order = ItemOrder(item=item, order=order, quantity=order_qty, supplier=supplier)
        new_item_order.save()
        return HttpResponseRedirect('/limbs')
    else:
        item = Item.objects.get(id=pk)
        supp_list = ItemSupplier.objects.all().filter(item=item)
        order_list = Order.objects.all().filter(completed=False)
        return render(request, 
        'limbs/add_item_order.html', {
            'item': item,
            'supp_list': supp_list,
            'order_list':order_list,  
        })

def interact_order(request, pk):

    if request.method == 'POST':
        form_data = request.POST
        print(form_data)
        if "Generate" in form_data.keys():
            #TODO excel stuff
            return HttpResponseRedirect('/limbs/orders')
        elif "Complete" in form_data.keys():
            order = Order.objects.get(id=pk)

            tmp_order_loc = Location(name="TBD, Order: " + order.name)
            tmp_order_loc.save() 
            
            item_orders = ItemOrder.objects.all().filter(order=order)
            for io in item_orders:
                new_item_qty = ItemQuantity(item=io.item, location=tmp_order_loc, quantity=io.quantity)
                new_item_qty.save() 

            order.completed = True
            order.save() 
            
            return HttpResponseRedirect('/limbs/orders')