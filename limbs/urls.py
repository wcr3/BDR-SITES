from django.urls import path
from django.views import generic

from .models import Item

from . import views

app_name = 'limbs'
urlpatterns = [
    path('', generic.ListView.as_view(model=Item, template_name='limbs/index.html'), name='index'),
    path('item_table/<str:search>', views.item_table, name='item_table'),
    path('item_popup/<int:pk>', generic.DetailView.as_view(model=Item, template_name = 'limbs/item_popup.html'), name='item_popup'),
    path('create_item', views.create_item, name='create_item'), 
    path('edit_item/<int:pk>', views.edit_item, name='edit_item')
]
