from django.conf.urls import url
from . import views

urlpatterns = [
    url(
        regex=r'^loadFile/$',
        view=views.LoadFile.as_view(),
        name='file'
    ),
    url(
        regex=r'^extractFeatures/$',
        view=views.ExtractFeatures.as_view(),
        name='extractFeatures'
    ),
    url(
        regex=r'^calImbalanceScore/$',
        view=views.CalImbalanceScore.as_view(),
        name = 'calImbalanceScore'
    ),
    url(
        regex=r'^calEllipseParams/$',
        view=views.CalEllipseParams.as_view(),
        name='calEllipseParams'
    ),
    url(
        regex=r'^calRegression/$',
        view=views.CalRegression.as_view(),
        name = 'calRegression'
    ),
    url(
        regex=r'^calDiscByRegression/$',
        view=views.CalDiscByRegression.as_view(),
        name='calDiscByRegression'
    ),
    url(
        regex=r'^autoPartition/$',
        view=views.AutoPartition.as_view(),
        name='autoPartition'
    ),
]