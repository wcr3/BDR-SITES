from django.urls import path
from django.views import generic

from .models import Item, Supplier, Location, Tag, Manufacturer

from . import views

app_name = 'limbs'
urlpatterns = [
    path('', views.item_search, name='item_search'),
    path('item_popup/<int:pk>', views.item_popup, name='item_popup'),
    path('create_item', views.create_item, name='create_item'),
    path('edit_item/<int:pk>', views.edit_item, name='edit_item'),
    path('upload_excel', views.upload_excel, name='upload_excel'),
    path('create_bulk_items', views.create_bulk_items, name = 'create_bulk_items'),
    
    path('supplier_list', generic.ListView.as_view(model=Supplier, template_name='limbs/suppliers.html'), name="supplier_table"),
    path('location_list', generic.ListView.as_view(model=Location, template_name="limbs/locations.html"), name="location_table"),
    path('tag_list', generic.ListView.as_view(model=Tag, template_name="limbs/tags.html"), name="tag_table"),
    path('manufacturer_list', generic.ListView.as_view(model=Manufacturer, template_name="limbs/manufacturers.html"), name="manufacturer_table"),
    
    path('supplier_popup/<int:pk>', views.supplier_popup, name='supplier_popup'),
    path('location_popup/<int:pk>', views.location_popup, name='location_popup'),
    path('tag_popup/<int:pk>', views.tag_popup, name='tag_popup'),
    path('manufacturer_popup/<int:pk>', views.manufacturer_popup, name='manufacturer_popup'),
    
    path('create_supplier', views.create_supplier, name='create_supplier'),
    path('create_location', views.create_location, name='create_location'),
    path('create_tag', views.create_tag, name='create_tag'),
    path('create_manufacturer', views.create_manufacturer, name='create_manufacturer'),
    
    path('edit_supplier/<int:pk>', views.edit_supplier, name='edit_supplier'),
    path('edit_location/<int:pk>', views.edit_location, name='edit_location'),
    path('edit_tag/<int:pk>', views.edit_tag, name='edit_tag'),
    path('edit_manufacturer/<int:pk>', views.edit_manufacturer, name='edit_manufacturer'),
    
    path('orders', views.orders_page, name="orders_page"),
    path('create_order', views.create_order, name='create_order'),
    path('order_popup/<int:pk>', views.order_popup, name='order_popup'),
    path('edit_order/<int:pk>', views.edit_order, name='edit_order'),
    path('add_item_order/<int:pk>', views.add_item_order, name='add_item_order'),
]
