from django.urls import path
from django.views import generic

from .models import Item

from . import views

app_name = 'limbs'
urlpatterns = [
    path('', views.item_search, name='item_search'),
    path('item_popup/<int:pk>', views.item_popup, name='item_popup'),
    path('create_item', views.create_item, name='create_item'), 
    path('edit_item/<int:pk>', views.edit_item, name='edit_item'),
    path('upload_excel', views.upload_excel, name='upload_excel')
]
