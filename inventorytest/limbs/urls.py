from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('itemforms', views.items_create_view, name = 'item_create_view'), 
    path('modalforms', views.modal_create_view, name = 'modal_create_view'),
    path('add_view',views.add_view, name = 'add_view'),
    path('delete_view/<int:id>',views.delete_view, name = 'delete_view'),
    path('update_view/<int:id>',views.update_view, name = 'update_view')

]