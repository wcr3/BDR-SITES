from django.db import models

# Create your models here.
"""
Go here to see schema: https://docs.google.com/document/d/1K5ANMVTaG2ILGv1YXUcDzpnA3u7UjgyyiSCkXMwjlK8/edit
"""
 
class Suppliers(models.Model):
   name = models.CharField(max_length=200)
   url = models.CharField(max_length=200)
   def __str__(self):
       return self.name
 
class Items(models.Model):
   name = models.CharField(max_length=200)
   supplier_id = models.ForeignKey(Suppliers, on_delete=models.SET_NULL, null=True)
   part_number = models.CharField(max_length=200)
   url = models.CharField(default=None,max_length=200)
   description = models.CharField(max_length=400)
   comment = models.CharField(max_length=400)
   def __str__(self):
       return self.name
 
class Locations(models.Model):
   name = models.CharField(max_length=200)
   parent_id = models.ForeignKey('self', on_delete=models.CASCADE, null=True)
 
class Tags(models.Model):
   name = models.CharField(max_length=200)
 
class ItemTags(models.Model):
   item_id = models.ForeignKey(Items, on_delete=models.CASCADE)
   tag_id = models.ForeignKey(Tags, on_delete=models.CASCADE)
 
class Quantities(models.Model):
   item_id = models.ForeignKey(Items, on_delete=models.CASCADE)
   location_id = models.ForeignKey(Locations, on_delete=models.CASCADE)
   quantity = models.IntegerField()
