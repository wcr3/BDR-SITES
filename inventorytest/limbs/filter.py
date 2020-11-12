import django_filters

from .models import *
from django_filters import CharFilter

class ItemsFilter(django_filters.FilterSet):
    name = CharFilter(field_name = 'name', lookup_expr = 'icontains')
    class Meta:
        model = Items
        fields = '__all__'
