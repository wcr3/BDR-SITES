from django.shortcuts import render
from django.http import HttpResponseRedirect
import random
# Create your views here.
from .models import Item, Manufacturer, ItemSupplier, Supplier, ItemQuantity, Location, Tag
from django.db.models import Q 
import openpyxl


def upload_excel(request):
    """
    source: https://pythoncircle.com/post/591/how-to-upload-and-process-the-excel-file-in-django/
    """
    excel_file = request.FILES["excel_file"]
    # you may put validations here to check extension or file size
    wb = openpyxl.load_workbook(excel_file)
    # getting a particular sheet by name out of many sheets
    sheets = wb.sheetnames
    worksheet = wb["Sheet1"]
    excel_data = []
    #example going through excel document 
    for row in worksheet.iter_rows():
        row_data = []
        for cell in row:
            row_data.append(str(cell.value))
        excel_data.append(row_data)

    #TODO Actually populate "items_to_create" with excel data 
   
    items_to_create = [] #list of dictionary where each dictionary specifies an item
    
    sample_item = {
        "name":"item",
        "part_number":0,
        "manufacturer": "Digikey",
        "quantity_info":[
            {"location":"location A", "quantity": 5},
            {"location":"location B", "quantity": 3},
        ]
    }
    #just add the same item 4 times...
    for i in range(0, 4):
        items_to_create.append(sample_item)

    manufacturers = Manufacturer.objects.all
    suppliers = Supplier.objects.all 
    locations = Location.objects.all 

    return render(request, 
        'limbs/sample_bulk_add.html', 
        {"items_to_create":items_to_create,
        "manufacturers":manufacturers,
        "suppliers":suppliers,
        "locations":locations})




def item_search(request):
    model = Item 
    item_list = Item.objects.all()
    results_searched = False

    if request.method == "GET":
        form_data = request.GET
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


    manufacturers = Manufacturer.objects.all 
    locations = Location.objects.all 
    tags = Tag.objects.all 

    return render(request, 
        'limbs/index.html', 
        {"item_list":item_list,
        "results_searched":results_searched, 
        "manufacturers":manufacturers, 
        "locations":locations,
        "tags":tags,
        })

def parse_form_create_item(form_data, item_id=None):
        #make new item
        temp_item = Item(
            name=form_data["item_name"],
            part_number=form_data["part_number"],
            manufacturer=Manufacturer.objects.get(name__iexact=form_data["manufacturer_name"]) #search by name
        )
        #TODO add stuff for tags

        #add id 
        if item_id:
            temp_item.id = item_id
        #save the item
        temp_item.save()

        #for supplier and location table determine max id...
        supplier_max_id = -1 
        location_max_id = -1 
        for key in form_data.keys():
            if "supplier_name_" in key:
                supplier_max_id = max(supplier_max_id, int(key[-1]))
            if "location_name_" in key:
                location_max_id = max(location_max_id, int(key[-1]))

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

            item_quant = ItemQuantity(
                item = temp_item,
                location = Location.objects.get(id=form_data[key_g]),
                quantity = form_data[key_f],
            )
            item_quant.save()


def item_table(request, search):
    item_list = Item.objects
    return render(request, 'limbs/item_table.html', {'item_list': item_list})

def item_popup(request, pk):
    item = Item.objects.get(id=pk)
    manufacturers = Manufacturer.objects.all
    suppliers = Supplier.objects.all 
    locations = Location.objects.all 
    return render(request, 
    'limbs/item_popup.html', 
    {"item":item,
    "manufacturers":manufacturers, 
    "suppliers":suppliers, 
    "locations":locations})


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
        return render(request, 
        'limbs/create_item.html', 
        {"manufacturers":manufacturers, 
        "suppliers":suppliers, 
        "locations":locations})
