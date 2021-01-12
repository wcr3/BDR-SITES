from django.contrib import admin

from .models import Item, Supplier, Manufacturer, Tag, Location, ItemSupplier, ItemQuantity
# Register your models here.

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    search_fields = ['name', 'part_number', 'tags__name']
    autocomplete_fields = ['manufacturer', 'tags']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    search_fields = ['name']
    autocomplete_fields = ['parent']

@admin.register(ItemSupplier)
class ItemSupplierAdmin(admin.ModelAdmin):
    autocomplete_fields = ['item', 'supplier']

@admin.register(ItemQuantity)
class ItemQuantityAdmin(admin.ModelAdmin):
    autocomplete_fields = ['item', 'location']

@admin.register(Tag, Manufacturer, Supplier)
class NameSearchAdmin(admin.ModelAdmin):
    search_fields = ['name']
