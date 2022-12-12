# Node-Redis-Nginx LoadBalancer Docker

레디스를 사용한 Node App 로드밸런서 도커 예제 

참고 [Dockerizing a NodeJS , Express, Redis with Nginx Proxy using Docker Compose](https://dev.to/docker/dockerizing-a-nodejs-express-redis-app-with-nginx-proxy-using-docker-compose-17ge)

- [깃허브/test-docker-nodejs-redis-nginx](https://github.com/marcelkatz/test-docker-nodejs-redis-nginx)

## 1. 실행

WEB1 과 WEB2 가 nginx 의 로드밸런서 설정에 따라 번갈아가며 호출됨

```bash
$ docker-compose up
# ...
web1_1   | Web app is listening on port 5000
web1_1   | Connected to redis://redis
web2_1   | Web app is listening on port 5000
web2_1   | Connected to redis://redis

$ curl -X GET "http://localhost:80"
WEB1: Total number of visits is: 1%
$ curl -X GET "http://localhost:80"
WEB2: Total number of visits is: 2%
$ curl -X GET "http://localhost:81"
WEB1: Total number of visits is: 3%
$ curl -X GET "http://localhost:82"
WEB2: Total number of visits is: 4%
$ curl -X GET "http://localhost:80"
WEB1: Total number of visits is: 5%

$ docker-compose down --rmi local
Removing nginx-proxy_nginx_1 ... done
Removing nginx-proxy_web2_1  ... done
Removing nginx-proxy_redis_1 ... done
Removing nginx-proxy_web1_1  ... done
Removing network nginx-proxy_default
```

## 2. 패키지, 라이브러리

### 1) package

- node 18
- redis 7
- nginx 1.22

### 2) node app

- apt-get install [redis](https://redis.io/)
- mkdir nginx-redis && cd nginx-redis
- npm init
- npm i [redis](https://github.com/redis/node-redis)

### 3) nginx.conf

```conf
upstream loadbalancer {
  server web1:5000;
  server web2:5000;
}

server {
  listen 80;
  server_name localhost;
  location / {
    proxy_pass http://loadbalancer;

    proxy_buffer_size          128k;
    proxy_buffers              4 256k;
    proxy_busy_buffers_size    256k;    
  }
}
```

## 3. 도커

### 1) 디렉토리

- docker-compose.yml
- nginx
  + nginx.conf
  + Dockerfile
- web1
  + package.json
  + server.js
- web2
  + package.json
  + server.js

### 2) docker-compose.yml

```yaml
version: '3.9'
services:
  redis:
    container_name: cache
    image: 'redis:alpine'
    ports:
      - '6379:6379'
  web1:
    restart: on-failure
    build: ./web1
    ports:
      - '81:5000'
    environment:
      - NODE_ENV=development
      - PORT=5000
      - REDIS_URL=redis://redis
  web2:
    restart: on-failure
    build: ./web2
    ports:
      - '82:5000'
    environment:
      - NODE_ENV=development
      - PORT=5000
      - REDIS_URL=redis://redis
  nginx:
    build: ./nginx
    ports:
      - '80:80'
    depends_on:
      - web1
      - web2
```

### 3) single-test.yml

웹앱 한개만 연결하여 테스트

## 4. node app

- app 서버 실행 후
- redis 서버에 접속하여 numVisits 카운팅
