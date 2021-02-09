from django.shortcuts import render
from django.http import HttpResponseRedirect
import random
# Create your views here.
from .models import Item, Manufacturer, ItemSupplier, Supplier, ItemQuantity, Location
from django.db.models import Q 
import openpyxl


def upload_excel(request):
    """
    source: https://pythoncircle.com/post/591/how-to-upload-and-process-the-excel-file-in-django/
    should standarize this
    """
    excel_file = request.FILES["excel_file"]
    # you may put validations here to check extension or file size
    wb = openpyxl.load_workbook(excel_file)
    # getting a particular sheet by name out of many sheets
    sheets = wb.sheetnames
    print(sheets)

    worksheet = wb["Sheet1"]
    print(worksheet)

    excel_data = []
    # iterating over the rows and
    # getting value from each cell in row
    for row in worksheet.iter_rows():
        row_data = []
        for cell in row:
            row_data.append(str(cell.value))
        excel_data.append(row_data)

    print(excel_data)

    return HttpResponseRedirect('/limbs')


def item_search(request):
    model = Item 
    item_list = Item.objects.all()
    name = None
    part_no = None 
    manuf = None 
    if request.method == "GET":
        print(request.GET)
        print("WOOHOOO!")
        form_data = request.GET
        if len(form_data) > 1:
            name = form_data["item_name"]
            part_no = form_data["item_part_no"]
            manuf = form_data["item_manufacturer"]

            if name == "" and part_no == "" and manuf == "": #just pressed serach bar
                item_list = Item.objects.all() 
            elif Manufacturer.objects.filter(name__iexact=manuf).count() > 0:
                manuf_obj = Manufacturer.objects.get(name__iexact=manuf)
                item_list = Item.objects.filter(
                    Q(name=name) | Q(part_number=part_no) | Q(manufacturer=manuf_obj)
                )
            else:
                item_list = Item.objects.filter(
                    Q(name=name) | Q(part_number=part_no)
                )

    return render(request, 
        'limbs/index.html', 
        {"item_list":item_list,
        "name":name,
        "part_no":part_no,
        "manuf":manuf})

def parse_form_create_item(form_data, item_id=None):
        print(form_data)
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
            key_e = "location_name_"+str(i)
            key_f = "location_quantity_"+str(i)

            if key_e not in form_data: continue

            item_quant = ItemQuantity(
                item = temp_item,
                location = Location.objects.get(name__iexact=form_data[key_e]),
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
