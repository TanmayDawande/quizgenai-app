from django.shortcuts import render, HttpResponse

def index(requests):
    return render(requests, 'index.html')
    # return HttpResponse("This is a homepage")
def about(requests):
    return HttpResponse("This is made by tanmay")
def description(requests):
    return render(requests, 'description.html')
