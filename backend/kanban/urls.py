from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, BoardViewSet, ListViewSet,
    CardViewSet, LabelViewSet, CommentViewSet, CommentReactionViewSet,
    ChecklistViewSet, ChecklistItemViewSet, AttachmentViewSet,
    BoardMemberViewSet, CustomFieldViewSet, CustomFieldValueViewSet,
    BoardTemplateViewSet, CreateBoardFromTemplateView, ArchiveAllCardsView,
    ReorderListsView
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet)

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('', include(router.urls)),
    path('boards/<int:board_pk>/lists/', ListViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='board-lists'),
    path('boards/<int:board_pk>/lists/<int:pk>/', ListViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='board-list-detail'),
    path('lists/<int:list_pk>/archive-all-cards/',
         ArchiveAllCardsView.as_view(), name='list-archive-all-cards'),
    path('boards/<int:board_pk>/reorder-lists/',
         ReorderListsView.as_view(), name='reorder-lists'),
    path('boards/<int:board_pk>/labels/', LabelViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='board-labels'),
    path('boards/<int:board_pk>/labels/<int:pk>/', LabelViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='board-label-detail'),
    path('boards/<int:board_pk>/cards/', CardViewSet.as_view({
        'get': 'list'
    }), name='board-cards'),
    path('lists/<int:list_pk>/cards/', CardViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='list-cards'),
    path('lists/<int:list_pk>/cards/<int:pk>/', CardViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='list-card-detail'),
    path('cards/move/', CardViewSet.as_view({
        'post': 'move'
    }), name='card-move'),
    path('cards/<int:pk>/', CardViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='card-detail'),
    path('cards/<int:card_pk>/comments/', CommentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='card-comments'),
    path('cards/<int:card_pk>/comments/<int:pk>/', CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='card-comment-detail'),
    path('cards/<int:card_pk>/checklists/', ChecklistViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='card-checklists'),
    path('cards/<int:card_pk>/checklists/<int:pk>/', ChecklistViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='card-checklist-detail'),
    path('checklists/<int:checklist_pk>/items/', ChecklistItemViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='checklist-items'),
    path('checklists/<int:checklist_pk>/items/<int:pk>/', ChecklistItemViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='checklist-item-detail'),
    path('cards/<int:card_pk>/attachments/', AttachmentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='card-attachments'),
    path('cards/<int:card_pk>/attachments/<int:pk>/', AttachmentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='card-attachment-detail'),

    # Board Members URLs
    path('boards/<int:board_pk>/members/', BoardMemberViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='board-members'),
    path('boards/<int:board_pk>/members/<int:pk>/', BoardMemberViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='board-member-detail'),

    # Comment Reactions URLs
    path('comments/<int:comment_pk>/reactions/', CommentReactionViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='comment-reactions'),

    # Custom Fields URLs
    path('boards/<int:board_pk>/custom-fields/', CustomFieldViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='board-custom-fields'),
    path('boards/<int:board_pk>/custom-fields/<int:pk>/', CustomFieldViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='board-custom-field-detail'),

    # Custom Field Values URLs
    path('cards/<int:card_pk>/custom-field-values/', CustomFieldValueViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='card-custom-field-values'),
    path('cards/<int:card_pk>/custom-field-values/<int:pk>/', CustomFieldValueViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='card-custom-field-value-detail'),

    # Board Templates URLs
    path('templates/', BoardTemplateViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='board-templates'),
    path('templates/<int:pk>/', BoardTemplateViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='board-template-detail'),
    path('templates/<int:template_id>/create-board/',
         CreateBoardFromTemplateView.as_view(), name='board-template-create-board'),
]
