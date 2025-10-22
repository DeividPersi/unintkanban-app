from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Board, BoardMember, List, Card, Label, Comment, CommentReaction, Checklist, ChecklistItem, Attachment, CustomField, CustomFieldValue, BoardTemplate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'board', 'created_at']
        read_only_fields = ['id', 'board', 'created_at']


class CommentReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = CommentReaction
        fields = ['id', 'emoji', 'user', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    reactions = CommentReactionSerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'author',
                  'reactions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']


class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ['id', 'text', 'completed',
                  'position', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Checklist
        fields = ['id', 'title', 'card', 'position',
                  'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'card', 'created_at', 'updated_at']


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_size_display = serializers.ReadOnlyField(
        source='get_file_size_display')

    class Meta:
        model = Attachment
        fields = [
            'id', 'file', 'name', 'size', 'file_size_display', 'content_type',
            'card', 'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'card', 'name', 'size', 'content_type',
                            'uploaded_by', 'created_at', 'updated_at']

    def validate(self, data):
        print(f"DEBUG: AttachmentSerializer.validate called with data: {data}")
        print(f"DEBUG: File field present: {'file' in data}")
        if 'file' in data:
            print(f"DEBUG: File field value: {data['file']}")
        return data


class CustomFieldValueSerializer(serializers.ModelSerializer):
    custom_field = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = CustomFieldValue
        fields = ['id', 'custom_field', 'value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CardSerializer(serializers.ModelSerializer):
    labels = LabelSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    checklists = ChecklistSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    custom_field_values = CustomFieldValueSerializer(many=True, read_only=True)
    list = serializers.SerializerMethodField()
    label_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Card
        fields = [
            'id', 'title', 'description', 'list', 'position', 'archived',
            'labels', 'comments', 'checklists', 'attachments', 'due_date', 'start_date',
            'cover_color', 'cover_image', 'custom_field_values',
            'created_by', 'created_at', 'updated_at', 'label_ids'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_list(self, obj):
        return {
            'id': obj.list.id,
            'title': obj.list.title,
            'board': obj.list.board.id
        }

    def create(self, validated_data):
        label_ids = validated_data.pop('label_ids', [])
        card = Card.objects.create(**validated_data)

        if label_ids:
            labels = Label.objects.filter(
                id__in=label_ids, board=card.list.board)
            card.labels.set(labels)

        return card

    def update(self, instance, validated_data):
        label_ids = validated_data.pop('label_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if label_ids is not None:
            labels = Label.objects.filter(
                id__in=label_ids, board=instance.list.board)
            instance.labels.set(labels)

        return instance


class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    board = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = List
        fields = ['id', 'title', 'board', 'position', 'archived',
                  'cards', 'created_at', 'updated_at']
        read_only_fields = ['id', 'board', 'created_at', 'updated_at']


class BoardMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    username = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = BoardMember
        fields = ['id', 'user', 'username', 'role', 'joined_at']
        read_only_fields = ['id', 'user', 'joined_at']


class CustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomField
        fields = ['id', 'name', 'field_type', 'options',
                  'required', 'position', 'created_at']
        read_only_fields = ['id', 'created_at']


class BoardTemplateSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = BoardTemplate
        fields = ['id', 'name', 'description', 'board_data',
                  'is_public', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class BoardSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = BoardMemberSerializer(many=True, read_only=True)
    lists = ListSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)
    custom_fields = CustomFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = [
            'id', 'title', 'description', 'owner', 'members',
            'lists', 'labels', 'custom_fields', 'visibility', 'background_color', 'background_image',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']


class BoardCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = ['title', 'description']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name',
                  'last_name', 'password', 'password_confirm']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class CardMoveSerializer(serializers.Serializer):
    card_id = serializers.IntegerField()
    list_id = serializers.IntegerField()
    position = serializers.FloatField()
