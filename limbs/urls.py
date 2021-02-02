from django.urls import path
from django.views import generic

from .models import Item, Supplier, Location

from . import views

app_name = 'limbs'
urlpatterns = [
    path('', generic.ListView.as_view(model=Item, template_name='limbs/index.html'), name='index'),
    path('supplier_list', generic.ListView.as_view(model=Supplier, template_name='limbs/suppliers.html'), name="supplier_table"),
    path('location_list', generic.ListView.as_view(model=Location, template_name="limbs/locations.html"), name="location_table"),
    # path('supplier_list', views.supplier_table, name='supplier_table'),
    # path('location_list', views.location_table, name='location_table'),
    # path('item_table/<str:search>', views.item_table, name='item_table'),
    # path('supplier_table', views.supplier_table, name='supplier_table'),
    path('item_popup/<int:pk>', views.item_popup, name='item_popup'),
    path('supplier_popup/<int:pk>', views.supplier_popup, name='supplier_popup'),
    path('location_popup/<int:pk>', views.location_popup, name='location_popup'),
    path('create_item', views.create_item, name='create_item'),
    path('create_supplier', views.create_supplier, name='create_supplier'),
    path('create_location', views.create_location, name='create_location'),
    path('edit_item/<int:pk>', views.edit_item, name='edit_item'),
    path('edit_supplier/<int:pk>', views.edit_supplier, name='edit_supplier'),
    path('edit_location/<int:pk>', views.edit_location, name='edit_location')
]
