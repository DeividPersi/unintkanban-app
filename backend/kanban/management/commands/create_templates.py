from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from kanban.models import BoardTemplate


class Command(BaseCommand):
    help = 'Create sample board templates'

    def handle(self, *args, **options):
        # Get or create a superuser for templates
        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_superuser': True,
                'is_staff': True
            }
        )
        if created:
            user.set_password('admin')
            user.save()

        # Template 1: Kanban Básico
        kanban_basic_data = {
            'title': 'Kanban Básico',
            'description': 'Um quadro kanban simples com listas básicas',
            'visibility': 'private',
            'background_color': 'blue',
            'lists': [
                {
                    'title': 'A Fazer',
                    'position': 0,
                    'cards': [
                        {'title': 'Tarefa 1',
                            'description': 'Primeira tarefa a completar', 'position': 0},
                        {'title': 'Tarefa 2',
                            'description': 'Segunda tarefa a completar', 'position': 1},
                    ]
                },
                {
                    'title': 'Em Progresso',
                    'position': 1,
                    'cards': [
                        {'title': 'Tarefa 3',
                            'description': 'Atualmente trabalhando nisto', 'position': 0},
                    ]
                },
                {
                    'title': 'Concluído',
                    'position': 2,
                    'cards': [
                        {'title': 'Tarefa 4',
                            'description': 'Tarefa concluída', 'position': 0},
                    ]
                }
            ],
            'labels': [
                {'name': 'Alta Prioridade', 'color': 'red'},
                {'name': 'Média Prioridade', 'color': 'yellow'},
                {'name': 'Baixa Prioridade', 'color': 'green'},
                {'name': 'Bug', 'color': 'red'},
                {'name': 'Funcionalidade', 'color': 'blue'},
            ]
        }

        template1, created = BoardTemplate.objects.get_or_create(
            name='Kanban Básico',
            defaults={
                'description': 'Um quadro kanban simples com listas A Fazer, Em Progresso e Concluído',
                'board_data': kanban_basic_data,
                'is_public': True,
                'created_by': user
            }
        )

        # Template 2: Calendário de Conteúdo
        content_calendar_data = {
            'title': 'Calendário de Conteúdo',
            'description': 'Planeje e organize sua criação de conteúdo',
            'visibility': 'private',
            'background_color': 'green',
            'lists': [
                {
                    'title': 'Ideias',
                    'position': 0,
                    'cards': [
                        {'title': 'Post no blog sobre React',
                            'description': 'Escrever sobre melhores práticas do React', 'position': 0},
                        {'title': 'Tutorial em vídeo',
                            'description': 'Criar um vídeo sobre Django', 'position': 1},
                    ]
                },
                {
                    'title': 'Planejamento',
                    'position': 1,
                    'cards': [
                        {'title': 'Fase de pesquisa',
                            'description': 'Coletar informações e recursos', 'position': 0},
                    ]
                },
                {
                    'title': 'Em Progresso',
                    'position': 2,
                    'cards': [
                        {'title': 'Escrevendo conteúdo',
                            'description': 'Atualmente escrevendo o post do blog', 'position': 0},
                    ]
                },
                {
                    'title': 'Revisão',
                    'position': 3,
                    'cards': [
                        {'title': 'Revisão de texto',
                            'description': 'Revisar e editar conteúdo', 'position': 0},
                    ]
                },
                {
                    'title': 'Publicado',
                    'position': 4,
                    'cards': [
                        {'title': 'Ao vivo no site',
                            'description': 'Conteúdo está ao vivo e publicado', 'position': 0},
                    ]
                }
            ],
            'labels': [
                {'name': 'Blog', 'color': 'blue'},
                {'name': 'Vídeo', 'color': 'red'},
                {'name': 'Mídia Social', 'color': 'purple'},
                {'name': 'Newsletter', 'color': 'green'},
            ]
        }

        template2, created = BoardTemplate.objects.get_or_create(
            name='Calendário de Conteúdo',
            defaults={
                'description': 'Planeje e organize seu fluxo de criação de conteúdo',
                'board_data': content_calendar_data,
                'is_public': True,
                'created_by': user
            }
        )

        # Template 3: Gerenciamento de Projetos
        project_management_data = {
            'title': 'Gerenciamento de Projetos',
            'description': 'Gerencie seus projetos do início ao fim',
            'visibility': 'private',
            'background_color': 'purple',
            'lists': [
                {
                    'title': 'Backlog',
                    'position': 0,
                    'cards': [
                        {'title': 'Pesquisa de usuários',
                            'description': 'Realizar entrevistas com usuários', 'position': 0},
                        {'title': 'Mockups de design',
                            'description': 'Criar wireframes e designs', 'position': 1},
                    ]
                },
                {
                    'title': 'Planejamento de Sprint',
                    'position': 1,
                    'cards': [
                        {'title': 'Planejamento Sprint 1',
                            'description': 'Planejar tarefas da primeira sprint', 'position': 0},
                    ]
                },
                {
                    'title': 'Em Progresso',
                    'position': 2,
                    'cards': [
                        {'title': 'Desenvolver funcionalidade A',
                            'description': 'Implementar a funcionalidade principal', 'position': 0},
                    ]
                },
                {
                    'title': 'Testes',
                    'position': 3,
                    'cards': [
                        {'title': 'Testes de QA',
                            'description': 'Testar toda a funcionalidade', 'position': 0},
                    ]
                },
                {
                    'title': 'Implantado',
                    'position': 4,
                    'cards': [
                        {'title': 'Release de produção',
                            'description': 'Funcionalidade está ao vivo em produção', 'position': 0},
                    ]
                }
            ],
            'labels': [
                {'name': 'Frontend', 'color': 'blue'},
                {'name': 'Backend', 'color': 'green'},
                {'name': 'Design', 'color': 'purple'},
                {'name': 'Testes', 'color': 'yellow'},
                {'name': 'Documentação', 'color': 'gray'},
            ]
        }

        template3, created = BoardTemplate.objects.get_or_create(
            name='Gerenciamento de Projetos',
            defaults={
                'description': 'Fluxo completo de gerenciamento de projetos do backlog à implantação',
                'board_data': project_management_data,
                'is_public': True,
                'created_by': user
            }
        )

        self.stdout.write(
            self.style.SUCCESS('Successfully created board templates')
        )
