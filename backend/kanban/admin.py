from django.contrib import admin
from .models import (
    Board, BoardMember, List, Card, Label, Comment, CommentReaction,
    Checklist, ChecklistItem, Attachment, CustomField, CustomFieldValue, BoardTemplate
)


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'created_at']
    list_filter = ['created_at', 'owner']
    search_fields = ['title', 'description']


@admin.register(BoardMember)
class BoardMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'board', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['user__username', 'board__title']


@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ['title', 'board', 'position', 'created_at']
    list_filter = ['board', 'created_at']
    search_fields = ['title']


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ['title', 'list', 'created_by', 'position', 'created_at']
    list_filter = ['list__board', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'board', 'created_at']
    list_filter = ['board', 'created_at']
    search_fields = ['name']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'card', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']


@admin.register(CommentReaction)
class CommentReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'comment', 'emoji', 'created_at']
    list_filter = ['emoji', 'created_at']
    search_fields = ['user__username']


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['title', 'card', 'position', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title']


@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['text', 'checklist', 'completed', 'position', 'created_at']
    list_filter = ['completed', 'created_at']
    search_fields = ['text']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'card', 'uploaded_by', 'size', 'created_at']
    list_filter = ['created_at', 'content_type']
    search_fields = ['name']


@admin.register(CustomField)
class CustomFieldAdmin(admin.ModelAdmin):
    list_display = ['name', 'field_type', 'board',
                    'required', 'position', 'created_at']
    list_filter = ['field_type', 'required', 'created_at']
    search_fields = ['name']


@admin.register(CustomFieldValue)
class CustomFieldValueAdmin(admin.ModelAdmin):
    list_display = ['custom_field', 'card', 'value', 'created_at']
    list_filter = ['created_at']
    search_fields = ['value']


@admin.register(BoardTemplate)
class BoardTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description']
