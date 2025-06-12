# Iniciar container
docker-compose up -d
docker-compose down -v

# Acessar DB
docker exec -it redis-cache redis-cli