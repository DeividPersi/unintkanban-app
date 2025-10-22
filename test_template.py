from django.contrib.auth.models import User
from kanban.models import BoardTemplate, Board, BoardMember, List, Card, Label
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()


# Get template and user
template = BoardTemplate.objects.get(id=1)
user = User.objects.first()
print('Template:', template.name)
print('User:', user.username)

# Test creating board manually
try:
    board_data = template.board_data
    board = Board.objects.create(
        title=f"{template.name} - {board_data.get('title', 'New Board')}",
        description=board_data.get('description', ''),
        owner=user,
        visibility=board_data.get('visibility', 'private'),
        background_color=board_data.get('background_color', 'blue')
    )
    print('Board created:', board.id, board.title)

    # Add the creator as a member
    BoardMember.objects.create(
        board=board,
        user=user,
        role='owner'
    )
    print('Member added')

    # Create lists
    lists_data = board_data.get('lists', [])
    for list_data in lists_data:
        list_obj = List.objects.create(
            title=list_data['title'],
            board=board,
            position=list_data.get('position', 0)
        )
        print(f'List created: {list_obj.title}')

        # Create cards for this list
        cards_data = list_data.get('cards', [])
        for card_data in cards_data:
            Card.objects.create(
                title=card_data['title'],
                description=card_data.get('description', ''),
                list=list_obj,
                position=card_data.get('position', 0),
                created_by=user
            )
            print(f'Card created: {card_data["title"]}')

    # Create labels
    labels_data = board_data.get('labels', [])
    for label_data in labels_data:
        Label.objects.create(
            name=label_data['name'],
            color=label_data.get('color', 'blue'),
            board=board
        )
        print(f'Label created: {label_data["name"]}')

    print('SUCCESS: Board created from template!')

except Exception as e:
    print('Error creating board:', str(e))
    import traceback
    traceback.print_exc()
