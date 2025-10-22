from rest_framework import permissions


class IsBoardMember(permissions.BasePermission):
    """
    Custom permission to only allow board members to access board resources.
    """

    def has_permission(self, request, view):
        # Allow authenticated users to access the view
        if not request.user or not request.user.is_authenticated:
            return False

        # For checklist operations, check if user is member of the board
        if hasattr(view, 'get_board'):
            board = view.get_board()
            if board:
                return board.members.filter(user=request.user).exists()

        return True

    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the board
        if hasattr(obj, 'board'):
            board = obj.board
        elif hasattr(obj, 'list') and hasattr(obj.list, 'board'):
            board = obj.list.board
        elif hasattr(obj, 'card') and hasattr(obj.card, 'list') and hasattr(obj.card.list, 'board'):
            board = obj.card.list.board
        else:
            return False

        return board.members.filter(user=request.user).exists()


class IsBoardOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow board owners and admins to modify board settings.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if hasattr(view, 'get_board'):
            board = view.get_board()
            if board:
                membership = board.members.filter(user=request.user).first()
                if membership:
                    return membership.role in ['owner', 'admin']

        return True

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'board'):
            board = obj.board
        elif hasattr(obj, 'list') and hasattr(obj.list, 'board'):
            board = obj.list.board
        else:
            return False

        membership = board.members.filter(user=request.user).first()
        if membership:
            return membership.role in ['owner', 'admin']

        return False
