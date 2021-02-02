"""
Schema Here: https://docs.google.com/document/d/1K5ANMVTaG2ILGv1YXUcDzpnA3u7UjgyyiSCkXMwjlK8/edit
"""
from django.db import models

# Create your models here.

class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True)
    link = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class Manufacturer(models.Model):
    name = models.CharField(max_length=255, unique=True)
    link = models.URLField(max_length=255, blank=True)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name

class Location(models.Model):
    name = models.CharField(max_length=255)
    # in the future I think on_delete should set to the grandparent - unsure how
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, blank=True, null=True)

    def __str__(self):
        return self.name

class Item(models.Model):
    name = models.CharField(max_length=255)
    part_number = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    comment = models.TextField(blank=True)
    # unsure of the PROTECT here.  Would we ever need to delete a Manufacturer?
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.PROTECT)
    suppliers = models.ManyToManyField(Supplier, through='ItemSupplier')
    quantities = models.ManyToManyField(Location, through='ItemQuantity')
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return self.name

class ItemSupplier(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    supplier_part_number = models.CharField(max_length=255, blank=True)
    link = models.URLField(max_length=255, blank=True)
    cost = models.DecimalField(max_digits=8, decimal_places=2)

class ItemQuantity(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    class Meta:
        constraints = [
            # unsure this is necessary
            models.UniqueConstraint(fields=['item', 'location'], name='unique_location_quantity')
        ]