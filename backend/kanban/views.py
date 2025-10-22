from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.db import transaction, models
import os
from .models import Board, BoardMember, List, Card, Label, Comment, CommentReaction, Checklist, ChecklistItem, Attachment, CustomField, CustomFieldValue, BoardTemplate
from .serializers import (
    BoardSerializer, BoardCreateSerializer, BoardMemberSerializer,
    ListSerializer, CardSerializer, LabelSerializer, CommentSerializer, CommentReactionSerializer,
    ChecklistSerializer, ChecklistItemSerializer, AttachmentSerializer,
    CustomFieldSerializer, CustomFieldValueSerializer, BoardTemplateSerializer,
    UserRegistrationSerializer, CardMoveSerializer
)
from .permissions import IsBoardMember, IsBoardOwnerOrAdmin


class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user_id': user.id,
                'username': user.username
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return boards where user is a member
        return Board.objects.filter(
            members__user=self.request.user
        ).distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return BoardCreateSerializer
        return BoardSerializer

    def perform_create(self, serializer):
        board = serializer.save(owner=self.request.user)
        # Add owner as board member
        BoardMember.objects.create(
            board=board,
            user=self.request.user,
            role='owner'
        )

    def get_board(self):
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return self.get_object()
        return None

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        board = self.get_object()
        username = request.data.get('username')
        role = request.data.get('role', 'member')

        if not username:
            return Response(
                {'error': 'Username is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is already a member
        if board.members.filter(user=user).exists():
            return Response(
                {'error': 'User is already a member'},
                status=status.HTTP_400_BAD_REQUEST
            )

        BoardMember.objects.create(board=board, user=user, role=role)
        return Response({'message': 'Member added successfully'})

    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        board = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'User ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            membership = board.members.get(user_id=user_id)
            membership.delete()
            return Response({'message': 'Member removed successfully'})
        except BoardMember.DoesNotExist:
            return Response(
                {'error': 'Member not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ListViewSet(viewsets.ModelViewSet):
    queryset = List.objects.all()
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        return List.objects.filter(board_id=board_id, archived=False)

    def get_board(self):
        board_id = self.kwargs.get('board_pk')
        try:
            return Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return None

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_pk')
        board = Board.objects.get(id=board_id)
        serializer.save(board=board)

    def perform_update(self, serializer):
        # If position is being updated, we'll handle it in the serializer
        # The frontend now handles bulk position updates
        serializer.save()


class ReorderListsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, board_pk):
        """Reorder all lists in a board"""
        try:
            board = Board.objects.get(id=board_pk)

            # Check if user has permission to access this board
            if not BoardMember.objects.filter(
                board=board,
                user=request.user
            ).exists():
                return Response(
                    {'error': 'You do not have permission to access this board'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get the new order from request data
            list_orders = request.data.get('list_orders', [])

            if not list_orders:
                return Response(
                    {'error': 'list_orders is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update positions for all lists
            for order_data in list_orders:
                list_id = order_data.get('id')
                position = order_data.get('position')

                if list_id and position is not None:
                    List.objects.filter(id=list_id, board=board).update(
                        position=position)

            return Response({
                'message': 'Lists reordered successfully'
            })

        except Board.DoesNotExist:
            return Response(
                {'error': 'Board not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ArchiveAllCardsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, list_pk):
        """Archive all cards in a specific list"""
        try:
            list_obj = List.objects.get(id=list_pk)

            # Check if user has permission to access this list's board
            if not BoardMember.objects.filter(
                board=list_obj.board,
                user=request.user
            ).exists():
                return Response(
                    {'error': 'You do not have permission to access this board'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get all cards in this list that are not already archived
            cards = Card.objects.filter(list=list_obj, archived=False)

            # Archive all cards
            cards.update(archived=True)

            return Response({
                'message': f'Archived {cards.count()} cards from list "{list_obj.title}"'
            })

        except List.DoesNotExist:
            return Response(
                {'error': 'List not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        list_id = self.kwargs.get('list_pk')
        board_id = self.kwargs.get('board_pk')

        if list_id:
            return Card.objects.filter(list_id=list_id, archived=False)
        elif board_id:
            return Card.objects.filter(list__board_id=board_id, archived=False)
        return Card.objects.filter(archived=False)

    def get_board(self):
        list_id = self.kwargs.get('list_pk')
        if list_id:
            try:
                list_obj = List.objects.get(id=list_id)
                return list_obj.board
            except List.DoesNotExist:
                return None

        # For individual card access
        card_id = self.kwargs.get('pk')
        if card_id:
            try:
                card = Card.objects.get(id=card_id)
                return card.list.board
            except Card.DoesNotExist:
                return None

        return None

    def perform_create(self, serializer):
        list_id = self.kwargs.get('list_pk')
        list_obj = List.objects.get(id=list_id)
        serializer.save(list=list_obj, created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def move(self, request):
        serializer = CardMoveSerializer(data=request.data)
        if serializer.is_valid():
            card_id = serializer.validated_data['card_id']
            list_id = serializer.validated_data['list_id']
            position = serializer.validated_data['position']

            try:
                with transaction.atomic():
                    card = Card.objects.get(id=card_id)
                    new_list = List.objects.get(id=list_id)

                    # Check if user has permission to access both boards
                    if not (card.list.board.members.filter(user=request.user).exists() and
                            new_list.board.members.filter(user=request.user).exists()):
                        return Response(
                            {'error': 'Permission denied'},
                            status=status.HTTP_403_FORBIDDEN
                        )

                    card.list = new_list
                    card.position = position
                    card.save()

                    return Response({'message': 'Card moved successfully'})
            except (Card.DoesNotExist, List.DoesNotExist):
                return Response(
                    {'error': 'Card or List not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LabelViewSet(viewsets.ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        return Label.objects.filter(board_id=board_id)

    def get_board(self):
        board_id = self.kwargs.get('board_pk')
        try:
            return Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return None

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_pk')
        board = Board.objects.get(id=board_id)
        serializer.save(board=board)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        card_id = self.kwargs.get('card_pk')
        return Comment.objects.filter(card_id=card_id)

    def get_board(self):
        card_id = self.kwargs.get('card_pk')
        try:
            card = Card.objects.get(id=card_id)
            return card.list.board
        except Card.DoesNotExist:
            return None

    def perform_create(self, serializer):
        card_id = self.kwargs.get('card_pk')
        card = Card.objects.get(id=card_id)
        serializer.save(card=card, author=self.request.user)


class ChecklistViewSet(viewsets.ModelViewSet):
    queryset = Checklist.objects.all()
    serializer_class = ChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        card_id = self.kwargs.get('card_pk')
        return Checklist.objects.filter(card_id=card_id)

    def get_board(self):
        card_id = self.kwargs.get('card_pk')
        try:
            card = Card.objects.get(id=card_id)
            return card.list.board
        except Card.DoesNotExist:
            return None

    def perform_create(self, serializer):
        card_id = self.kwargs.get('card_pk')
        card = Card.objects.get(id=card_id)
        serializer.save(card=card)


class ChecklistItemViewSet(viewsets.ModelViewSet):
    queryset = ChecklistItem.objects.all()
    serializer_class = ChecklistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        checklist_id = self.kwargs.get('checklist_pk')
        return ChecklistItem.objects.filter(checklist_id=checklist_id)

    def get_board(self):
        checklist_id = self.kwargs.get('checklist_pk')
        try:
            checklist = Checklist.objects.get(id=checklist_id)
            return checklist.card.list.board
        except Checklist.DoesNotExist:
            return None

    def perform_create(self, serializer):
        checklist_id = self.kwargs.get('checklist_pk')
        checklist = Checklist.objects.get(id=checklist_id)
        serializer.save(checklist=checklist)


class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    # Temporarily changed for debugging
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        card_id = self.kwargs.get('card_pk')
        return Attachment.objects.filter(card_id=card_id)

    def get_board(self):
        card_id = self.kwargs.get('card_pk')
        try:
            card = Card.objects.get(id=card_id)
            return card.list.board
        except Card.DoesNotExist:
            return None

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: AttachmentViewSet.create called")
        print(f"DEBUG: Request data: {request.data}")
        print(f"DEBUG: Request FILES: {request.FILES}")
        print(f"DEBUG: Card ID: {kwargs.get('card_pk')}")

        try:
            response = super().create(request, *args, **kwargs)
            print(f"DEBUG: Create successful: {response.status_code}")
            return response
        except Exception as e:
            print(f"DEBUG: Create failed with error: {e}")
            print(f"DEBUG: Error type: {type(e)}")
            raise

    def perform_create(self, serializer):
        card_id = self.kwargs.get('card_pk')
        card = Card.objects.get(id=card_id)
        file = self.request.FILES.get('file')

        print(f"DEBUG: Creating attachment for card {card_id}")
        print(f"DEBUG: File: {file}")
        print(f"DEBUG: User: {self.request.user}")
        print(f"DEBUG: Data: {serializer.validated_data}")

        if file:
            # Truncate filename if too long (Django FileField has 100 char limit)
            original_name = file.name
            if len(original_name) > 100:
                name, ext = os.path.splitext(original_name)
                truncated_name = name[:95] + ext  # Keep extension
                file.name = truncated_name
                print(
                    f"DEBUG: Filename truncated from '{original_name}' to '{truncated_name}'")

            print(
                f"DEBUG: File details - name: {file.name}, size: {file.size}, content_type: {file.content_type}")
            serializer.save(
                card=card,
                uploaded_by=self.request.user,
                name=file.name,
                size=file.size,
                content_type=file.content_type
            )
            print(f"DEBUG: Attachment created successfully")
        else:
            print(f"DEBUG: No file provided")
            from rest_framework import serializers
            raise serializers.ValidationError(
                {'file': 'Arquivo é obrigatório'})


class BoardMemberViewSet(viewsets.ModelViewSet):
    queryset = BoardMember.objects.all()
    serializer_class = BoardMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardOwnerOrAdmin]

    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        return BoardMember.objects.filter(board_id=board_id)

    def get_board(self):
        board_id = self.kwargs.get('board_pk')
        try:
            return Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return None

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_pk')
        board = Board.objects.get(id=board_id)

        # Get user by username
        username = serializer.validated_data.pop('username', None)
        print(
            f"DEBUG: Creating member with username={username}, data={serializer.validated_data}")

        if username:
            from django.contrib.auth.models import User
            try:
                user = User.objects.get(username=username)
                print(f"DEBUG: User found: {user.username}")
                serializer.save(board=board, user=user)
                print(f"DEBUG: Member created successfully")
            except User.DoesNotExist:
                print(f"DEBUG: User not found: {username}")
                from rest_framework import serializers
                raise serializers.ValidationError(
                    {'username': 'Usuário não encontrado'})
        else:
            print(f"DEBUG: No username provided")
            serializer.save(board=board)


class CommentReactionViewSet(viewsets.ModelViewSet):
    queryset = CommentReaction.objects.all()
    serializer_class = CommentReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        comment_id = self.kwargs.get('comment_pk')
        return CommentReaction.objects.filter(comment_id=comment_id)

    def perform_create(self, serializer):
        comment_id = self.kwargs.get('comment_pk')
        comment = Comment.objects.get(id=comment_id)
        emoji = serializer.validated_data.get('emoji')

        # Check if user already reacted with this emoji
        existing_reaction = CommentReaction.objects.filter(
            comment=comment, user=self.request.user, emoji=emoji
        ).first()

        if existing_reaction:
            # Remove existing reaction
            existing_reaction.delete()
            return Response({'message': 'Reaction removed'}, status=status.HTTP_200_OK)
        else:
            # Add new reaction
            serializer.save(comment=comment, user=self.request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomFieldViewSet(viewsets.ModelViewSet):
    queryset = CustomField.objects.all()
    serializer_class = CustomFieldSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        board_id = self.kwargs.get('board_pk')
        return CustomField.objects.filter(board_id=board_id)

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_pk')
        board = Board.objects.get(id=board_id)
        serializer.save(board=board)


class CustomFieldValueViewSet(viewsets.ModelViewSet):
    queryset = CustomFieldValue.objects.all()
    serializer_class = CustomFieldValueSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        card_id = self.kwargs.get('card_pk')
        return CustomFieldValue.objects.filter(card_id=card_id)

    def perform_create(self, serializer):
        card_id = self.kwargs.get('card_pk')
        card = Card.objects.get(id=card_id)
        serializer.save(card=card)


class BoardTemplateViewSet(viewsets.ModelViewSet):
    queryset = BoardTemplate.objects.all()
    serializer_class = BoardTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.action == 'list':
            # Return public templates and user's own templates
            return BoardTemplate.objects.filter(
                models.Q(is_public=True) | models.Q(
                    created_by=self.request.user)
            )
        return BoardTemplate.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create_board(self, request, pk=None):
        """Create a new board from a template"""
        try:
            template = self.get_object()
            board_data = template.board_data

            # Create the board
            board = Board.objects.create(
                title=f"{template.name} - {board_data.get('title', 'New Board')}",
                description=board_data.get('description', ''),
                owner=request.user,
                visibility=board_data.get('visibility', 'private'),
                background_color=board_data.get('background_color', 'blue')
            )

            # Add the creator as a member
            BoardMember.objects.create(
                board=board,
                user=request.user,
                role='owner'
            )

            # Create lists
            lists_data = board_data.get('lists', [])
            for list_data in lists_data:
                list_obj = List.objects.create(
                    title=list_data['title'],
                    board=board,
                    position=list_data.get('position', 0)
                )

                # Create cards for this list
                cards_data = list_data.get('cards', [])
                for card_data in cards_data:
                    Card.objects.create(
                        title=card_data['title'],
                        description=card_data.get('description', ''),
                        list=list_obj,
                        position=card_data.get('position', 0),
                        created_by=request.user
                    )

            # Create labels
            labels_data = board_data.get('labels', [])
            for label_data in labels_data:
                Label.objects.create(
                    name=label_data['name'],
                    color=label_data.get('color', 'blue'),
                    board=board
                )

            return Response({
                'message': 'Board created successfully from template',
                'board_id': board.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': f'Failed to create board from template: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateBoardFromTemplateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, template_id):
        """Create a new board from a template"""
        try:
            template = BoardTemplate.objects.get(id=template_id)
            board_data = template.board_data

            # Create the board
            board = Board.objects.create(
                title=f"{template.name} - {board_data.get('title', 'New Board')}",
                description=board_data.get('description', ''),
                owner=request.user,
                visibility=board_data.get('visibility', 'private'),
                background_color=board_data.get('background_color', 'blue')
            )

            # Add the creator as a member
            BoardMember.objects.create(
                board=board,
                user=request.user,
                role='owner'
            )

            # Create lists
            lists_data = board_data.get('lists', [])
            for list_data in lists_data:
                list_obj = List.objects.create(
                    title=list_data['title'],
                    board=board,
                    position=list_data.get('position', 0)
                )

                # Create cards for this list
                cards_data = list_data.get('cards', [])
                for card_data in cards_data:
                    Card.objects.create(
                        title=card_data['title'],
                        description=card_data.get('description', ''),
                        list=list_obj,
                        position=card_data.get('position', 0),
                        created_by=request.user
                    )

            # Create labels
            labels_data = board_data.get('labels', [])
            for label_data in labels_data:
                Label.objects.create(
                    name=label_data['name'],
                    color=label_data.get('color', 'blue'),
                    board=board
                )

            return Response({
                'message': 'Board created successfully from template',
                'board_id': board.id
            }, status=status.HTTP_201_CREATED)

        except BoardTemplate.DoesNotExist:
            return Response(
                {'error': 'Template not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Failed to create board from template: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
