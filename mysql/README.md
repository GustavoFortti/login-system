# Iniciar container
docker-compose up -d
docker-compose down -v

# Executar DDL
docker exec -i mysql-db mysql -u myuser -pmypassword mydatabase < ddl.sql

# Acessar DB
docker exec -it mysql-db mysql -umyuser -pmypassword mydatabase

# Remover container
docker rm mysql-db --force