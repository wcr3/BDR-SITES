from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('itemforms', views.items_create_view, name = 'item_create_view'), 
]