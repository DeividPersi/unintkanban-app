from django.db import models
from django.contrib.auth.models import User


class Board(models.Model):
    VISIBILITY_CHOICES = [
        ('private', 'Private'),
        ('team', 'Team'),
        ('public', 'Public'),
    ]

    BACKGROUND_CHOICES = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('red', 'Red'),
        ('orange', 'Orange'),
        ('purple', 'Purple'),
        ('pink', 'Pink'),
        ('lime', 'Lime'),
        ('sky', 'Sky'),
        ('grey', 'Grey'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='owned_boards')
    visibility = models.CharField(
        max_length=10, choices=VISIBILITY_CHOICES, default='private')
    background_color = models.CharField(
        max_length=10, choices=BACKGROUND_CHOICES, default='blue')
    background_image = models.ImageField(
        upload_to='board_backgrounds/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class BoardMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]

    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='board_memberships')
    role = models.CharField(
        max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['board', 'user']
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.user.username} - {self.board.title} ({self.role})"


class List(models.Model):
    title = models.CharField(max_length=200)
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name='lists')
    position = models.FloatField(default=0)
    archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.title} - {self.board.title}"


class Label(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name='labels')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['name', 'board']
        ordering = ['name']

    def __str__(self):
        return f"{self.name} - {self.board.title}"


class Card(models.Model):
    COVER_COLOR_CHOICES = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('red', 'Red'),
        ('orange', 'Orange'),
        ('purple', 'Purple'),
        ('pink', 'Pink'),
        ('lime', 'Lime'),
        ('sky', 'Sky'),
        ('grey', 'Grey'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    list = models.ForeignKey(
        List, on_delete=models.CASCADE, related_name='cards')
    position = models.FloatField(default=0)
    labels = models.ManyToManyField(Label, blank=True, related_name='cards')
    due_date = models.DateTimeField(null=True, blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    archived = models.BooleanField(default=False)
    cover_color = models.CharField(
        max_length=10, choices=COVER_COLOR_CHOICES, null=True, blank=True)
    cover_image = models.ImageField(
        upload_to='card_covers/', null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_cards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.title} - {self.list.title}"


class Comment(models.Model):
    content = models.TextField()
    card = models.ForeignKey(
        Card, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author.username} - {self.card.title}"


class CommentReaction(models.Model):
    EMOJI_CHOICES = [
        ('👍', 'Thumbs Up'),
        ('👎', 'Thumbs Down'),
        ('❤️', 'Heart'),
        ('😂', 'Laughing'),
        ('😮', 'Surprised'),
        ('😢', 'Crying'),
        ('😡', 'Angry'),
        ('🎉', 'Party'),
        ('🔥', 'Fire'),
        ('💯', '100'),
    ]

    comment = models.ForeignKey(
        Comment, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='comment_reactions')
    emoji = models.CharField(max_length=2, choices=EMOJI_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['comment', 'user', 'emoji']
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} - {self.emoji} - {self.comment.content[:20]}"


class Checklist(models.Model):
    title = models.CharField(max_length=200)
    card = models.ForeignKey(
        Card, on_delete=models.CASCADE, related_name='checklists')
    position = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.title} - {self.card.title}"


class ChecklistItem(models.Model):
    text = models.CharField(max_length=500)
    checklist = models.ForeignKey(
        Checklist, on_delete=models.CASCADE, related_name='items')
    completed = models.BooleanField(default=False)
    position = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.text} - {self.checklist.title}"


class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/%Y/%m/%d/')
    name = models.CharField(max_length=255)
    size = models.BigIntegerField()
    content_type = models.CharField(max_length=100)
    card = models.ForeignKey(
        Card, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='uploaded_attachments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.card.title}"

    def get_file_size_display(self):
        """Return human readable file size"""
        size = self.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


class CustomField(models.Model):
    FIELD_TYPE_CHOICES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('checkbox', 'Checkbox'),
        ('dropdown', 'Dropdown'),
    ]

    name = models.CharField(max_length=100)
    field_type = models.CharField(max_length=20, choices=FIELD_TYPE_CHOICES)
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name='custom_fields')
    options = models.JSONField(
        default=list, blank=True)  # For dropdown options
    required = models.BooleanField(default=False)
    position = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"{self.name} - {self.board.title}"


class CustomFieldValue(models.Model):
    custom_field = models.ForeignKey(
        CustomField, on_delete=models.CASCADE, related_name='values')
    card = models.ForeignKey(
        Card, on_delete=models.CASCADE, related_name='custom_field_values')
    value = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['custom_field', 'card']

    def __str__(self):
        return f"{self.custom_field.name}: {self.value}"


class BoardTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    board_data = models.JSONField()  # Serialized board structure
    is_public = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='created_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
