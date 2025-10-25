from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'Create a superuser for the application'

    def handle(self, *args, **options):
        # Verificar se já existe um superusuário
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.WARNING('Superusuário já existe!')
            )
            return

        # Criar superusuário com dados padrão
        username = os.environ.get('SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('SUPERUSER_EMAIL', 'admin@unintkanban.com')
        password = os.environ.get('SUPERUSER_PASSWORD', 'admin123')

        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superusuário criado com sucesso!')
            )
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: {password}')
            self.stdout.write('')
            self.stdout.write('Acesse: https://kanban-app-unint.onrender.com/admin/')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Erro ao criar superusuário: {e}')
            )
