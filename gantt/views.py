from django.views.generic import TemplateView
from django.shortcuts import render

def gantt(request):
    return render(request,'gantt.html')
# class Application(TemplateView):
#     template_name = 'contact.html'



